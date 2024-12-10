const cargarInfo = async () => {
    const datos = new FormData();
    datos.append("action", "selectInfo");
    let respuesta = await fetch("assets/php/info.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    let tablaHTML = `
    <div class="container d-flex justify-content-center flex-wrap gap-3 mt-4">
`;

json.data.forEach(item => {
    let telefono = item[2];
        tablaHTML += `
        <div class="card" style="width: 350px; margin: 10px; border: 3px solid #beaae6 !important;">
            <div class="card-body">
                <h5 class="card-title">Horario de atención:<br> ${item[1]}</h5>
                <p class="card-text"><b>Telefono: ${telefono}</b></p>
                <p class="card-text"><b>Dirección: ${item[3]}</b></p>
                <button class="btn btn-success mx-3" style="border-radius:100%" onclick="realizarLlamada('${telefono}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone-outbound-fill" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877zM11 .5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V1.707l-4.146 4.147a.5.5 0 0 1-.708-.708L14.293 1H11.5a.5.5 0 0 1-.5-.5"/>
                    </svg>
                </button>
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


  function realizarLlamada(telefono) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        window.location.href = `tel:${telefono}`;
    } else {
        window.location.href = `tel:${telefono}`;
    }
}