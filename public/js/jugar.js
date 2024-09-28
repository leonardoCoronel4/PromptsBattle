window.onload = async function () {
    const socket = io.connect();
    socket.on(`cargarPartidas`, () => {
        verificarAuth()
    });
};
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
            matchList[0].innerHTML = "";
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
                li.innerHTML = `<div class="divNombresListado">${match.playerOne
                    ? '<span style="color:cyan;">' +
                    match.playerOne +
                    "&nbsp;" +
                    "</span>"
                    : "Esperando jugador..."
                    } vs ${match.playerTwo
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

function validarCreacionPartida() {
    const topicSelect = document.getElementById("topicSelect");
    const selectedTopic = topicSelect.value;
    const selectedRadio = document.querySelector(
        'input[name="radio-group"]:checked'
    );

    if (!selectedTopic || selectedTopic === "SELECCIONE UN TEMA") {
        const errorDivTopic = document.getElementById("errorSelectingTopic");
        errorDivTopic.classList.add("error-message");
        errorDivTopic.innerHTML = "Debe seleccionar un tema para la partida";
        setTimeout(() => {
            errorDivTopic.innerHTML = "";
        }, 4000);
    } else if (!selectedRadio) {
        const errorDivTime = document.getElementById("errorSelectingTime");
        errorDivTime.classList.add("error-message");
        errorDivTime.innerHTML =
            "Debe seleccionar una duración para la partida";
        setTimeout(() => {
            errorDivTime.innerHTML = "";
        }, 4000);
    }

    createMatch();
}

async function createMatch() {
    let topic = document.getElementById("topicSelect").value;
    let duration = document.querySelector(
        'input[name="radio-group"]:checked'
    ).value;
    try {
        const response = await fetch("/api/match/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                topic: topic,
                time: duration,
            }),
        });
        if (!response.ok) {
            let resStat = JSON.stringify(response.status);
            throw new Error("Error al crear la partida: " + resStat);
        }
        const socket = io.connect();
        socket.emit("hacerCargarPartidas");
        document.querySelector("#closeCreateMatchButton").click();
    } catch (error) {
        console.error(error);
    }
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
                socket.emit("hacerCargarPartidas");
            } else if (match.playerTwo === null) {
                socket.on("joinMatch", function (data) {
                    if (match.playerOneSession === data.id) {
                        window.location.href = `/match/${match._id}`;
                    } else {
                        agregarJugador(matchId, data.name, data.id, false);
                    }
                });
                socket.emit("hacerCargarPartidas");
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
            var socket = io.connect();
            socket.on("connect", () => {
                socket.emit("iniciarPartida", {
                    playerOneSession: response.playerOneSession,
                    playerTwoSession: response.playerTwoSession,
                    matchId: matchId,
                });
                socket.emit(`matchTimer`, matchId, response.time);
                socket.emit("hacerCargarPartidas");
            });
        } else {
            console.error("Error al actualizar la partida:", this.responseText);
        }
    };

    xhttp.onerror = function () {
        alert("Error en la solicitud.");
    };

    let data = JSON.stringify({
        state: "Iniciada",
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

function mostrarNavbarAutenticado() {
    const navbar = document.querySelector(".navbar");
    navbar.innerHTML = `
    <button onclick="loadTopics()" data-bs-toggle="modal" data-bs-target="#createMatchModal" class="adminButton">Crear Partida</button>
    <button data-bs-toggle="modal" data-bs-target="#createTopicModal" class="adminButton">Crear tema</button>
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

async function createTopic() {
    let topicName = document.getElementById("topic").value;
    try {
        const response = await fetch("/topic/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: topicName,
            }),
        });
        if (!response.ok) {
            let resStat = JSON.stringify(response.status);
            throw new Error("Error al cargar temas: " + resStat);
        }
    } catch (error) {
        console.error(error);
    }
}

async function loadTopics() {
    const topicList = document.getElementsByName("topicSelect");
    topicList[0].innerHTML = "";
    let optDefault = document.createElement("option");
    optDefault.innerText = `SELECCIONE UN TEMA`;
    optDefault.setAttribute("disabled", true);
    optDefault.selected = true;
    topicList[0].appendChild(optDefault);
    try {
        {
            fetch("topic/")
                .then((response) => response.json())
                .then((topics) => {
                    topics.forEach((topic) => {
                        const opt = document.createElement("option");
                        opt.innerHTML = `${topic.name}`;
                        topicList[0].appendChild(opt);
                    });
                });
        }
    } catch (error) {
        console.error(error);
    }
}