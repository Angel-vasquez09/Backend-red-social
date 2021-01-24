import { Response, Router } from "express";
import FileSystem from "../classes/file-system";
import { FileUpload } from "../interfaces/file-upload";
import { verificaToken } from '../middlewares/autenticacion';
import { Post } from "../models/post.model";


const postRoutes =  Router();
const fileSystem = new FileSystem();

// DECLARAMOS LAS RUTAS API
/* 
====================================================
= CREAR POSST
====================================================
*/

postRoutes.post('/', [verificaToken], (req: any, res: Response) => {
// Icluimos el verificar toquen, para saber quien es el usuario
// que hace el posteo

    const body = req.body; // Obtenemos todo lo que el usuario nos manda
    /* body.usuario = usuario es el objeto del modelo de post
    creamos la constante body para evitar escribir esa linea muchas veces
    */
    // body.usuario es del modelo de post
    //req.usuario._id es el id del usuario que crea el post lo sacamos de
    //verificaToquen
    body.usuario = req.usuario._id;

    const imagenes = fileSystem.imagenesDeTempApost(req.usuario._id,'temp','post');
    // todo el arreglo de imagenes va a pasar 
    body.img = imagenes;
    

    Post.create( body ).then(postBD => {

        /* con populate aprovechamos la relacion que hicimos el el modelo
        de post, nos ayuda a guardar todos los datos del usuario que hizo
        el pos, menos la contraseña
        Nota: el primer parametro usuario, es el que creamos en el modelo de post*/
        postBD.populate({path: 'usuario',select:"-pass"}).execPopulate().then(resp =>{

            res.json({
                ok:true,
                post: resp,
                mensaje: 'Post Guardado Con Exito !!!'  
            })
        })


    }).catch(err => {
        res.json(err);
    })
})

/* 
====================================================
= OBTENER POST PAGINADOS
====================================================
*/
postRoutes.get('/', (req: any, res: Response) => {
/* 
Utilizamos el modelo para obtener los registros 
el metodo find() nos ayudara a obtener todos los datos

sort({_id: -1}) nos ayuda a ordenar todos los _id de forma desc
limit(10) nos ayudara a que solo nos regrese los ultimos 10 registros
populate('usuario','-pass') mosstramos todos los datos del usuario menos la contraseña
skip(numero) nos ayuda a dejar de mostrar posteos


Controlando paginacion 
Creamos una variable que va almacenar la pagina que el usuario quiere ver
esta variable es opcional 
si el usuario no especifica la pagina, por defecto mostrara la (1)

si el usuario quiere ver la pagina dos, lo que hace esta logica es
restarle 1 y multiplicarlo por 10, significa que dejara de mostrar los
10 primeros posteo y mostrara apartir del posteo 11

si el usuario quiere ver la pagina 3, tons le restamos 1 y lo multiplicamos
por 10 daria 20, significa que dejara de mostrar los 20 primeros posteos
y solo mostrara 10 posteos apartir del posteo 21
*/
let paginacion = Number(req.query.pagina) || 1;
let skip = paginacion - 1;
skip = skip * 10;

// Buscar todos los post o los post de un usuario en especifico
if(req.query.id != undefined){
    console.log('recibido',req.query.id);
    return consulta(req.query.id);
}else{
    console.log('dato no recibido',req.query.id);
    return consulta();
}

// Funcion que nos permite buscar todos los post que hacen los usuarios
// Tmabien busca los post de usuarios por su id
function consulta(id?:string){
    var consult = Post.find();
    if (id) {
        consult = Post.find({usuario:id});
    }

    const getPosts =    consult
                        .sort({_id: -1})
                        .limit(10)
                        .skip(skip)
                        .populate('usuario','-pass')
                        .exec().then(resp => {
       
        res.json({
            ok:true,
            pagina: paginacion,
            post: resp
        })

    })
}
     
})







/* 
====================================================
= SUBIR IMAGENES TEMPORALES DE LOS POSTEOS 
====================================================
*/

postRoutes.post('/upload',verificaToken, async (req: any, res: Response) => {
    
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
    await fileSystem.guardarImgTemporal(file,req.usuario._id,false);

    // Se ejecuta si subio la imagen correctamentez
    res.json({
        ok: true,
        file: file.name
    })

})


/* 
==========================================================
= RUTA PARA MOSTRAR UNA IMAGEN DE UN USUARIO EN ESPECIFICO 
==========================================================
*/

postRoutes.get('/imagen/:userId/:img', (req: any, res: Response) => {

    // Extraemos los datos que nos enviaron por la url
    const Id      = req.params.userId;
    const Nimagen = req.params.img;

    const pathFoto = fileSystem.getFotoUrl(Id,Nimagen,'post');
    res.sendFile(pathFoto); // Mostramos el archivo donde se encuentra la foto

    
})















export default postRoutes;

