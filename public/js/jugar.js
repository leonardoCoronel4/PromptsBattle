document.addEventListener("DOMContentLoaded", function () {
  fetch("api/match/pending")
    .then((response) => response.json())
    .then((matches) => {
      const matchList = document.getElementsByName("matchList");
      matches.forEach((match) => {
        const li = document.createElement("li");
        let buttonAction = "";
        if (match.playerOne != null && match.playerTwo != null) {
          buttonAction = `<button class="botonLobbyVer" id="${match.id}">Ver</button>`;
        } else {
          buttonAction = `<button class="botonLobbyUnirse" id="${match.id}">Unirse</button>`;
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
      });
    });
});

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
        mostrarNavbarAutenticado();
      } else {
        mostrarNavbarNoAutenticado();
      }
    })
    .catch((error) => {
      console.log("Error:", error);
      mostrarNavbarNoAutenticado();
    });
}

function mostrarNavbarAutenticado() {
  const navbar = document.querySelector(".navbar");
  navbar.innerHTML = `
    <a href="#">Crear Partida</a>
    <a href="#">Crear tema</a>
    <a href="/logout">Salir</a>
  `;
}

function mostrarNavbarNoAutenticado() {
  const navbar = document.querySelector(".navbar");
  navbar.innerHTML = `
  <div id="welcome"></div> 
  `;
  username();
}

function username() {
  var welcome = document.getElementById("welcome");
  var socket = io.connect();
  socket.on("welcome", function (data) {
    welcome.innerHTML = "<strong>" + data.name + "</strong>";
  });
}
