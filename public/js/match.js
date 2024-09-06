import { generatePromptImage } from './API.js';

window.onload = function() {
  document.getElementsByClassName("loader").classList.add("hidden");
  let minutes = 0;
  let seconds = 59;
  const timerDiv = document.getElementById("timer");

  function updateTimer() {
      let formattedMinutes = minutes.toString().padStart(2, '0');
      let formattedSeconds = seconds.toString().padStart(2, '0');
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
};


window.getAPIPictures = async function() {
  let prompt = document.getElementById("playerInput").value;
  console.log(prompt);

  // Mostrar todos los loaders
  for (let i = 1; i <= 3; i++) {
      document.getElementById(`loader${i}`).classList.remove("hidden");
      let img = document.getElementById(`APIImg${i}`);
      let imgURL = generatePromptImage(prompt, i, false);
      img.src = imgURL;

      // Esperar a que la imagen se cargue
      img.onload = function() {
          document.getElementById(`loader${i}`).classList.add("hidden");
      };
      
      img.onerror = function() {
          document.getElementById(`loader${i}`).classList.add("hidden");
          console.error(`Error loading image ${i}`);
      };
  }
}