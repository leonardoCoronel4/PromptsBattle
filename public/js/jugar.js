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
        li.className = 'listaUser';
        li.innerHTML = `<div class="divNombresListado">${
          match.playerOne ? '<span style="color:cyan;">' + match.playerOne + "&nbsp;" + '</span>' : "Esperando jugador..."
        } vs ${match.playerTwo ? '<span style="color:fuchsia;">' + "&nbsp;" + match.playerTwo + '</span>' : "Esperando jugador..."}</div>
        <div class="divBotonListado"> ${buttonAction} </div>`;
        matchList[0].appendChild(li);
      });
    });
});
