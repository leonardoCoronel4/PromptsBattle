var socket = io.connect();
async function redirigirJugar() {
  let name = document.getElementById("name").value;

  await socket.emit("name", name);
  setTimeout(function () {
    window.location.href = "/jugar";
  }, 200);
}

function login() {
  let xhttp = new XMLHttpRequest();
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  xhttp.open("POST", "/api/auth/login", true);
  xhttp.setRequestHeader("Content-Type", "application/json");

  xhttp.onload = function () {
    if (this.status == 200) {
      let response = JSON.parse(this.responseText);
      if (response.auth) {
        window.location.href = "/jugar";
      } else {
        alert("Error: " + response.message);
      }
    } else {
      let errorDiv = document.getElementById("errorMessages");
      errorMessage = document.createElement("p");
      errorMessage.textContent = "Usuario o contraseña incorrectos";
      errorMessage.classList.add("errorMessage");
      errorDiv.innerHTML = "";
      errorDiv.appendChild(errorMessage);
    }
  };

  xhttp.onerror = function () {
    alert("Error en la solicitud.");
  };

  let data = JSON.stringify({
    email: username,
    password: password,
  });

  xhttp.send(data);
}

function cleanModalOnClose() {
  let modal = document.getElementById("loginModal");
  modal.addEventListener("hidden.bs.modal", function () {
    let errorDiv = document.getElementById("errorMessages");
    errorDiv.innerHTML = "";
  });
}

cleanModalOnClose();
