document.addEventListener("DOMContentLoaded", function () {
  fetch("api/match/pending")
    .then((response) => response.json())
    .then((matches) => {
      const matchList = document.getElementsByName("matchList");
      matches.forEach((match) => {
        const li = document.createElement("li");
        let buttonAction = "";
        if (match.playerOne != null && match.playerTwo != null) {
          buttonAction = `<button id="${match.id}">Ver</button>`;
        } else {
          buttonAction = `<button id="${match.id}">Unirse</button>`;
        }
        li.innerHTML = `${
          match.playerOne ? '<span style="color=red;">' + match.playerOne + '</span>' : "Esperando jugador..."
        } vs ${match.playerTwo ? match.playerTwo : "Esperando jugador..."} ${buttonAction}`;
        matchList[0].appendChild(li);
      });
    });
});
