/**
 * Clase que gestiona todo lo relacionado a usuarios.
 */
export class Usuario {
    constructor(private readonly nombre:string) {
    }

    getName() : string {
        return this.nombre;
    }

}