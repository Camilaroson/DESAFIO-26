const formularioLogin = document.getElementById("formulario-login")



formularioLogin.addEventListener('submit',(evento)=>{
   
    const nombre = document.getElementById("nombre").value
    localStorage.setItem("nombre",nombre)
})
