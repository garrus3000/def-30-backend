// import * as dotenv from 'dotenv'
import  dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';

import { engine } from "express-handlebars"

import routerProducto from './src/routes/routes-faker-productos.js';
import ContenedorMensajes from './src/controllers/contenedorMensajes.js';

import { allNormalizeProcess } from './src/controllers/normalizr.js';

import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';


import yargArgs from './src/routes/yarg-cli.js';
import cluster from 'cluster';
import os from 'os';

import routerAll from './src/routes/router.js';
import routerRandomNums from './src/routes/forked/fork-random-nums.js';
import routerInfo from './src/routes/info.js';


const app = express();
const httpServer = new HttpServer(app)
const ioServer = new IOServer(httpServer)

const mensajes = new ContenedorMensajes('./src/DB/mensajes.json');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      defaultLayout: 'main.hbs',
    })
);

app.set('views', './public/views');
app.set('view engine', 'hbs');


app.use(cookieParser());

app.use(
    session({
        store: MongoStore.create({
            mongoUrl:process.env.MONGO_ATLAS_URL,
            mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        }),
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        rolling: true,
        cookie: {
            maxAge: 1000 * 60 * 10,
        },
    })
);


app.use("/api", routerProducto);

app.use( routerAll );

app.use('/info', routerInfo);

app.use('/api/randoms', routerRandomNums);


ioServer.on("connection", async (socket) => {
    console.log("Nuevo usuario conectado");
    
    socket.emit("messages", allNormalizeProcess(await mensajes.getAll()));
  
    socket.on("new-message", async (msj) => {
        await mensajes.save(msj);
        allNormalizeProcess(await mensajes.getAll()),
        
            ioServer.sockets.emit("messages",
                allNormalizeProcess(await mensajes.getAll())
            );
    });
});

// Ataja los errores de passport
app.use((error, req, res, next) => {
    res.status(500).send(error.message);
});

app.use((req, res) => {
    res.status(404).send({
        error: -2,
        descripcion: `ruta ${req.originalUrl} y metodo ${req.method} no implementada`,
    });
});


const PORT = yargArgs.puerto || process.env.PORT;
const MODO = yargArgs.modo || process.env.MODO;
const nroCPUs = os.cpus().length;

if(MODO === "CLUSTER" && cluster.isPrimary) {
    console.log(`Primary PID: ${process.pid} - PORT: ${PORT} - MODO: ${MODO} - isPrimary: ${cluster.isPrimary} - nroCPUs: ${nroCPUs}\n`);
    for(let i = 0; i < nroCPUs; i++) {
        cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
        if (MODO === "FORK") {
            console.log(`\nFORK PID: ${process.pid} - PORT: ${PORT} - MODO: ${MODO}\n`);
        }
        else if (MODO === "CLUSTER") {
            console.log(`\nCLUSTER PID: ${process.pid} - PORT: ${PORT} - MODO: ${MODO} - worker: ${cluster.worker.id}`);
        }

    httpServer.listen(PORT, (err) => {
        if(err) new Error (console.log(err));
        else console.log(`Servidor corriendo en el puerto: ${PORT} - MODO: ${MODO}`);
    });
};





// const PORT = process.argv[2] || 8080; //node server N || npm start N

/*
const PORT = yargArgs.puerto; // node server -p N || npm start -- -p N
*/


/*
    process.env.PORT SOLO funciona con GIT BASH, problema con argv[0] por defecto en pwsh y CMD, lo toma como script en path de windows

    " PORT=3000: The term '.PORT=3000' is not recognized as a name of a cmdlet, function, script file, or executable program.
        Check the spelling of the name, or if a path was included, verify that the path is correct and try again. "
*/

// node server -p N || npm start -- -p N
// const PORT = process.env.PORT || yargArgs.puerto || 8080;

// httpServer.listen(PORT, (err) => {
//     if(err) new Error (console.log(err));
//     else console.log(`Servidor corriendo en el puerto: ${PORT} `);
// });

// const PORT = yargArgs.puerto || 8080;
// const MODO = yargArgs.modo || "FORK";
// const numCPUs = os.cpus().length;

// if(cluster.isPrimary && MODO === "CLUSTER") {
//     console.log(`¡Servidor corriendo! \n- Puerto: ${PORT} \n- Modo: ${MODO} \n- Número de CPUs: ${numCPUs}`);
//     for (let i = 0; i < numCPUs; i++) {
//         cluster.fork();
//     }

//     httpServer.listen(PORT);
// } 

