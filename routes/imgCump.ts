import { Response, Router } from "express";
import FileSystem from "../classes/file-system";
import { FileUpload } from "../interfaces/file-upload";
import { verificaToken } from '../middlewares/autenticacion';
import { imgCump } from '../models/imgCump.model';


const imgCumpRoutes =  Router();
const fileSystem = new FileSystem();

/* 
====================================================
= GUARDAMOS IMAGENES EN NUESTRA GALERIA DEL PERFIL
====================================================
*/
imgCumpRoutes.post('/', [verificaToken], (req: any, res: Response) => {
    
    const body = req.body;

    body.usuario = req.usuario._id;

    const imagenes = fileSystem.imagenesDeTempApost(req.usuario._id,'imgCumpTemp','imgCumpGuardado');
    // todo el arreglo de imagenes va a pasar 
    body.img = imagenes;

    imgCump.create( body ).then(postBD => {

        /* con populate aprovechamos la relacion que hicimos el el modelo
        de post, nos ayuda a guardar todos los datos del usuario que hizo
        el pos, menos la contraseña
        Nota: el primer parametro usuario, es el que creamos en el modelo de post*/
        postBD.populate({path: 'usuario',select:"-pass"}).execPopulate().then(resp =>{

            res.json({
                ok:true,
                post: resp,
                mensaje: 'imgagenes de mi cumpleaños Guardadas Con Exito !!!'  
            })
        })


    }).catch(err => {
        res.json(err);
    })

})

/* 
====================================================
= OBTENER IMAGENES DE USUARIO
====================================================
*/
imgCumpRoutes.get('/AllImgs', (req: any, res: Response) => {

    const getPosts = imgCump.find()
                            .limit(1000)
                            .populate('usuario','-pass')
                            .exec().then(resp => {
            res.json({
                ok:true,
                imgCump: resp  
            })

        }) 
})
/* 
====================================================
= GUARDAR IMAGENES TEMPORALES DE CUMPLEAÑOS
====================================================
*/
imgCumpRoutes.post('/upload',verificaToken, async (req: any, res: Response) => {
    
    if (!req.files) {
        return res.status(400).json({
            ok:false,
            mensaje: 'No se subio ningun archivo'
        })
    }
    // req.files.img = es el archivo que nos manda desde el potman 
    const file: FileUpload = req.files.img;

    // Validamos que envie un archivo
    if (!file) {
        return res.status(400).json({
            ok:false,
            mensaje: 'No se subio ningun archivo - img 1'
        })
    }

    // Verificamos que el archivo sea una imagen y no un documento
    //('image') es el tipo de archivo que tiene que recivir, se encuentra
    // en la mimetype
    if (!file.mimetype.includes('image')) {
        return res.status(400).json({
            ok:false,
            data: file.mimetype,
            mensaje: 'No se subio ningun archivo - img 2'
        })
    }

    // Primero ejecuta este codigo, si todo sale bien continua con el siguiente
    await fileSystem.guardarImgTemporal(file,req.usuario._id,true);

    // Se ejecuta si subio la imagen correctamentez
    res.json({
        ok: true,
        file: file.name
    })

})


imgCumpRoutes.get('/imagen/:userId/:img', (req: any, res: Response) => {

    // Extraemos los datos que nos enviaron por la url
    const Id      = req.params.userId;
    const Nimagen = req.params.img;

    const pathFoto = fileSystem.getFotoUrl(Id,Nimagen,'imgCumpGuardado');
    res.sendFile(pathFoto); // Mostramos el archivo donde se encuentra la foto

    
})


/* 
====================================================
= OBTENER IMAGENES DE CUMPLEAÑOS POR FECHA Y POR ID
====================================================
*/
imgCumpRoutes.post('/imgsFecha', (req: any, res: Response) => {
    

    imgCump.find({created: req.body.fecha, usuario: req.body.id})
    .sort({created: -1})
    .exec().then(resp => {
        res.json({
            ok: true,
            datos: resp
        })
    })
})


export default imgCumpRoutes;


