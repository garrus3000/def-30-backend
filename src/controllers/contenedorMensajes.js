import fs from "fs";

class ContenedorMensajes {
    constructor(fileName) {
        this.fileName = fileName;
    }

    async getAll() {
        if (fs.existsSync(this.fileName)) {
            const contenido = await fs.promises.readFile(this.fileName,"utf-8");
            try {
                const _mensajes = JSON.parse(contenido);
                return _mensajes;
            } catch (error) {
                console.log("Error getAll :", error);
            }
        }
    }

    async save(msj) {
        if (fs.existsSync(this.fileName)) {
            const contenido = await fs.promises.readFile(this.fileName, "utf-8");
            try {
                const _mensajes = JSON.parse(contenido);
                let incrementId = _mensajes.length + 1;
                msj.id = incrementId;
                msj.id_text = incrementId;
                _mensajes.push(msj);
                fs.writeFileSync(this.fileName, JSON.stringify(_mensajes, null, 2));
            } catch (error) {
                console.log("Error save :", error);
            }
        } else {
            const _mensajes = [];
            _mensajes.push(msj);
            fs.writeFileSync(this.fileName, JSON.stringify(_mensajes, null, 2));
        }
    }
    
}

export default ContenedorMensajes;