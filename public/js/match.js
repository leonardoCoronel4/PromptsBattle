import { generatePromptImage } from "./API.js";
let imageSelected = "";
window.onload = async function () {
    await getMatch();
};

window.getAPIPictures = async function () {
    let prompt = document.getElementsByName("playerInput")[0].value;
    const botonGenerar = document.getElementById("finishButton");
    botonGenerar.disabled = true;
    setTimeout(function () {
        botonGenerar.disabled = false;
    }, 6000);

    for (let i = 1; i <= 3; i++) {
        let loaderContainer = document.getElementById(`loaderContainer${i}`);
        loaderContainer.classList.remove("hidden");
        loaderContainer.innerHTML = `<div id="loader${i}" class="blobs">
            <div class="blob-center"></div>
            <div class="blob"></div>
            <div class="blob"></div>
            <div class="blob"></div>
            <div class="blob"></div>
            <div class="blob"></div>
            <div class="blob"></div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
            <defs>
              <filter id="goo">
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="10"
                  result="blur"
                ></feGaussianBlur>
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                  result="goo"
                ></feColorMatrix>
                <feBlend in="SourceGraphic" in2="goo"></feBlend>
              </filter>
            </defs>
          </svg>`;
        let img = document.getElementById(`APIImg${i}`);
        let imgURL = generatePromptImage(prompt, i, false);
        img.src = imgURL;
        var socket = io.connect();

        const matchId = window.location.pathname.split("/")[2];
        socket.on("joinMatch", async function (data, matchData) {
            socket.emit(`playerImages${data.id}`, i, imgURL, data.id, matchId);
        });

        img.addEventListener("click", () => Seleccion(i));

        img.onload = function () {
            let loaderContainer = document.getElementById(
                `loaderContainer${i}`
            );
            loaderContainer.innerHTML = "";
            loaderContainer.classList.add("hidden");
        };

        img.onerror = function () {
            document.getElementById(`loader${i}`).classList.add("hidden");
            document.getElementById(`APIImg${i}`).src = "../images/error.png";
        };
    }
};

function Seleccion(imageId) {
    if (imageSelected !== "") {
        if (imageSelected === imageId) {
            let img = document.getElementById(`APIImg${imageSelected}`);
            if (img.classList.contains("imageSelect")) {
                img.classList.remove("imageSelect");
                imageSelected = "";
            } else {
                img.classList.add("imageSelect");
            }
        } else {
            let img = document.getElementById(`APIImg${imageSelected}`);
            img.classList.remove("imageSelect");
            img = document.getElementById(`APIImg${imageId}`);
            img.classList.add("imageSelect");
            imageSelected = imageId;
        }
    } else {
        imageSelected = imageId;
        let img = document.getElementById(`APIImg${imageId}`);
        img.classList.add("imageSelect");
    }
}

window.finalizar = function () {
    const matchId = window.location.pathname.split("/")[2];
    let img = document.getElementById(`APIImg${imageSelected}`);
    if (!img) {
        alert("Aun no selecciono una imagen");
    } else {
        var socket = io.connect();
        socket.on("joinMatch", async function (data, matchData) {
            const response = await fetch(`/api/match/${matchId}`);
            const match = await response.json();
            socket.emit(
                `playerSelectImage${data.id}`,
                img.src,
                matchId,
                data.id,
                match.playerOneSession === data.id
            );
            getMatch();
        });
    }
};

