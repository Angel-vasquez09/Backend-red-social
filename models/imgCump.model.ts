import {Schema, model, Document} from 'mongoose';

const imgCumpSchema = new Schema({
    
    created: { // Fecha de creacion
        type: String
    },
    img: [{ // Fotos del dia de mi cumpleaño
        type: String
    }],
    usuario: { // Relacionamos este modelo con el modelo de Usuario
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Debe existir la referencia de un usuario']
    }
})

imgCumpSchema.pre<IimgCump>('save', function (next) {
    const fecha = new Date().toLocaleDateString();
    this.created = fecha;
    next();
    
})

interface IimgCump extends Document {
    created : string;
    img : string[];
}

export const imgCump = model<IimgCump>('imgCump',imgCumpSchema); 