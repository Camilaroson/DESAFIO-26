const socket = io();
//obtengo los elementos
const formulario = document.getElementById("formulario")
const input = document.getElementsByTagName('input');
const tabla = document.getElementById("tabla")




formulario.addEventListener('submit', (evento)=>{
    evento.preventDefault()
    let NuevoProducto = {titulo:input[0].value ,precio: input[1].value,imagen:input[2].value}
    socket.emit('producto nuevo', NuevoProducto) //emito del lado del cliente
    input[0].value=''
    input[1].value = ''
    input[2].value = ''
  
  
   
})
//escucha lo que emito desde el server

socket.on('producto nuevo',(message)=>{
    console.log(message)
    let crear = document.createElement('tr')
    crear.innerHTML = `<td>${message.titulo}</td><td>${message.precio}</td><td><img height=40px src="${message.imagen}"></td>`
    tabla.appendChild(crear)
})


