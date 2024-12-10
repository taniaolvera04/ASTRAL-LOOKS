const cargarInfo = async () => {
    const datos = new FormData();
    datos.append("action", "selectInfo");
    let respuesta = await fetch("assets/php/info.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    let tablaHTML = `
    <div class="container d-flex justify-content-center flex-wrap gap-3 mt-4">
`;

json.data.forEach(item => {
        tablaHTML += `
        <div class="card" style="width: 350px; margin: 10px; border: 3px solid #beaae6 !important;">
            <div class="card-body">
                <h5 class="card-title">Horario de atención:<br> ${item[1]}</h5>
                <p class="card-text"><b>Telefono: ${item[2]}</b></p>
                <p class="card-text"><b>Dirección: ${item[3]}</b></p>
                <button class="btn btn-success" onclick="mostrarInfo(${item[0]})" data-bs-toggle="modal" data-bs-target="#editarInfo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
});

tablaHTML += `</div>`;
document.getElementById('m_info').innerHTML = tablaHTML;
};

const mostrarInfo = async (idp) => {
    let datos = new FormData();
    datos.append("idi", idp);
    datos.append("action", "select");

    let respuesta = await fetch("assets/php/info.php", { method: "POST", body: datos });
    let json = await respuesta.json();

    document.querySelector("#id_i").value = json.id_i;
    document.querySelector("#ehorario").value = json.horario;
    document.querySelector("#etelefono").value = json.telefono;
    document.querySelector("#edireccion").value = json.ubicacion;
};


const actualizarInfo= async () => {
    var idp = document.querySelector("#id_i").value;
    var horario = document.querySelector("#ehorario").value;
    var telefono = document.querySelector("#etelefono").value;
    var direccion = document.querySelector("#edireccion").value;
    
    if (horario.trim() == "" || telefono.trim() == "" || direccion.trim() == "") {
        Swal.fire({title: "ERROR",text: "Tienes campos vacíos",icon: "error"});
        return;
    }
    
    let datos = new FormData();
    datos.append("idp", idp);
    datos.append("horario", horario);
    datos.append("telefono", telefono);
    datos.append("direccion", direccion); 
    datos.append('action', 'update');
    
    try {
        let respuesta = await fetch("assets/php/info.php", { method: 'POST', body: datos });
        let json = await respuesta.json();
        
        if (json.success == true) {
            Swal.fire({ title: "¡ACTUALIZACIÓN ÉXITOSA!", text: json.mensaje, icon: "success" });
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }
        cargarInfo(); 
    } catch (error) {
        console.error('Error al actualizar la informacion:', error);
        Swal.fire({ title: "ERROR", text: "Hubo un problema al procesar la solicitud", icon: "error" });
    }
}

var map = L.map('mi_mapa').setView([19.6495886,-99.0089419,217], 20);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

  L.marker([19.6495886,-99.0089419,217]).addTo(map).bindPopup("Astral Looks").openPopup();
  map.on('click', onMapClick)

  function onMapClick(e) {
    alert("Posicion: "+e.latlng)
  }