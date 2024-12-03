const usuario = JSON.parse(localStorage.getItem("usuario"));

const cargarPerfil = () => {
    if (usuario) {
        document.getElementById("user-name").textContent = usuario.name;
        document.getElementById("user-photo").src = usuario.foto || 'assets/imgUsers/icon.png';
    } else {
        window.location.href = "index.html";
    }
};


const guardarOpinion=async()=>{
    
    let opinion=document.getElementById("opinion").value;
    let email=usuario.email;

    if(opinion.trim()==""){
        Swal.fire({icon:"error",title:"ERROR",text:"¡CAMPO VACÍO!"});
        return;
    }
    let datos=new FormData();
    datos.append("opinion",opinion);
    datos.append("email",email);
    datos.append("action","publicar");

    console.log("OPINIÓN:"+opinion+"EMAIL:"+email);

    let respuesta=await fetch("assets/php/comentarios.php",{method:'POST',body:datos});
    let json=await respuesta.json();

    if(json.success==true){
        Swal.fire("¡ÉXITO!",json.mensaje,"success");
        document.getElementById("opinion").value="";
    }else{
        Swal.fire("ERROR!",json.mensaje,"error");
    }
    cargarOpinions();
}




const cargarOpinions=async()=>{
    let datos=new FormData();
    datos.append("action","cargarOpiniones");
    let respuesta=await fetch("assets/php/comentarios.php",{method:'POST',body:datos});
    let json= await respuesta.json();
    
    var divO=``
    json.map(opi=>{
    moment.locale("es");
    moment().format("L");
    
    var fecha3=moment(opi.fecha,'YYYY-MM-DD hh:mm:ss').fromNow();
    
    divO+=`
    <div class="card w-50 m-auto mt-3">
    
    <div class="card-header">
            <div class="col m-2">
            <img src="${opi.foto}" width="50px" height="50px" style="border-radius: 100%;">
            <b class="mx-1">${opi.name}</b>
            <small>${fecha3}</small>
        </div>
    </div>
    
        <div class="card-body">
               <p class="">${opi.opinion}</p>
            </div>
    
    
    <div class="card-footer text-center"> 
       <button class="btn btn-info mx-2" onclick="mostrarOpi(${opi.id_o})" data-bs-toggle="modal" data-bs-target="#editOpinion">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                    </svg>
                </button>
                <button class="btn btn-danger mx-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                    </svg>
                </button>
        </div>
    
    </div>
    
    `
    });
    
    document.getElementById('divOpinions').innerHTML=divO;
    }

    
    const mostrarOpi = async (idopi) => {
        document.getElementById("profile_photo").src = usuario.foto || 'assets/imgUsers/icon.png';
    
        let datos = new FormData();
        datos.append("id_o", idopi); 
        datos.append('action', 'selectOpinion');  
    
        let respuesta = await fetch("assets/php/comentarios.php", { method: 'POST', body: datos });
        let json = await respuesta.json();
    
     
        if (!json.error) {
            document.querySelector("#ido").value = json.id_o; 
            document.querySelector("#eopinion").value = json.opinion; 
        } else {
            Swal.fire("Error", json.error, "error");
        }
    };


const actualizarOpinion= async () => {
    var ido = document.querySelector("#ido").value;
    var opinion = document.querySelector("#eopinion").value;
    
    if (opinion.trim() == "") {
        Swal.fire({title: "ERROR",text: "Tienes campos vacíos",icon: "error"});
        return;
    }
    
    let datos = new FormData();
    datos.append("ido", ido);
    datos.append("opinion", opinion);
    datos.append('action', 'updateOpinion');
    
    try {
        let respuesta = await fetch("assets/php/comentarios.php", { method: 'POST', body: datos });
        let json = await respuesta.json();
        
        if (json.success == true) {
            Swal.fire({ title: "¡ACTUALIZACIÓN ÉXITOSA!", text: json.mensaje, icon: "success" });
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }
        cargarOpinions(); 
    } catch (error) {
        console.error('Error al actualizar la opinión:', error);
        Swal.fire({ title: "ERROR", text: "Hubo un problema al procesar la solicitud", icon: "error" });
    }
}