import { NextFunction, Request, Response } from "express";
import token from "../classes/token";

export const verificaToken = 
(req:any,res:Response,next: NextFunction) => {
    
    // si es null lo colocamos dos comillas simples
    const userToken = req.get('x-token') || '';

    // Si llega a esta funcion es porque mi token es correcto
    token.comprobarToken(userToken)
        .then( (decoded: any) => {
            req.usuario = decoded.usuario;
            // nexxt() se ejecuta cuando todo esta bien
            next();
        }).catch(err => {

            res.json({
                ok: false,
                mensaje: 'Token no es correcto'
            });
        });
}