async function getMatch() {
    const matchId = window.location.pathname.split("/")[2];
    try {
        const response = await fetch(`/api/match/${matchId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const match = await response.json();
        var socket = io.connect();
        socket.on("joinMatch", async function (data, matchData) {
            const viewSection = document.getElementById("view");
            if (match.state == "Finalizada") {
                const winnerSpectateResponse = await fetch(
                    `/partials/winner.html`
                );
                const winnerViewHTML = await winnerSpectateResponse.text();
                viewSection.innerHTML = winnerViewHTML;
                const playerWinner = document.getElementById("player");
                playerWinner.textContent = "Ganador " + match.winner;
                const playerWinnerImage =
                    document.getElementById("player-image");
                playerWinnerImage.src = match.imagenWinner;
                const topic = document.getElementById("topic");
                topic.textContent = match.topic;
                const quitMatchButton =
                    document.getElementById("quitMatchButton");
                quitMatchButton.addEventListener("click", () => volverJugar());
            } else if (
                data.id === match.playerOneSession ||
                data.id === match.playerTwoSession
            ) {
                if (
                    matchData[data.id + matchId] &&
                    matchData[data.id + matchId].imagenFinal != ""
                ) {
                    mostrarImagenFinal(
                        viewSection,
                        matchData[data.id + matchId].imagenFinal,
                        match,
                        data
                    );
                } else {
                    socket.on(`redirectToGame${data.id}`, async () => {
                        mostrarGame(viewSection, match, data);
                    });
                    if (match.state === "Iniciada") {
                        mostrarGame(viewSection, match, data);
                    }
                }
            } else if (match.state == "Finalizada") {
                const winnerSpectateResponse = await fetch(
                    `/partials/winner.html`
                );
                const winnerViewHTML = await winnerSpectateResponse.text();
                viewSection.innerHTML = winnerViewHTML;
                const playerWinner = document.getElementById("player");
                playerWinner.textContent = match.winner;
                const playerWinnerImage =
                    document.getElementById("player-image");
                playerWinnerImage.src = match.imagenWinner;
                const topic = document.getElementById("topic");
                topic.textContent = match.topic;
                const quitMatchButton =
                    document.getElementById("quitMatchButton");
                quitMatchButton.addEventListener("click", () => volverJugar());
            } else {
                const spectateGameResponse = await fetch(
                    `/partials/spectate.html`
                );
                const spectateGameHTML = await spectateGameResponse.text();
                viewSection.innerHTML = spectateGameHTML;
                const playerOneName = document.getElementById("playerOne");
                playerOneName.textContent = match.playerOne;
                const topic = document.getElementById("topic");
                topic.textContent = match.topic;
                const playerTwoName = document.getElementById("playerTwo");
                playerTwoName.textContent = match.playerTwo;
                const quitMatchButton =
                    document.getElementById("quitMatchButton");
                quitMatchButton.addEventListener("click", () => volverJugar());
                socket.emit(`tomarText`, matchId);
                socket.emit(`tomarImagenes`, matchId);

                timers(matchId);

                socket.on(`timerFinished${matchId}`, () => {
                    const timerDiv = document.getElementById("timer");
                    timerDiv.textContent = "00:00";
                });

                socket.on("currentText", (matchData, matchId) => {
                    const playerOneText =
                        document.getElementById("player-one-screen");
                    const playerTwoText =
                        document.getElementById("player-two-screen");

                    if (
                        matchData &&
                        matchData[match.playerOneSession + matchId]
                    ) {
                        playerOneText.textContent =
                            matchData[match.playerOneSession + matchId]
                                .playerText || "";
                    }
                    if (
                        matchData &&
                        matchData[match.playerTwoSession + matchId]
                    ) {
                        playerTwoText.textContent =
                            matchData[match.playerTwoSession + matchId]
                                .playerText || "";
                    }
                });

                socket.on("currentImages", (matchData, matchId) => {
                    const playerOneImageOne = document.getElementById(
                        "player-one-image-one"
                    );
                    const playerOneImageTwo = document.getElementById(
                        "player-one-image-two"
                    );
                    const playerOneImageThree = document.getElementById(
                        "player-one-image-three"
                    );

                    const playerTwoImageOne = document.getElementById(
                        "player-two-image-one"
                    );
                    const playerTwoImageTwo = document.getElementById(
                        "player-two-image-two"
                    );
                    const playerTwoImageThree = document.getElementById(
                        "player-two-image-three"
                    );

                    if (
                        matchData &&
                        matchData[match.playerOneSession + matchId]
                    ) {
                        playerOneImageOne.src =
                            matchData[match.playerOneSession + matchId]
                                .images[1] || "../images/incognita.png";

                        playerOneImageTwo.src =
                            matchData[match.playerOneSession + matchId]
                                .images[2] || "../images/incognita.png";

                        playerOneImageThree.src =
                            matchData[match.playerOneSession + matchId]
                                .images[3] || "../images/incognita.png";
                    }

                    if (
                        matchData &&
                        matchData[match.playerTwoSession + matchId]
                    ) {
                        playerTwoImageOne.src =
                            matchData[match.playerTwoSession + matchId]
                                .images[1] || "../images/incognita.png";

                        playerTwoImageTwo.src =
                            matchData[match.playerTwoSession + matchId]
                                .images[2] || "../images/incognita.png";

                        playerTwoImageThree.src =
                            matchData[match.playerTwoSession + matchId]
                                .images[3] || "../images/incognita.png";
                    }
                });
                socket.on(
                    `updatePlayerText${match.playerOneSession}${matchId}`,
                    (message) => {
                        const playerOneText =
                            document.getElementById("player-one-screen");
                        playerOneText.textContent = message;
                    }
                );
                socket.on(
                    `updatePlayerText${match.playerTwoSession}${matchId}`,
                    (message) => {
                        const playerTwoText =
                            document.getElementById("player-two-screen");
                        playerTwoText.textContent = message;
                    }
                );

                socket.on(
                    `updatePlayerImages${match.playerOneSession}1${matchId}`,
                    (urlImg) => {
                        const playerOneImage = document.getElementById(
                            "player-one-image-one"
                        );
                        playerOneImage.src = urlImg;
                    }
                );

                socket.on(
                    `updatePlayerImages${match.playerTwoSession}1${matchId}`,
                    (urlImg) => {
                        const playerTwoImage = document.getElementById(
                            "player-two-image-one"
                        );
                        playerTwoImage.src = urlImg;
                    }
                );

                socket.on(
                    `updatePlayerImages${match.playerOneSession}2${matchId}`,
                    (urlImg) => {
                        const playerOneImage = document.getElementById(
                            "player-one-image-two"
                        );
                        playerOneImage.src = urlImg;
                    }
                );

                socket.on(
                    `updatePlayerImages${match.playerTwoSession}2${matchId}`,
                    (urlImg) => {
                        const playerTwoImage = document.getElementById(
                            "player-two-image-two"
                        );
                        playerTwoImage.src = urlImg;
                    }
                );

                socket.on(
                    `updatePlayerImages${match.playerOneSession}3${matchId}`,
                    (urlImg) => {
                        const playerOneImage = document.getElementById(
                            "player-one-image-three"
                        );
                        playerOneImage.src = urlImg;
                    }
                );

                socket.on(
                    `updatePlayerImages${match.playerTwoSession}3${matchId}`,
                    (urlImg) => {
                        const playerTwoImage = document.getElementById(
                            "player-two-image-three"
                        );
                        playerTwoImage.src = urlImg;
                    }
                );
                let playerOneFinished = false;
                let playerTwoFinished = false;
                socket.on(
                    `updatePlayerSelectImage${match.playerTwoSession}${matchId}`,
                    (imgUrl) => {
                        const playerText =
                            document.getElementById("player-two-screen");
                        playerText.remove();
                        const playerContenido =
                            document.getElementById("player-two-images");
                        playerContenido.remove();
                        const image = document.createElement("img");
                        const container =
                            document.getElementById("playerTwoContainer");
                        image.src = imgUrl;
                        image.classList.add("imagenSelect");
                        container.appendChild(image);
                        playerOneFinished = true;
                    }
                );
                socket.on(
                    `updatePlayerSelectImage${match.playerOneSession}${matchId}`,
                    (imgUrl) => {
                        const playerText =
                            document.getElementById("player-one-screen");
                        playerText.remove();
                        const playerContenido =
                            document.getElementById("player-one-images");
                        playerContenido.remove();
                        const image = document.createElement("img");
                        const container =
                            document.getElementById("playerOneContainer");
                        image.src = imgUrl;
                        image.classList.add("imagenSelect");
                        container.appendChild(image);
                        playerTwoFinished = true;
                    }
                );
                socket.emit(`tomarImagenSeleccionada`, matchId);
                socket.on("currentImagenSeleccionada", (matchData, matchId) => {
                    if (
                        matchData[match.playerOneSession + matchId] &&
                        matchData[match.playerOneSession + matchId]
                            .imagenFinal != ""
                    ) {
                        const playerText =
                            document.getElementById("player-one-screen");
                        playerText.remove();
                        const playerContenido =
                            document.getElementById("player-one-images");
                        playerContenido.remove();
                        const image = document.createElement("img");
                        const container =
                            document.getElementById("playerOneContainer");
                        image.src =
                            matchData[
                                match.playerOneSession + matchId
                            ].imagenFinal;
                        image.classList.add("imagenSelect");
                        container.appendChild(image);
                        playerOneFinished = true;
                    }

                    if (
                        matchData[match.playerTwoSession + matchId] &&
                        matchData[match.playerTwoSession + matchId]
                            .imagenFinal != ""
                    ) {
                        const playerText =
                            document.getElementById("player-two-screen");
                        playerText.remove();
                        const playerContenido =
                            document.getElementById("player-two-images");
                        playerContenido.remove();
                        const image = document.createElement("img");
                        const container =
                            document.getElementById("playerTwoContainer");
                        image.src =
                            matchData[
                                match.playerTwoSession + matchId
                            ].imagenFinal;
                        image.classList.add("imagenSelect");
                        container.appendChild(image);
                        playerTwoFinished = true;
                    }
                });

                socket.emit(
                    `mostrarBotonVotar`,
                    matchId,
                    match.playerOneSession,
                    match.playerTwoSession
                );
                socket.on(`enableVoting${matchId}`, () => {
                    document.getElementById("voteSection1").hidden = false;
                    document.getElementById("voteSection2").hidden = false;
                    let divVoteButton1 =
                        document.getElementById("divVoteButton1");
                    let divVoteButton2 =
                        document.getElementById("divVoteButton2");
                    let votarButton1 = document.createElement("button");
                    votarButton1.id = "votarButton1";
                    votarButton1.innerText = "Votar";
                    votarButton1.addEventListener("click", () =>
                        voteForPlayer1()
                    );
                    votarButton1.classList.add("btnVote");
                    let votarButton2 = document.createElement("button");
                    votarButton2.id = "votarButton2";
                    votarButton2.innerText = "Votar";
                    votarButton2.addEventListener("click", () =>
                        voteForPlayer2()
                    );
                    votarButton2.classList.add("btnVote");
                    divVoteButton1.appendChild(votarButton1);
                    divVoteButton2.appendChild(votarButton2);
                });

                socket.on("updateVotesButton", (matchRecibido) => {
                    const votarButton1 =
                        document.getElementById("votarButton1");
                    const votarButton2 =
                        document.getElementById("votarButton2");
                    const voteResults1 =
                        document.getElementById("voteResults1");
                    const voteResults2 =
                        document.getElementById("voteResults2");
                    if (votarButton1 && votarButton2) {
                        if (!matchRecibido.playerOneVotes) {
                            matchRecibido.playerOneVotes = 0;
                        }
                        if (!matchRecibido.playerTwoVotes) {
                            matchRecibido.playerTwoVotes = 0;
                        }
                        let totalVotes =
                            matchRecibido.playerOneVotes +
                            matchRecibido.playerTwoVotes;
                        if (totalVotes > 0) {
                            let porcentajePlayer1 = Math.round(
                                (matchRecibido.playerOneVotes / totalVotes) *
                                100
                            );
                            let porcentajePlayer2 = Math.round(
                                (matchRecibido.playerTwoVotes / totalVotes) *
                                100
                            );
                            voteResults1.textContent = `%${porcentajePlayer1} (${matchRecibido.playerOneVotes} votos)`;
                            voteResults2.textContent = `%${porcentajePlayer2} (${matchRecibido.playerTwoVotes} votos)`;
                        } else {
                            voteResults1.textContent = `%${"0"} (${matchRecibido.playerOneVotes
                                } votos)`;
                            voteResults2.textContent = `%${"0"} (${matchRecibido.playerTwoVotes
                                } votos)`;
                        }
                    }
                });

                socket.emit(`mostrarVotacion`, matchId);
                socket.on(`enableVotingAdmin${matchId}`, async (matchData) => {
                    const admin = await soyAdmin();
                    if (
                        !document.getElementById("buttonWinnerOne") &&
                        matchData[match.playerOneSession + matchId] &&
                        matchData[match.playerOneSession + matchId]
                            .imagenFinal != "" &&
                        matchData[match.playerTwoSession + matchId]
                            .imagenFinal != "" &&
                        admin
                    ) {
                        let divPlayerone =
                            document.getElementById("playerOneContainer");
                        let divPlayerTwo =
                            document.getElementById("playerTwoContainer");
                        let divWinnerAdminButton1 =
                            document.createElement("div");
                        let divWinnerAdminButton2 =
                            document.createElement("div");
                        let buttonWinnerOne = document.createElement("button");
                        buttonWinnerOne.id = "buttonWinnerOne";
                        buttonWinnerOne.textContent = "Hacer Ganador";
                        buttonWinnerOne.classList.add("buttonWinner");
                        let buttonWinnerTwo = document.createElement("button");
                        buttonWinnerTwo.id = "buttonWinnerTwo";
                        buttonWinnerTwo.textContent = "Hacer Ganador";
                        buttonWinnerTwo.classList.add("buttonWinner");
                        divWinnerAdminButton1.appendChild(buttonWinnerOne);
                        divWinnerAdminButton2.appendChild(buttonWinnerTwo);
                        buttonWinnerOne.addEventListener("click", () =>
                            hacerGanadorJugador(
                                true,
                                matchData[match.playerOneSession + matchId]
                                    .imagenFinal
                            )
                        );
                        buttonWinnerTwo.addEventListener("click", () =>
                            hacerGanadorJugador(
                                false,
                                matchData[match.playerTwoSession + matchId]
                                    .imagenFinal
                            )
                        );
                        divPlayerone.appendChild(divWinnerAdminButton1);
                        divPlayerTwo.appendChild(divWinnerAdminButton2);
                    }

                    socket.on(`verGanador${matchId}`, () => {
                        window.location.reload();
                    });
                });
            }
        });
    } catch (error) {
        console.error("Error fetching match data:", error);
    }
}

function voteForPlayer1() {
    var socket = io.connect();
    const matchId = window.location.pathname.split("/")[2];
    socket.emit("votarPlayer1", matchId);
}

function voteForPlayer2() {
    var socket = io.connect();
    const matchId = window.location.pathname.split("/")[2];
    socket.emit("votarPlayer2", matchId);
}

async function mostrarGame(viewSection, match, data) {
    var socket = io.connect();
    const matchGameResponse = await fetch(`/partials/match.html`);
    const matchGameHTML = await matchGameResponse.text();
    viewSection.innerHTML = matchGameHTML;
    const tema = document.getElementById("topic");
    tema.textContent = match.topic;
    socket.emit(`tomarTextJugador`, data.id, match._id);
    socket.on("currentTextJugador", (matchData, id, matchId) => {
        const playerText = document.getElementsByName("playerInput")[0];

        if (matchData && matchData[id + matchId]) {
            playerText.textContent = matchData[id + matchId].playerText || "";
        }
    });

    socket.emit(`seleccionarImagenesFinal`, match._id);
    socket.on("currentEstadoFinal", () => {
        const botonGenerar = document.getElementById("finishButton");
        botonGenerar.click();
        const textoPlayer = document.getElementsByName("playerInput")[0];
        const section = document.getElementById("sectionOne");

        textoPlayer.classList.add("hidden");

        const title = document.createElement("h1");
        title.textContent = "Seleccionar imagen";
        section.insertBefore(title, section.firstChild);
    });

    let loaders = document.getElementsByClassName("loader");
    for (let i = 0; i < loaders.length; i++) {
        loaders[i].classList.add("hidden");
    }

    const inputPlayerOne = document.getElementsByName("playerInput")[0];

    inputPlayerOne.addEventListener("input", () => {
        const message = inputPlayerOne.value;
        socket.emit(`playerMessage${data.id}`, message, data.id, match._id);
    });

    timers(match._id);

    socket.on(`timerFinished${match._id}`, () => {
        const timerDiv = document.getElementById("timer");
        const botonGenerar = document.getElementById("finishButton");
        botonGenerar.click();

        const textoPlayer = document.getElementsByName("playerInput")[0];
        const section = document.getElementById("sectionOne");

        textoPlayer.classList.add("hidden");

        if (!document.getElementById("selectImage")) {
            const title = document.createElement("h1");
            title.id = "selectImage";
            title.textContent = "Seleccionar imagen";
            section.insertBefore(title, section.firstChild);
        }

        timerDiv.textContent = "00:00";
    });

    socket.on(`verGanador${match._id}`, () => {
        window.location.reload();
    });

    socket.on(`imageSelectFinished${match._id}`, () => {
        const botonSelect = document.getElementById("selectButton");
        if (imageSelected === "") {
            imageSelected = Math.floor(Math.random() * 3) + 1;
        }
        botonSelect.click();
    });
}

function volverJugar() {
    window.location.href = `/jugar`;
}

async function mostrarImagenFinal(viewSection, imagenUrl, match, data) {
    var socket = io.connect();
    const matchGameResponse = await fetch(`/partials/matchImagenFinal.html`);
    const matchGameHTML = await matchGameResponse.text();
    viewSection.innerHTML = matchGameHTML;

    const tema = document.getElementById("topic");
    tema.textContent = match.topic;
    const image = document.getElementById("player-one-screen");
    image.src = imagenUrl;
    image.classList.add("imagenSelect");

    timers(match._id);

    socket.on(`timerFinished${match._id}`, () => {
        const timerDiv = document.getElementById("timer");
        const botonGenerar = document.getElementById("finishButton");
        botonGenerar.click();

        const textoPlayer = document.getElementById("playerInput");
        const section = document.getElementById("sectionOne");

        textoPlayer.classList.add("hidden");

        if (!document.getElementById("selectImage")) {
            const title = document.createElement("h1");
            title.id = "selectImage";
            title.textContent = "Seleccionar imagen";
            section.insertBefore(title, section.firstChild);
        }

        timerDiv.textContent = "00:00";
    });
}

function timers(matchId) {
    let socket = io.connect();
    socket.on(`currentTimer${matchId}`, (timeRemaining) => {
        const timerDiv = document.getElementById("timer");

        let minutes = Math.floor(timeRemaining / 60);
        let seconds = timeRemaining % 60;

        let formattedMinutes = minutes.toString().padStart(2, "0");
        let formattedSeconds = seconds.toString().padStart(2, "0");

        timerDiv.textContent = `${formattedMinutes}:${formattedSeconds}`;
    });

    socket.on(`updateTimer${matchId}`, (timeRemaining) => {
        const timerDiv = document.getElementById("timer");

        let minutes = Math.floor(timeRemaining / 60);
        let seconds = timeRemaining % 60;

        let formattedMinutes = minutes.toString().padStart(2, "0");
        let formattedSeconds = seconds.toString().padStart(2, "0");

        timerDiv.textContent = `${formattedMinutes}:${formattedSeconds}`;
    });
}

// Funcion para hacer ganador a un jugador
async function hacerGanadorJugador(jugarUno, url) {
    const matchId = window.location.pathname.split("/")[2];
    const response = await fetch(`../api/match/${matchId}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const match = await response.json();
    const jugador = jugarUno ? match.playerOne : match.playerTwo;
    let xhttp = new XMLHttpRequest();

    xhttp.open("PUT", `/api/match/${matchId}`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");

    xhttp.onload = function () {
        if (this.status == 200) {
            const socket = io.connect();
            socket.emit(`mostrarGanador`, matchId);
        } else {
            console.error("Error al actualizar la partida:", this.responseText);
        }
    };

    xhttp.onerror = function () {
        alert("Error en la solicitud.");
    };

    let data = JSON.stringify({
        winner: jugador,
        imagenWinner: url,
        state: "Finalizada",
    });

    xhttp.send(data);
}


async function soyAdmin() {
    let admin = false;
    await fetch("/api/auth/me", {
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
                admin = true;
            }
        })
        .catch((error) => {
            console.log("Error:", error);
        });

    return admin;
}