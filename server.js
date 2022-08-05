// import * as dotenv from 'dotenv'
import  dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import { Server as HttpServer, Server } from 'http';
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

// const PORT = yargArgs.puerto || process.env.PORT;
// const MODO = yargArgs.modo || process.env.MODO;
const PORT = process.env.PORT || yargArgs.puerto;
const MODO = process.env.MODO || yargArgs.modo;
const nroCPUs = os.cpus().length;

if(MODO === "CLUSTER" && cluster.isPrimary) {
    console.log(`Primary PID: ${process.pid} - PORT: ${PORT} - MODO: ${MODO} - isPrimary: ${cluster.isPrimary} - Number of CPUs: ${nroCPUs}\n`);
    for(let i = 0; i < nroCPUs; i++) {
        cluster.fork();
    }
    cluster.on('online', (worker) => {
        console.log(`Worker ${worker.process.pid} is alive!`);
    });
    cluster.on("exit", (worker) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
        if (MODO !== 'FORK' && MODO !== 'CLUSTER') {
            throw new Error(`MODO: ${MODO} no implementado, use "FORK" o "CLUSTER"`);
        }
        else if (MODO === "FORK") {
            console.log(
                `\nFORK PID: ${process.pid} - PORT: ${PORT} - MODO: ${MODO}\n`
            );
        } else if (MODO === "CLUSTER") {
            console.log(
                `\nCLUSTER PID: ${process.pid} - PORT: ${PORT} - MODO: ${MODO} - worker: ${cluster.worker.id}`
            );
        };

    console.log(`Worker PID: ${process.pid} started`);

    httpServer.listen(PORT, (err) => {
        if(err) new Error (console.log(err));
        else console.log(`Servidor corriendo en el puerto: ${PORT} - MODO: ${MODO}`);
    });
};
