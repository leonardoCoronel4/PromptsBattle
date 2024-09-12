import { generatePromptImage } from "./API.js";
let imageSelected = "";
window.onload = async function () {
  await getMatch();
};

window.getAPIPictures = async function () {
  let prompt = document.getElementById("playerInput").value;

  for (let i = 1; i <= 3; i++) {
    document.getElementById(`loader${i}`).classList.remove("hidden");
    let img = document.getElementById(`APIImg${i}`);
    let imgURL = generatePromptImage(prompt, i, false);
    img.src = imgURL;
    var socket = io.connect();

    socket.on("joinMatch", async function (data) {
      socket.emit(`playerImages${data.id}`, i, imgURL, data.id);
    });

    img.addEventListener("click", () => Seleccion(i));

    img.onload = function () {
      document.getElementById(`loader${i}`).classList.add("hidden");
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
  let img = document.getElementById(`APIImg${imageSelected}`);
  if (!img) {
    alert("Aun no selecciono una imagen");
  } else {
    console.log(img);
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
    socket.on("joinMatch", async function (data) {
      console.log(data.id);
      const viewSection = document.getElementById("view");
      if (
        data.id === match.playerOneSession ||
        data.id === match.playerTwoSession
      ) {
        const matchGameResponse = await fetch(`/partials/match.html`);
        const matchGameHTML = await matchGameResponse.text();
        viewSection.innerHTML = matchGameHTML;

        socket.emit(`tomarTextJugador`, data.id);
        socket.on("currentTextJugador", (matchData, id) => {
          const playerText = document.getElementById("playerInput");

          if (matchData && matchData[id]) {
            playerText.textContent = matchData[id].playerText || "";
          }
        });

        let loaders = document.getElementsByClassName("loader");
        for (let i = 0; i < loaders.length; i++) {
          loaders[i].classList.add("hidden");
        }
        let minutes = 0;
        let seconds = 59;
        const timerDiv = document.getElementById("timer");

        function updateTimer() {
          let formattedMinutes = minutes.toString().padStart(2, "0");
          let formattedSeconds = seconds.toString().padStart(2, "0");
          timerDiv.textContent = `${formattedMinutes}:${formattedSeconds}`;

          if (minutes === 0 && seconds === 0) {
            clearInterval(timerInterval);
            timerDiv.textContent = "00:00";
          } else {
            if (seconds === 0) {
              minutes--;
              seconds = 59;
            } else {
              seconds--;
            }
          }
        }

        const timerInterval = setInterval(updateTimer, 1000);
        const inputPlayerOne = document.getElementById("playerInput");

        inputPlayerOne.addEventListener("input", () => {
          const message = inputPlayerOne.value;
          socket.emit(`playerMessage${data.id}`, message, data.id);
        });
      } else {
        const spectateGameResponse = await fetch(`/partials/spectate.html`);
        const spectateGameHTML = await spectateGameResponse.text();
        viewSection.innerHTML = spectateGameHTML;
        const playerOneName = document.getElementById("playerOne");
        playerOneName.textContent = match.playerOne;
        const playerTwoName = document.getElementById("playerTwo");
        playerTwoName.textContent = match.playerTwo;

        socket.emit(`tomarText`);
        socket.emit(`tomarImagenes`);

        socket.on("currentText", (matchData) => {
          const playerOneText = document.getElementById("player-one-screen");
          const playerTwoText = document.getElementById("player-two-screen");

          if (matchData && matchData[match.playerOneSession]) {
            playerOneText.textContent =
              matchData[match.playerOneSession].playerText || "";
          }
          if (matchData && matchData[match.playerTwoSession]) {
            playerTwoText.textContent =
              matchData[match.playerTwoSession].playerText || "";
          }
        });

        socket.on("currentImages", (matchData) => {
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

          if (matchData && matchData[match.playerOneSession]) {
            playerOneImageOne.src =
              matchData[match.playerOneSession].images[1] ||
              "../images/incognita.png";

            playerOneImageTwo.src =
              matchData[match.playerOneSession].images[2] ||
              "../images/incognita.png";

            playerOneImageThree.src =
              matchData[match.playerOneSession].images[3] ||
              "../images/incognita.png";
          }

          if (matchData && matchData[match.playerTwoSession]) {
            playerTwoImageOne.src =
              matchData[match.playerTwoSession].images[1] ||
              "../images/incognita.png";

            playerTwoImageTwo.src =
              matchData[match.playerTwoSession].images[2] ||
              "../images/incognita.png";

            playerTwoImageThree.src =
              matchData[match.playerTwoSession].images[3] ||
              "../images/incognita.png";
          }
        });
        socket.on(`updatePlayerText${match.playerOneSession}`, (message) => {
          const playerOneText = document.getElementById("player-one-screen");
          playerOneText.textContent = message;
        });
        socket.on(`updatePlayerText${match.playerTwoSession}`, (message) => {
          const playerTwoText = document.getElementById("player-two-screen");
          playerTwoText.textContent = message;
        });
        console.log(`updatePlayerImages${match.playerOneSession}1`);
        socket.on(`updatePlayerImages${match.playerOneSession}1`, (urlImg) => {
          const playerOneImage = document.getElementById(
            "player-one-image-one"
          );
          playerOneImage.src = urlImg;
        });

        socket.on(`updatePlayerImages${match.playerTwoSession}1`, (urlImg) => {
          const playerTwoImage = document.getElementById(
            "player-two-image-one"
          );
          playerTwoImage.src = urlImg;
        });

        socket.on(`updatePlayerImages${match.playerOneSession}2`, (urlImg) => {
          const playerOneImage = document.getElementById(
            "player-one-image-two"
          );
          playerOneImage.src = urlImg;
        });

        socket.on(`updatePlayerImages${match.playerTwoSession}2`, (urlImg) => {
          const playerTwoImage = document.getElementById(
            "player-two-image-two"
          );
          playerTwoImage.src = urlImg;
        });

        socket.on(`updatePlayerImages${match.playerOneSession}3`, (urlImg) => {
          const playerOneImage = document.getElementById(
            "player-one-image-three"
          );
          playerOneImage.src = urlImg;
        });

        socket.on(`updatePlayerImages${match.playerTwoSession}3`, (urlImg) => {
          const playerTwoImage = document.getElementById(
            "player-two-image-three"
          );
          playerTwoImage.src = urlImg;
        });
      }
    });
  } catch (error) {
    console.error("Error fetching match data:", error);
  }
}
