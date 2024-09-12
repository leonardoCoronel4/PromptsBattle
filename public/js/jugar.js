function verificarAuth() {
  fetch("/api/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((data) => {
      if (data && data.id) {
        cargarPartidas(true);
        mostrarNavbarAutenticado();
      } else {
        cargarPartidas(false);
        mostrarNavbarNoAutenticado();
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

function mostrarNavbarAutenticado() {
  const navbar = document.getElementById("navbar");
  navbar.innerHTML = `
    <a href="#">Crear Partida</a>
    <a href="#">Crear tema</a>
    <a href="/logout">Salir</a>
  `;
}

function mostrarNavbarNoAutenticado() {
  const navbar = document.getElementById("navbar");
  navbar.innerHTML = '<div id="welcome"></div>';
  username();
}

function username() {
  var welcome = document.getElementById("welcome");
  var socket = io.connect();
  socket.on("welcome", function (data) {
    welcome.innerHTML = "<strong>" + data.name + "</strong>";
  });
}

function cargarPartidas(verified) {
  fetch("api/match/pending")
    .then((response) => response.json())
    .then((matches) => {
      const matchList = document.getElementsByName("matchList");
      matches.forEach((match) => {
        const li = document.createElement("li");
        let buttonAction = "";
        const matchId = match._id;
        if (match.state == "Iniciada") {
          buttonAction = `<button class="botonLobbyVer" id="ver_${matchId}">Ver</button>`;
        } else if (match.playerOne == null || match.playerTwo == null) {
          buttonAction = `<button class="botonLobbyUnirse" id="unirse_${matchId}" onclick="">Unirse</button>`;
        } else if (verified) {
          buttonAction = `<button class="botonLobby" id="iniciar_${matchId}" onclick="">Iniciar</button>`;
        } else {
          buttonAction = `<p class="textoLobby">En espera</p>`;
        }
        li.className = "listaUser";
        li.innerHTML = `<div class="divNombresListado">${
          match.playerOne
            ? '<span style="color:cyan;">' +
              match.playerOne +
              "&nbsp;" +
              "</span>"
            : "Esperando jugador..."
        } vs ${
          match.playerTwo
            ? '<span style="color:fuchsia;">' +
              "&nbsp;" +
              match.playerTwo +
              "</span>"
            : "Esperando jugador..."
        }</div>
        <div class="divBotonListado"> ${buttonAction} </div>`;
        matchList[0].appendChild(li);

        if (match.state === "Iniciada") {
          document
            .getElementById(`ver_${matchId}`)
            .addEventListener("click", () => verMatch(matchId));
        } else if (match.playerOne == null || match.playerTwo == null) {
          document
            .getElementById(`unirse_${matchId}`)
            .addEventListener("click", () => unirseMatch(matchId));
        } else if (verified) {
          document
            .getElementById(`iniciar_${matchId}`)
            .addEventListener("click", () => iniciarMatch(matchId));
        }
      });
    });
}

function verMatch(matchId) {
  window.location.href = `/match/${matchId}`;
}

function unirseMatch(matchId) {
  fetch(`api/match/${matchId}`)
    .then((response) => response.json())
    .then((match) => {
      var socket = io.connect();
      if (match.playerOne === null) {
        socket.on("joinMatch", function (data) {
          agregarJugador(matchId, data.name, data.id, true);
        });
      } else if (match.playerTwo === null) {
        socket.on("joinMatch", function (data) {
          if (match.playerOneSession === data.id) {
            window.location.href = `/match/${match._id}`;
          } else {
            agregarJugador(matchId, data.name, data.id, false);
          }
        });
      }
    });
}

function iniciarMatch(matchId) { 
  let xhttp = new XMLHttpRequest();

  xhttp.open("PUT", `api/match/${matchId}`, true);
  xhttp.setRequestHeader("Content-Type", "application/json");

  xhttp.onload = function () {
    if (this.status == 200) {
      let response = JSON.parse(this.responseText);
      window.location.href = `/match/${matchId}`;
    } else {
      console.error("Error al actualizar la partida:", this.responseText);
    }
  };

  xhttp.onerror = function () {
    alert("Error en la solicitud.");
  };

  let data = JSON.stringify({
    state: 'Iniciada',
  });

  xhttp.send(data);
}

function agregarJugador(matchId, nombreJugador, sessionJugador, jugadorUno) {
  let details = "";
  if (jugadorUno) {
    details = {
      playerOne: nombreJugador,
      playerOneSession: sessionJugador,
    };
  } else {
    details = {
      playerTwo: nombreJugador,
      playerTwoSession: sessionJugador,
    };
  }
  var formBody = [];
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");

  fetch(`api/match/${matchId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: formBody,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("No se pudo actualizar la partida");
    })
    .then((updatedMatch) => {
      window.location.href = `/match/${updatedMatch._id}`;
    })
    .catch((error) => {
      console.error("Error al actualizar la partida:", error);
    });
}
