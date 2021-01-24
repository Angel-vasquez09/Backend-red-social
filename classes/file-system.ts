import { FileUpload } from "../interfaces/file-upload";
import path from 'path';
import fs from 'fs';
import uniqid from 'uniqid';



export default class FileSystem {
    

    constructor(){
        
    }

    guardarImgTemporal(file: FileUpload, userId: string,imgCump:boolean){

        /* Creamos un apromesa para que primero ejecute este codigo
        antes de responderle al usuario */
        // Funcion que retorna una promesa
        return new Promise<void>((resolve,reject) => {
            var nombreAarchivo;
            var path;
            const imgCumpTemp = 'imgCumpTemp';
            const imgCumpG = 'imgCumpGuardado';
            const temp = 'temp';

            if (imgCump) {
                /* Llamamos al metodo que nos crea el directorio */
            path = this.CrearCarpetaUsuario(userId,imgCumpTemp); // userId/temp
            // Nombre del archivo
            nombreAarchivo = this.generarNombreUnico(file.name); // nombre.extencion
            //Mover la imagen al archivo temp
            }else{
                    /* Llamamos al metodo que nos crea el directorio */
            path = this.CrearCarpetaUsuario(userId,temp); // userId/temp
            // Nombre del archivo
            nombreAarchivo = this.generarNombreUnico(file.name); // nombre.extencion
            //Mover la imagen al archivo temp
            }

            
            file.mv(`${path}/${nombreAarchivo}`,(err: any) => {
                if (err) {
                    // Si encuentra un error llamamos al reject
                    reject(err);
                }else{
                    // Todo salio bien llamamos al resolve
                    resolve();
                }
        })

        })

    }

     

    generarNombreUnico(nombreOriginal: string){
        // Primero verificamos que extencion tiene nuestra image png/jpg/gif
        // Creamos un array separados por puntos
        // nombreOriginal = 23.luis.png
        const extensionArr = nombreOriginal.split('.'); // ['23','luis','png']
        const extencion = extensionArr[extensionArr.length - 1]; // png
        
        // Nos genera un numero unico cada vez que se ejecute este metodo
        const idUnico = uniqid();

        return `${idUnico}.${extencion}`; // numerounico.png

    }

    /* 
    Creamos un metodo que nos ayudara a crear una carpeta para cada
    usuario, la carpeta tendra el nombre del id del usuario,
    cada usuario va tener su carpeta con sus imagenes temporales
    */ 
   private CrearCarpetaUsuario(userId: string,imgTemp:string){
    
    /* Importamos el path que nos ayudara a ubicarnos en el directorio
    actual que nos encontramos, osea en file-system.ts
    el segundo parametro es para ubicarnos en el directorio en
    el cual vamos a crear las carpetas que necesitamos para cada usuario,
    el tercer parametro es el nombre que tomara el archivo que crearemos */
    const pathUser = path.resolve(__dirname,'../uploads/',userId);

        // Creamos un segundo archivo dentro del anterior
    const  pathUserTemp = pathUser + '/'+imgTemp;
    

    /* Creamos una constante para verificar si un directorio existe 
    con la ayuda de (fs), solo verificamos el pathUser por que el otro se encuentra dentro de este mismo
    asi que si no existe el primero tampoco existira el segundo */
    const existe = fs.existsSync( pathUser );
    const existe2 = fs.existsSync( pathUserTemp );
    // Condicion para verificar que exista
    if (!existe) {
        // Si no existe, cremos los directorios
        fs.mkdirSync(pathUser); // Creamos el directorio
        fs.mkdirSync(pathUserTemp); // Creamos el directorio
    }
    if (existe && !existe2) {
        fs.mkdirSync(pathUserTemp); // Creamos el directorio
    }

    // retornamos el directorio donde guardaremos las img temporales
    return pathUserTemp
   }

   imagenesDeTempApost(userId: string,imgTemp:string,imgG:string){
    // Apuntamos al directorio de uploads/id/temp
    const pathTemp = path.resolve(__dirname,'../uploads/',userId, imgTemp);
    const pathPost = path.resolve(__dirname,'../uploads/',userId, imgG);
    
    if (!fs.existsSync(pathTemp)) {
        // Si no existe este directorio, es porque no tiene imagenes
        // Enviamos un array vacio
        return [];
    }

    if (!fs.existsSync(pathPost)) {
        // Si no existe el directorio lo creamos
        fs.mkdirSync(pathPost);
    }

    const imagenTemp = this.obtenerImagenesTemp(userId,imgTemp);
    // Creamos un forech de todas las imagenes que ayamos extraido
    imagenTemp.forEach(imagen => {
        
        fs.renameSync(`${pathTemp}/${imagen}`, `${pathPost}/${imagen}`);
    });
    return imagenTemp;

   }

