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
            </div>
        </div>
    `;
    
});

tablaHTML += `</div>`;
document.getElementById('m_infor').innerHTML = tablaHTML;
};

var map = L.map('mi_mapa').setView([19.6495886,-99.0089419,217], 20);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

  L.marker([19.6495886,-99.0089419,217]).addTo(map).bindPopup("Astral Looks").openPopup();
  map.on('click', onMapClick)

  function onMapClick(e) {
    alert("Posicion: "+e.latlng);
  }