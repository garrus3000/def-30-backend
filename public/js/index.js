const socket = io();


// Productos con Fake.js vista en HBS
fetch("/api/productos-test")
    .then((response) => response.json())
    .then((data) => listaDeProductos(data))
    .catch((err) => console.log(err));

const listaDeProductos = (data) => {
    const productos = data;
    fetch("../views/productos.hbs")
        .then((res) => res.text())
        .then((template) => Handlebars.compile(template))
        .then((compiled) => compiled({ productos }))
        .then( (html) => (document.getElementById("productos").innerHTML = html) );
};


// Mensajes, guardados en el archivo DB/mensajes.json
const chat = document.getElementById("enviarMensaje");

chat.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mensaje = {
        id: 1,
        author: {
            email: e.target.email.value,
            nombre: e.target.nombre.value,
            apellido: e.target.apellido.value,
            edad: e.target.edad.value,
            alias: e.target.alias.value,
            avatar: e.target.avatar.value,
            fecha: new Date().toLocaleString(),
        },
        text: e.target.text.value,
        id_text: 1
    };
    await socket.emit("new-message", mensaje );
    e.target.text.value = "";
});

const formatoMesaje = (msj) => {
    const propMensaje = {
        nombre: msj.author.nombre,
        email: msj.author.email,
        alias: msj.author.alias,
        avatar: msj.author.avatar,
        fecha: msj.author.fecha,
        text: msj.text,   
    };
    const html = ` <article> 
                        <span class="text-primary fs-5 fw-bold">${propMensaje.email}</span>
                        <span class="text-muted fs-6 fw-bold">${propMensaje.alias}</span>
                        [<span class="text-brown fw-semibold">${propMensaje.fecha}</span>] :
                        <span class="text-success fst-italic">${propMensaje.text}</span>
                        <img src="${propMensaje.avatar}" alt="${propMensaje.alias}" class="rounded-circle ms-3" width="75" height="75">
                    </article>`;
    return html;
};

const renderMensajes = (msj) => {
    const listaMensajes = msj
    .map((mensaje) => formatoMesaje(mensaje))
    .join("");
    if (listaMensajes === "") {
        document.getElementById("messages").innerHTML =  `<div> <p class=" p-2 text-danger fs-3 text-center">No hay mensajes</p> </p>`;
    } else {
        document.getElementById("messages").innerHTML = listaMensajes;
    }
};


/*
    Mostrar por console.log del NAVEGADOR proceso de NORMALIZACION de mensajes
    Mostart porcentaje de compresion en index.html
*/
const renderCompresion = (msj) => {
    const textSchema = new normalizr.schema.Entity('text', {idAttribute: "id_text" });
    const authorSchema = new normalizr.schema.Entity('autores', { text: textSchema}, { idAttribute: "email" });
    const mensajesSchema = new normalizr.schema.Entity('mensajes', { author: authorSchema });


    const _normalizado = normalizr.normalize(msj, [mensajesSchema]);
    console.log("Normalizado :", _normalizado);
    const _desnormalizado = normalizr.denormalize(_normalizado.result, [mensajesSchema],_normalizado.entities );
    console.log("Desnormalizado :",_desnormalizado);

    console.log('Length Original :', JSON.stringify(msj).length)
    console.log('Length Normalizado :', JSON.stringify(_normalizado).length)
    console.log('Length Desnormalizado :', JSON.stringify(_desnormalizado).length)
    const compresion = ((JSON.stringify(_normalizado).length * 100)  / JSON.stringify(msj).length).toFixed(2);
    

    console.log('Compresion :', compresion + ' %');

    const _mostrarCompHTML = document.getElementById("compresion");
    _mostrarCompHTML.innerHTML = `Compresion: ${compresion} %`;
}

const FetchUser = () => {
    fetch("/getuser")
        .then((response) => response)
        .then((data) => data === data.text().then((user) => console.log("User: ",user)));
};

/*
    Con funcion FetchUser() en socket.on("messages")
    se renueva el tiempo de session por cada mensaje escrito
    porque hace request a '/home' que vuelve a setear el Session,
    con rolling: true en server.js, pq resave no funciona bien para MongoDb
*/
socket.on("messages", (msj) => {
    renderMensajes(msj);
    renderCompresion(msj);
    FetchUser();
});

const btnLogout = () => {
    const logoutBtn = document.getElementById('btnLogout');
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        logoutBtn.classList.add('disabled');
        e.target.removeEventListener("click", btnLogout);
        logoutBtn.innerHTML = `Cerrando sesión <span class="spinner-border spinner-border-sm"></span>`;
        window.location.href = "/logout";
    });

};
btnLogout();
