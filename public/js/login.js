const btnLogin = document.getElementById("btnLogin");
btnLogin.addEventListener("click", (e) => {
    btnLogin.classList.add("disabled");
    btnLogin.innerHTML = `Enviando <span class="spinner-border spinner-border-sm"></span>`;
});

