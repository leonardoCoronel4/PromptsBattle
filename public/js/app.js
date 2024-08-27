function redirigirJugar() {
  window.location.href = "/jugar";
};

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
        localStorage.setItem("token", response.token);
        window.location.href = "/";
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
