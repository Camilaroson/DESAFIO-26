export class NuevoProducto {
    id : number
    titulo : string
    precio : number
    imagen : string

    constructor(id:number, titulo:string, precio:number,imagen:string){
        this.id = id
        this.titulo = titulo
        this.precio = precio
        this.imagen = imagen
}

}
