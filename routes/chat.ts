import { Router, Response, Request } from 'express';

const router = Router();


router.get('/mensajes', (req:Request, res:Response) => {

    res.json({
        ok: true,
        respuesta: 'Todo Esta Bien desde el get'
    })


});


router.post('/mensajes/:id', (req:Request, res:Response) => {

    const cuerpo = req.body.cuerpo;
    const de     = req.body.de;
    const id     = req.params.id;

    res.json({
        ok: true,
        respuesta: 'Todo Esta Bien desde el post'
    })


});

export default router;