   obtenerImagenesTemp(userId: string,imgTemp:string){

    // Variable que obtendra todos las imagenes que se encuentren en el directorio
    const pathTemp = path.resolve(__dirname,'../uploads/',userId,imgTemp);

    // Si el directorio tiene las imagenes, me retornara un arreglo de imagenes
    // Si no tiene ninguna imagen me devolvera un arreglo vacio
    return fs.readdirSync(pathTemp) || [];
   }

   getFotoUrl(userId: string, img: string,imgG:string){
       // Apuntamos al directorio
       const pathFoto = path.resolve(__dirname,'../uploads/',userId,imgG,img);

       const existe = fs.existsSync(pathFoto);
       if (!existe) {
           return path.resolve(__dirname,'../assets/default.jpg');
       }
       
        return pathFoto;
    }


    /* 
    ===================================================================
    = MANEJANDO LAS FOTOS DE PERFIL
    ===================================================================
     */

    guardarFotoPerfilTemporal(file: FileUpload, userId: string){

        /* Creamos un apromesa para que primero ejecute este codigo
        antes de responderle al usuario */
        // Funcion que retorna una promesa
        return new Promise<void>((resolve,reject) => {

            /* Llamamos al metodo que nos crea el directorio */
            const path = this.CarpetaTempPerfil(userId); // userId/temp
            // Nombre del archivo
            const nombreAarchivo = this.generarNombreUnico(file.name); // nombre.extencion
            //Mover la imagen al archivo temp
            file.mv(`${path}/${nombreAarchivo}`,(err: any) => {
                if (err) {
                    // Si encuentra un error llamamos al reject
                    reject(err);
                }else{
                    // Todo salio bien llamamos al resolve
                    resolve();
                }
        })

        })

    }


    /* 
     CREAMOS UN DIRECTORIO TEMPORAL PARA CUANDO EL USUARIO QUIERA CAMBIAR
     LA FOTO DE PERFIL
     */
    CarpetaTempPerfil(userID: string){
        const fotoPerfil = path.resolve(__dirname,'../uploads/',userID);
        const pathFotoPerfil = fotoPerfil + '/fotoTemp';
        
        const existe = fs.existsSync( fotoPerfil );
        const existeFotoTemp = fs.existsSync( pathFotoPerfil );
        
        if (!existe) {
            fs.mkdirSync(fotoPerfil);
            fs.mkdirSync(pathFotoPerfil);
        }
        if (!existeFotoTemp) {
            fs.mkdirSync(pathFotoPerfil);
        }


        return pathFotoPerfil;
    }
    /* 
    SI EL USUARIO DESIDE COLOCAR LA FOTO SELECCIONADA DE PERFIL
    LA GUARDAREMOS EN UNA CARPETA DONDE PERMANECERA
    */
    fotoPerfilPost(userID: string){
        
        const fotoTemp = path.resolve(__dirname,'../uploads/',userID, 'fotoTemp');
        const fotoPost = path.resolve(__dirname,'../uploads/',userID, 'fotoPost');
        
        if (!fs.existsSync(fotoTemp)) {
            // Si no existe este directorio, es porque no tiene imagenes
            // Enviamos un array vacio
            return [];
        }
    
        if (!fs.existsSync(fotoPost)) {
            // Si no existe el directorio lo creamos
            fs.mkdirSync(fotoPost);
        }
    
        const imagenPerfil = this.obtenerFotosPerfilTemp(userID);
        // Creamos un forech de todas las imagenes que ayamos extraido
        imagenPerfil.forEach(foto => {
            fs.renameSync(`${fotoTemp}/${foto}`, `${fotoPost}/${foto}`);
        });
        
       
    
        return imagenPerfil;
    
    }

    getPerfilUrl(userId: string, img: string){
        const fotoPost = path.resolve(__dirname,'../uploads/',userId, 'fotoPost',img);        
        const existe = fs.existsSync(fotoPost);

        if (!existe) {
            return path.resolve(__dirname,'../assets/avatar.jpg');
        }

        return fotoPost;
    }
    // Obtenemos todas las fotos de perfil que tengamos
    obtenerFotosPerfilPost(userId: string){
        // Variable que obtendra todos las imagenes que se encuentren en el directorio
    const pathPost = path.resolve(__dirname,'../uploads/',userId,'fotoPost');
    
    // Si el directorio tiene las imagenes, me retornara un arreglo de imagenes
    // Si no tiene ninguna imagen me devolvera un arreglo vacio
    return fs.readdirSync(pathPost) || [];
    }


    obtenerFotosPerfilTemp(userId: string){

    // Variable que obtendra todos las imagenes que se encuentren en el directorio
    const pathTemp = path.resolve(__dirname,'../uploads/',userId,'fotoTemp');
    
    // Si el directorio tiene las imagenes, me retornara un arreglo de imagenes
    // Si no tiene ninguna imagen me devolvera un arreglo vacio
    return fs.readdirSync(pathTemp) || [];
    }



}