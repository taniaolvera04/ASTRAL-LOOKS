const cortes =async()=>{
    const datos = new FormData();
    datos.append("action", "selectAllC");
    let respuesta = await fetch("assets/php/cortes.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    let tablaHTML = `
    <div class="container d-flex justify-content-center flex-wrap gap-3 mt-4">
`;

json.data.forEach(item => {
    const imagenPath = item[3].includes("assets/imgCortes/")
        ? item[3]
        : `assets/imgCortes/${item[3]}`;

    tablaHTML += `
        <div class="card" style="width: 200px; margin: 10px; 3px solid #fee3ec;">
            <img src="${imagenPath}" height="200px" class="card-img-top" alt="Imagen del corte">
            <div class="card-body">
                <h5 class="card-title">${item[1]}</h5>
                </button>
            </div>
        </div>
    `;
});

tablaHTML += `</div>`;
document.getElementById('mostrar').innerHTML = tablaHTML
}

const peinados = async () => {
    const datos = new FormData();
    datos.append("action", "mostrar");
    let respuesta = await fetch("assets/php/peinados.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    let tablaHTML = `
    <div class="container d-flex justify-content-center flex-wrap gap-3 mt-4">
    `;

    json.data.forEach(item => {
        const imagenPath = item.imagen.includes("assets/imgPeinados/")
            ? item.imagen
            : `assets/imgPeinados/${item.imagen}`;

        tablaHTML += `
        <div class="card" style="width: 200px; margin: 10px; border:4px solid #fee3ec;">
            <img src="${imagenPath}" height="200px" class="card-img-top" alt="${item.nombre}">
            <div class="card-body">
                <h5 class="card-title">${item.nombre}</h5>
                <p class="card-text">${item.descripcion}</p>
                <p class="card-text"><strong>Precio:</strong> $${item.precio}</p>
                <p class="card-text"><strong>Tiempo:</strong> ${item.tiempo} mins</p>
            </div>
        </div>
        `;
    });

    tablaHTML += `</div>`;
    document.getElementById('mostrarP').innerHTML = tablaHTML;
};
