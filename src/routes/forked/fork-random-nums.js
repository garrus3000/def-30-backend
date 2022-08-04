import { Router } from "express";
import {fork} from 'child_process';

const routerRandomNums = Router();

routerRandomNums.get("/", (req, res) => {
    const cant = req.query.cant || 1e8;
    const forked = fork('./src/routes/forked/random-nums.js');
    forked.send(cant);
    forked.on('message', (resultados) => {
        res.send(resultados);
    });
});

export default routerRandomNums;