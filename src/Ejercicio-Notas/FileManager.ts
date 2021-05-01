import chalk = require("chalk");
import * as fs from "fs";
import { Nota } from "./Notas";
import { Usuario } from "./Usuario";

/**
 * Clase que administra todo lo relacionado al manejo de ficheros,
 * cumple con el patron de diseño creacional SINGLETON.
 */
export class FileManager {
    private pathbd : string;
    private static instance: FileManager;

    /**
     * El constructor define la direccion raiz en donde se guardaran las notas de los usuarios.
     */
    private constructor() {
        this.pathbd = "./notas/";
        fs.mkdirSync(this.pathbd, {recursive: true})
    }

    /**
     * Metodo estatico para cumplir con el patron singleton, este devuelve la unica instancia del objeto.
     * @returns instancia del objeto FileManager.
     */
    public static getFileManagerInstance(): FileManager {
      if (!FileManager.instance) {
        FileManager.instance = new FileManager();
      }
      return FileManager.instance;
    }

    /**
     * Metodo que verifica si hay un fichero que coincida con el nombre del usuario dado.
     * @param usuario usuario a verificar.
     * @returns verdadero si existe el fichero, falso si no existe.
     */
    userFileExist(usuario: Usuario): boolean {
        if(fs.existsSync(this.pathbd + usuario.getName())) {
            return  true;
        } else {
            return false; 
        }
    }

    /**
     * Metodo que verifica si el usuario dado posee una nota con el titulo dado.
     * @param usuario Usuario a verificar.
     * @param titulo Titulo de la nota a verificar.
     * @returns verdadero si existe la nota, falso si no existe.
     */
    userFileNoteJsonExist(usuario: Usuario, titulo: string): boolean {
        const nota_titulo = titulo.split(' ').join('')
        if(fs.existsSync(this.pathbd + usuario.getName() + `/${nota_titulo}.json`)) {
            return true;
        } else {
            return false;
        }   
    }
    
    /**
     * Metodo que crea una nota en formato .json dentro del fichero del usuario.
     * @param usuario Usuario al que se le agregara la nota.
     * @param nota Nota a agregar.
     */
    createFileNoteJson(usuario: Usuario, nota: Nota) {
        const nota_titulo = nota.getTitulo().split(' ').join('')
        const json = `{ "title": "${nota.getTitulo()}", "body": "${nota.getCuerpo()}" , "color": "${nota.getColor()}" }`
        fs.writeFileSync(this.pathbd+usuario.getName()+`/${nota_titulo}.json`, json);
    }

    /**
     * Metodo para crear un fichero con el nombre del usuario dado.
     * @param usuario Usuario para crear el fichero.
     */
    createUserFolder(usuario: Usuario) {
        fs.mkdirSync(this.pathbd + usuario.getName(), {recursive: true})
    }

    /**
     * Metodo que obtiene un arreglo de Notas de un usuario.
     * @param usuario Usuario a buscar.
     * @returns Arreglo de notas del usuario.
     */
    listUserNoteJsonFiles(usuario: Usuario) : Nota[]{
        let result : Nota[] = [];
        fs.readdirSync(this.pathbd+`/${usuario.getName()}/`).forEach((notas) => {
            const data = fs.readFileSync(this.pathbd+`/${usuario.getName()}/${notas}`);
            const nota_json = JSON.parse(data.toString());
            const nota : Nota = new Nota(nota_json.title, nota_json.body, nota_json.color);
            result.push(nota);
          });
          return result;
    }

    /**
     * Metodo que convierte una nota en formato json a un objeto de tipo Nota.
     * @param usuario Usuario que posee la nota.
     * @param titulo Titulo de la nota a convertir.
     * @returns Objeto de tipo Nota.
     */
    parseJsonNote(usuario: Usuario, titulo: string) : Nota {
        const nota_titulo = titulo.split(' ').join('');
        const data = fs.readFileSync(this.pathbd+`/${usuario.getName()}/${nota_titulo}.json`);
        const nota_json = JSON.parse(data.toString());
        const nota : Nota = new Nota(nota_json.title, nota_json.body, nota_json.color);
        return nota;  
    }

    /**
     * Metodo que elimina una nota del usuario dado.
     * @param usuario Usuario a eliminar la nota.
     * @param titulo Titutlo de la nota a eliminar.
     */
    removeFile(usuario: Usuario, titulo: string) {
        const nota_titulo = titulo.split(' ').join('');
        fs.rmSync(this.pathbd+`/${usuario.getName()}/${nota_titulo}.json`);
    }

}