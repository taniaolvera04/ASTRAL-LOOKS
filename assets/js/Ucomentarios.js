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
    let email=usuario.email;

    let datos=new FormData();
    datos.append("email",email)
    datos.append("action","cargarOpiniones");
    let respuesta=await fetch("assets/php/comentarios.php",{method:'POST',body:datos});
    let json= await respuesta.json();
    
    var divO=``
    json.map(opi=>{
    moment.locale("es");
    moment().format("L");
    
    var fecha3=moment(opi.fecha,'YYYY-MM-DD hh:mm:ss').fromNow();
    
    divO+=`
    <div class="card w-50 m-auto mt-3" style="border: 3px solid #beaae6;">
    
    <div class="card-header"  style="background-color: #e7dcfd;">
            <div class="col m-2">
            <img src="${opi.foto}" width="50px" height="50px" style="border-radius: 100%;">
            <b class="mx-1">${opi.name}</b>
            <small>${fecha3}</small>
        </div>
    </div>
    
        <div class="card-body">
               <p class="">${opi.opinion}</p>
            </div>
    
    
    <div class="card-footer text-center"  style="background-color: #e7dcfd;"> 
       <button class="btn btn-info mx-2" onclick="mostrarOpi(${opi.id_o})" data-bs-toggle="modal" data-bs-target="#editOpinion">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg>
                </button>
                <button class="btn btn-danger mx-2"  onclick="delOpinion(${opi.id_o})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                    </svg>
                </button>
        </div>
    
    </div>


     <div class="accordion w-50 m-auto" id="accordionExample" style="border: 3px solid #beaae6;border-radius:10px;">
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button onclick="verCom(${opi.id_o})" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${opi.id_o}" aria-expanded="true" aria-controls="collapseOne">
                    Ver comentarios . . .   
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" class="bi bi-chat-dots-fill mx-2" viewBox="0 0 16 16">
                        <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                    </svg>
                </button>
            </h2>
            
            <div id="collapse${opi.id_o}" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
              
        </div>
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


const delOpinion = async (ido) => {
    Swal.fire({
        title: "¿Estás seguro de eliminar esta opinón?",
        icon:"info",
        showDenyButton: true,
        confirmButtonText: "Si",
        denyButtonText: "No"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {

                let formData = new FormData();
                formData.append('ido', ido);
                formData.append('action', 'deleteOpinion');

                let respuesta = await fetch("assets/php/comentarios.php", {
                    method: 'POST',
                    body: formData
                });

                if (respuesta.ok) {
                    let json = await respuesta.json();

                    if (json.success) {
                        Swal.fire({
                            title: "¡OPINIÓN ELIMINADA CON ÉXITO!",
                            text: json.mensaje,
                            icon: "success"
                        });

                        cargarOpinions();
                    } else {
                        Swal.fire({
                            title: "ERROR",
                            text: json.mensaje,
                            icon: "error"
                        });
                    }
                } else {
                    throw new Error(`HTTP error! status: ${respuesta.status}`);
                }
            } catch (error) {
                console.error('Error al eliminar la opinión:', error);
                Swal.fire({
                    title: "Error",
                    text: "Hubo un problema al intentar eliminar el corte",
                    icon: "error"
                });
            }
        }
    });
}



const verCom = async (ido) => {
    let count = 0;
    var listaComentarios = `<ul class="list-group list-group-flush">`;

    let datos = new FormData();
    datos.append("ido", ido); 
    datos.append("action", "verCom");

    let respuesta = await fetch("assets/php/comentarios.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    moment.locale("es");
    moment().format("L");

    json.map(comen => {
        var fecha3 = moment(comen.fecha, 'YYYY-MM-DD hh:mm:ss').fromNow();
        
        listaComentarios += `
        <li class="list-group-item">
            <p>
                <img src="${comen.foto}" width="45px" height="45px" style="border-radius:100%;">
                <b class="mx-2">${comen.name}</b> <small>${fecha3}</small>
            </p>
            <p>${comen.comentario}</p>
        </li>

        `;
        count++;
    });
    
    listaComentarios += `</ul>`;
    
    if (count > 0) {
        document.getElementById(`collapse${ido}`).innerHTML = listaComentarios; 
    } else {
        document.getElementById(`collapse${ido}`).innerHTML = "<h5>NO HAY COMENTARIOS</h5>";
    }
};

