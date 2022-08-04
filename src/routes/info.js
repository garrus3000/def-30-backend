import {Router} from 'express';
import os from 'os';

const routerInfo = Router();

const info = {
    "Argumentos de entrada": process.argv,
    "Nombre de la plataforma": process.platform,
    "Versión de Node.js": process.version,   
    "Path de ejecución": process.execPath,
    "Memoria total de reservada": process.memoryUsage().rss,
    "Process ID": process.pid,
    "Directorio actual del trabajo": process.cwd(),
}


routerInfo.get('/', (req, res) => {
    const infoProyecto = {
        argumentos: process.argv, // "Argumentos de entrada": process.argv,
        plataforma: process.platform, // "Nombre de la plataforma": process.platform,
        versionNode: process.version, // "Versión de Node.js": process.version,
        pathEjecucion: process.execPath, // "Path de ejecución": process.execPath,
        memoriaTotalReservada: process.memoryUsage().rss, // "Memoria total de reservada": process.memoryUsage().rss,
        processId: process.pid, // "Process ID": process.pid,
        directorioActualTrabajo: process.cwd(), // "Directorio actual del trabajo": process.cwd(),
        numProcesadores: os.cpus().length, // "Número de procesadores": os.cpus().length,
    };
    // res.send(infoProyecto);
    // console.log(info);
    res.render('info', { infoProyecto });
});


export default routerInfo;