/**
 * Enumerable que posee los colores permitidos para el uso de las notas.
 */
export enum Color {rojo = "red", verde = "green", azul = "blue", amarillo = "yellow"}

/**
 * Clase que gestiona la creacion de notas, con sus respectivos geters y seters para cada 
 * atributo.
 */
export class Nota {
    /**
     * 
     * @param titulo Titulo que tendra la nota. 
     * @param cuerpo Contenido de la nota.
     * @param color Color para la nota.
     */
    constructor(private titulo:string, private cuerpo: string, private color: Color) {
    }


    setTitutlo(titulo: string){
        this.titulo = titulo;
    }

    getTitulo() : string {
        return this.titulo;
    }

    setCuerpo(cuerpo: string){
        this.cuerpo = cuerpo;
    }

    getCuerpo() : string {
        return this.cuerpo
    }

    setColor(color: Color){
        this.color = color;
    }

    getColor() : string {
        return this.color;
    }

}