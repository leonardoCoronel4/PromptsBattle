import { generatePromptImage } from "./API.js";

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

    img.onload = function () {
      document.getElementById(`loader${i}`).classList.add("hidden");
    };

    img.onerror = function () {
      document.getElementById(`loader${i}`).classList.add("hidden");
      document.getElementById(`APIImg${i}`).src = "../images/error.png";
    };
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
      const viewSection = document.getElementById("view");
      if (
        data.id === match.playerOneSession ||
        data.id === match.playerTwoSession
      ) {
        const matchGameResponse = await fetch(`/partials/match.html`);
        const matchGameHTML = await matchGameResponse.text();
        viewSection.innerHTML = matchGameHTML;

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
        
        socket.on(`updatePlayerText${match.playerOneSession}`, (message) => {
          const playerOneText = document.getElementById("player-one-screen");
          playerOneText.textContent = message;
        });
        socket.on(`updatePlayerText${match.playerTwoSession}`, (message) => {
          const playerTwoText = document.getElementById("player-two-screen");
          playerTwoText.textContent = message;
        });
      }
    });
  } catch (error) {
    console.error("Error fetching match data:", error);
  }
}
