import jwt from 'jsonwebtoken'

export default class token{
    private static seed: string = 'seed-de-mi-app-secreta';
    private static caducidad: string = '50d';

    constructor(){

    }

    /* Metodo estatico para generar un token */
    static getToken(payload: any): string{
        return jwt.sign({
            usuario: payload,

        },this.seed, {expiresIn: this.caducidad})
    }

    /* Metodo estatico para verificar los token */
    static comprobarToken(userToken:string){

        return new Promise((resolve,reject) => {

            jwt.verify(userToken, this.seed, (err,decoded) => {
                if (err) {
                    // No confiar
                    reject();
                }else{
                    //token valido
                    resolve(decoded);
                }
            })

        })
    }
}