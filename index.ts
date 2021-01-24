import Serve from "./classes/serve";
import usuarioRout from "./routes/usuario";
import imgCumpRoutes from "./routes/imgCump";
import mongoose from 'mongoose';
import bodyParser from "body-parser";
import postRoutes from "./routes/post";
import fileUpload from "express-fileupload"; // Para subir archivos
import cors from 'cors';
import router from "./routes/chat";


const serve = new Serve();

//Body parse
serve.app.use(bodyParser.urlencoded({extended: true}));
serve.app.use(bodyParser.json());

// File Upload
serve.app.use(fileUpload());


//CONFIGURACION DE CORDS PARA QUE CUALQUIER PERSONA PUEDA USAR MI SERVICIO DESDE OTROS ORIGENES
serve.app.use(cors({ origin: true, credentials: true  }));



/* 
====================================================
= RUTA PARA CHAT
====================================================
*/
serve.app.use('/', router);


/* 
====================================================
= RUTAS PARA USUARIO
====================================================
*/
serve.app.use('/user',usuarioRout);
/* 
====================================================
= RUTAS PARA LOS POSTEOS
====================================================
*/
serve.app.use('/posts', postRoutes);
/* 
====================================================
= RUTAS PARA GALERIA DE IMAGENES DE CUMPLEAÑOS
====================================================
*/
serve.app.use('/imgCump', imgCumpRoutes);






/* 
====================================================
= LEVANTAMOS LA BASE DE DATOS
====================================================
*/
mongoose.connect('mongodb://localhost:27017/fotosgram',
        {useNewUrlParser: true, useCreateIndex: true},
        (err) => {
            // Si existe un error que no siga 
            if (err) throw err;

            // Si no ocurre un error tons
            console.log("Base de datos online");
        }
        );

// Levantar el espress
serve.start(()=>{
    console.log(`Servidor corriendo en puerto ${serve.port}`);
})


