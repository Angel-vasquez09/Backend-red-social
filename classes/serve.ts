// Instalamos desde la consola: npm i --save-dev @types/express 
import express from 'express';

export default class Serve{

    public app : express.Application;
    public port: number =  3001;

    constructor(){
        // Inicializamos la variable para que no marque error
        this.app = express();
    }

    //Funcion para escuchar al servidor mediante el puerto
    start(calback: any ){
        this.app.listen(this.port, calback);
    }
}