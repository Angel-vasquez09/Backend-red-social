




export interface FileUpload {
    name: string;
    data: string;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    mimetype: string;
    md5: string;

    mv: Function; // nos ayudara a mover la imagen a el directorio temp/
}