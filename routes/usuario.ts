import { Request, Response, Router } from 'express';
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import token from '../classes/token';
import { verificaToken } from '../middlewares/autenticacion';
import { FileUpload } from '../interfaces/file-upload';
import FileSystem from "../classes/file-system";

const usuarioRout = Router();
const fileSystem = new FileSystem();



/* 
====================================================
= CRAR UN LOGIN
====================================================
*/

usuarioRout.post('/login',(req: Request,resp: Response) => {

    //const body = req.body;

    //Utilizamos nuestro modelo para verificar email y contraseña existente

    Usuario.findOne({email: req.body.email},(err: any, respDB: any) => {

        //Verificamos si nos devuelve un error para detener todo
        if(err) throw err;

        // Verificamos si obtenemos una respuesta
        // y tambien vemos si esa respuesta es correcta
        if (!respDB) {
            return resp.json({
                ok: false,
                mensaje: 'Correo Mamon'
            })
        }

        //Si el email es correcto pasamos a verificar las contraseña
        if (respDB.compararPass(req.body.pass)) {

            const tokenUser = token.getToken({
                /* todo estos es el payload */
                _id       : respDB._id,
                nombre    : respDB.nombre,
                email     : respDB.email,
                nacimiento: respDB.nacimiento,
                avatar    : respDB.avatar
            })

            resp.json({
                ok: true,
                token: tokenUser
            })
        }else{
            return resp.json({
                ok: false,
                mensaje: 'Usuario/Contraseña incorrectos !!'
            })
        }
    });
});

/* 
====================================================
= CRAR UN UN USUARIO Y GUARDARLO EN MONGODB
====================================================
*/

usuarioRout.post('/crear',(req: Request,resp: Response) => {



    const user = {
        nombre    : req.body.nombre,
        apellido  : req.body.apellido,
        nacimiento: req.body.nacimiento,
        email     : req.body.email,
        pass      : bcrypt.hashSync(req.body.pass,10),
        avatar    : req.body.avatar
    }
    //Utilizamos el modelo que creamos para guardar los datos en la BD
    Usuario.create( user ).then(userDB => {
        const tokenUser = token.getToken({
            _id       : userDB._id,
            nombre    : userDB.nombre,
            apellido  : userDB.apellido,
            email     : userDB.email,
            nacimiento: userDB.nacimiento,
            avatar    : userDB.avatar
        })

        resp.json({
            ok: true,
            token: tokenUser
        })
    }).catch(err => {
        resp.json({
            ok:false,
            err
        })
    })
    
});


/* 
====================================================
= OBTENER USUARIO POR ID 
====================================================
*/
usuarioRout.get('/idUser/:userId', (req: any, res: Response) => {
    const userId = req.params.userId;
    Usuario.findOne({_id: userId},(err: any, respDB: any) => {

        const usuario = {
            nombre    : respDB.nombre,
            apellido  : respDB.apellido,
            nacimiento: respDB.nacimiento,
            email     : respDB.email,
            avatar    : respDB.avatar,

        }

        if (respDB) {
            res.json({
                ok     : true,
                usuario: usuario
            })
        }
    })
})





/* 
====================================================
= SUBIR IMAGENES TEMPORALES DE LOS FOTOS DE PERFIL 
====================================================
*/
usuarioRout.post('/imgPerfil',verificaToken, async (req: any, res: Response) => {
    
    if (!req.files) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Por favor seleccione una foto'
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
    await fileSystem.guardarFotoPerfilTemporal(file,req.usuario._id);
    
    // Se ejecuta si subio la imagen correctamentez
    res.json({
        ok: true,
        file: file.mimetype
    })
    

})

usuarioRout.get('/imagen/:userId/:img',  (req: any,resp: Response) => {
    
    const userId = req.params.userId;
    const perfilImg = req.params.img;

    const pathFoto = fileSystem.getPerfilUrl(userId,perfilImg);
    
    resp.sendFile(pathFoto);
})

/* 
==================================================================
= ACTUALIZAR USUARIO
==================================================================
*/
usuarioRout.post('/update', verificaToken,  (req: any,resp: Response) => {

    // Cuando el usuario actualice, mantendra todas las fotos de perfil
    // que aya puesto anterior mente
    const imagenes =  fileSystem.fotoPerfilPost(req.usuario._id);
    
    
    /* Si la verificacion del token fue exitosa, procederemos a que 
    actualice los campos
    si solo actualizamos uno, que los demas campos conserven su valor
    con la condicion ( || )
    */
   
    
    const user = {
        nombre   : req.body.nombre   || req.usuario.nombre,
        apellido : req.body.apellido || req.usuario.apellido,
        email    : req.body.email    || req.usuario.email,
        avatar   : req.body.avatar   || req.usuario.avatar
    }
    /* 
    req.usuario._id = esos datos los trae el verificaToken
    si no estuviera no pudieramos actualizar
    
    findByIdAndUpdate = pide por parametro el id del usuario que querrams
    actualizar, si encuentra el id mustra todos sus datos
    */
    Usuario.findByIdAndUpdate(req.usuario._id,user,{new: true},(err,userBD) => {
        // Si tenemos un error que no sigfa, que pase todo
        if(err) throw err + 'false';

        // Si todo esta bien, que continue
        // Si envia un id, pero no es valido
        if (!userBD) {
            
            return resp.json({
                ok:false,
                mensaje: 'Id del usuario no encontrado'
            })
        }


        // Si el id existe procederemos actualizar y tenemos que generar
        //un nuevo token, porque si actualiza cualquier campo, el token
        // que tenia ya no funciona
        const tokenUser = token.getToken({
            _id         : userBD._id,
            nombre      : userBD.nombre,
            apellido    : userBD.apellido,
            email       : userBD.email,
            nacimiento  : userBD.nacimiento,
            avatar      : userBD.avatar
        })


        resp.json({
            ok: true,
            token: tokenUser
        })
    })
})



/* 
==================================================================
= OBTENER TODAS LAS FOTOS DE PERFIL QUE HAYAMOS SUBIDO
==================================================================
*/
usuarioRout.get('/obtenerFP/:id', (req: any, res:Response) => {
    const userId = req.params.id;
    const fotosPeril = fileSystem.obtenerFotosPerfilPost(userId)
    res.json({
        respuesta: fotosPeril
    })
    
})






/* 
==================================================================
= RETORNAR INFORMACION DE USUARIO POR TOKEN
==================================================================
*/

usuarioRout.get('/',[verificaToken], (req: any, res:Response) => {
    const usuario = req.usuario;
    res.json({
        ok: true,
        nota: 'Informacion del usuario extraida del token',
        usuario: usuario
    })
})



export default usuarioRout;

function obtenerFotosPerfilU() {
    throw new Error('Function not implemented.');
}
