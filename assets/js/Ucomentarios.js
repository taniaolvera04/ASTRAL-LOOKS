const usuario = JSON.parse(localStorage.getItem("usuario"));


const cargarOpinions = async () => {
    let datos = new FormData();
    datos.append("action", "selectAll");
    let respuesta = await fetch("assets/php/comentarios.php", {method: 'POST', body: datos});
    let json = await respuesta.json();
    
    console.log(json); // Verifica si hay datos aquí

    var divO = ``;
    json.map(opi => {
        moment.locale("es");
        moment().format("L");

        var fecha3 = moment(opi.fecha, 'YYYY-MM-DD hh:mm:ss').fromNow();

        divO += `
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
            </div>
        `;
    });

    document.getElementById('divOpinions').innerHTML = divO;
};


    
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

