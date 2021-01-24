import {Schema, model, Document} from 'mongoose';
import express from 'express';
import bcrypt from 'bcrypt';

// Creamos el modelo de la tabla en la que vayamos a guardar o extraer datos
const schema = new Schema({
    nombre:{
        type: String,
        require: [true, 'Campo nombre obligatorio']
    },
    apellido:{
        type: String,
        require: [true, 'Campo apellido obligatorio']
    },
    nacimiento:{
        type: Date,
        require: [true, 'Campo fecha obligatorio']
    },  
    avatar: [{
        type: String,
    }],
    email: {
        type: String,
        unique: true,
        required: [true,'Campo correo obligatorio']
    },
    pass: {
        type: String,
        required: [true,'Campo contraseña obligatorio']
    }
});

/* 
    Creamos un metodo para que nos compare el email con la contraseña
    para verificar que la contraseña le pertenezca al email validado

    Nota: no utilizo funcion flecha porque voy a utilizar el this.
    y con la funcion flecha apuntaria a otro lado

    lo inicializamos vacion por si el usuario no envia nada, para evitar
    que explote el metodo jajajaja ya me entiendes lucho
*/
schema.method('compararPass', function (pass:string = ''): boolean {
    if (bcrypt.compareSync(pass, this.pass)) {
        // Si las contraseñas son igulales tons true
        return true;
    }else{
        return false;
    }
})

// Creamos una interfas para nuestra colleccion
interface Iusuario extends Document{
    nombre    : string;
    apellido  : string;
    nacimiento: Date;
    avatar    : string[];
    email     : string;
    pass      : string;

    compararPass(pass: string):boolean;
}

// model es el encargado de interactuar con nuestro servidor,
// para extrar y crear datos
//model(nombre de la colleccion, coleccion de datos a enviar)
export const Usuario = model<Iusuario>('Usuario',schema);