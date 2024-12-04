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
        <div class="card" style="width: 200px; margin: 10px;">
            <img src="${imagenPath}" height="200px" class="card-img-top" alt="Imagen del corte">
            <div class="card-body text-center">
                <h5 class="card-title">${item[1]}</h5>
                <p><b>PRECIO: </b>$${item[2]}</p>
                </button>
            </div>
        </div>
    `;
});

tablaHTML += `</div>`;
document.getElementById('mostrar').innerHTML = tablaHTML;

}