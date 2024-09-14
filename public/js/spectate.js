let minutes = match.time - 1;
let seconds = 59;
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
socket.on("updateTimer", (time) => {
  let minutes = time - 1;
  let seconds = 59;

  let formattedMinutes = minutes.toString().padStart(2, "0");
  let formattedSeconds = seconds.toString().padStart(2, "0");
  timerDiv.textContent = `${formattedMinutes}:${formattedSeconds}`;
});
setInterval(() => {
  if (matchData[matchId].timeRemaining > 0) {
    matchData[matchId].timeRemaining--;
    io.emit("updateTimer", matchData[matchId].timeRemaining);
  }
}, 1000);
