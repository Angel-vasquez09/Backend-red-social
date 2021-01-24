import {Schema, model, Document} from 'mongoose';

const postSchema = new Schema({


    created: {
        type: Date
    },
    mensaje: {
        type: String
    },
    img: [{ /* Creamos un arreglo de objetos por si el usuario quiere guardar mas de 1 imagen */
        type: String
    }],
    coords: {
        type: String, // Guardamos latitud y altitud
    },
    usuario: { // Relacionamos este modelo con el modelo de Usuario
        type: Schema.Types.ObjectId, // Es igual a una llave foranea, en otras palabras, esto le pertenece a un usuario
        ref: 'Usuario',
        required: [true, 'Debe existir la referencia de un usuario']
    }
});

/* Antes de que seguarden los datos, llenamos la variable de la fecha,
cada vez que se cree un posteo se guarde la fecha en la que se creo */

postSchema.pre<Ipost>('save', function (next) {
    this.created = new Date();
    next();
    
})

interface Ipost extends Document {
    created : Date;
    mensaje : string;
    img     : string[];
    coords  : string;
}

// Exportamos para utilizar el modelo a la hora del CRUD
export const Post = model<Ipost>('post',postSchema); 

