const guardarProducto = async () => {
    let producto = document.getElementById('producto').value;
    let cantidad = document.getElementById('cantidad').value;
    let img = document.getElementById('img').files[0]; 
    
    if (producto.trim() == "" || cantidad.trim() == "") {
        Swal.fire({title: "ERROR", text: "Falta completar campos",icon: "error"});
        return;
    }

    let datos = new FormData();
    datos.append("producto", producto);
    datos.append("cantidad", cantidad);
    datos.append("img", img);
    datos.append('action', 'guardar');

    try {
        let respuesta = await fetch("assets/php/metodos.php", { method: 'POST', body: datos });
        let json = await respuesta.json();

        if (json.success == true) {
            Swal.fire({
                title: "¡REGISTRO ÉXITOSO!",
                text: json.mensaje,
                icon: "success"
            });
            limpiarP();
            cargarProductos();
        } else {
            Swal.fire({
                title: "ERROR",
                text: json.mensaje,
                icon: "error"
            });
        }
    } catch (error) {
        console.error('Error al guardar el articulo:', error);
        Swal.fire({
            title: "ERROR",
            text: "Hubo un problema al procesar la solicitud",
            icon: "error"
        });
    }
}

const cargarProductos = async () => {
    const datos = new FormData();
    datos.append("action", "selectAll");
    let respuesta = await fetch("assets/php/metodos.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    let tablaHTML = `
    <div class="container d-flex justify-content-center flex-wrap gap-3 mt-4">
`;

json.data.forEach(item => {
    const imagenPath = item[3].includes("assets/img_productos/")
        ? item[3]  // Usa directamente si ya incluye el prefijo
        : `assets/img_productos/${item[3]}`; // Agrega el prefijo si es necesario

        tablaHTML += `
        <div class="card" style="width: 200px; margin: 10px; border: 3px solid #beaae6 !important;">
            <img src="${imagenPath}" height="200px" class="card-img-top" alt="Imagen del producto">
            <div class="card-body">
                <h5 class="card-title">${item[1]}</h5>
                <p class="card-text">Cantidad: ${item[2]}</p>
                <button class="btn btn-danger" onclick="eliminarProducto(${item[0]})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash2-fill" viewBox="0 0 16 16">
                        <path d="M2.037 3.225A.7.7 0 0 1 2 3c0-1.105 2.686-2 6-2s6 .895 6 2a.7.7 0 0 1-.037.225l-1.684 10.104A2 2 0 0 1 10.305 15H5.694a2 2 0 0 1-1.973-1.671z"/>
                    </svg>
                </button>
                <button class="btn btn-success" onclick="mostrarProducto(${item[0]})" data-bs-toggle="modal" data-bs-target="#editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
});


tablaHTML += `</div>`;

document.getElementById('mostrar').innerHTML = tablaHTML;

};

const eliminarProducto = async (idp) => {
    Swal.fire({
        title: "¿Estás seguro de eliminarlo?",
        showDenyButton: true,
        confirmButtonText: "Si",
        denyButtonText: "No"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {

                let formData = new FormData();
                formData.append('idp', idp);
                formData.append('action', 'delete');

                let respuesta = await fetch("assets/php/metodos.php", {
                    method: 'POST',
                    body: formData
                });

                if (respuesta.ok) {
                    let json = await respuesta.json();

                    if (json.success) {
                        Swal.fire({
                            title: "¡Se eliminó con éxito!",
                            text: json.mensaje,
                            icon: "success"
                        });

                        cargarProductos();
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
                console.error('Error al eliminar la prenda:', error);
                Swal.fire({
                    title: "Error",
                    text: "Hubo un problema al intentar eliminar la prenda",
                    icon: "error"
                });
            }
        }
    });
}


const mostrarProducto = async (idp) => {
    let datos = new FormData();
    datos.append("idp", idp);
    datos.append("action", "select");

    let respuesta = await fetch("assets/php/metodos.php", { method: "POST", body: datos });
    let json = await respuesta.json();

    document.querySelector("#idp").value = json.id_p;
    document.querySelector("#eproducto").value = json.producto;
    document.querySelector("#ecantidad").value = json.cantidad;

    const imagenPath = json.imagen.includes("assets/img_productos/")
        ? json.imagen 
        : `assets/img_productos/${json.imagen}`;

    document.getElementById("eimagen").src = imagenPath;
};


const actualizarProducto= async () => {
    var idp = document.querySelector("#idp").value;
    var producto = document.querySelector("#eproducto").value;
    var cantidad = document.querySelector("#ecantidad").value;
    var img = document.querySelector("#eimg").files[0];
    
    if (producto.trim() == "" || cantidad.trim() == "" ) {
        Swal.fire({title: "ERROR",text: "Tienes campos vacíos",icon: "error"});
        return;
    }
    
    let datos = new FormData();
    datos.append("idp", idp);
    datos.append("producto", producto);
    datos.append("cantidad", cantidad);
    datos.append("img1", img); 
    datos.append('action', 'update');
    
    try {
        let respuesta = await fetch("assets/php/metodos.php", { method: 'POST', body: datos });
        let json = await respuesta.json();
        
        if (json.success == true) {
            Swal.fire({ title: "¡ACTUALIZACIÓN ÉXITOSA!", text: json.mensaje, icon: "success" });
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }
        cargarProductos(); 
        document.querySelector("#eimg").value="";
    } catch (error) {
        console.error('Error al actualizar la prenda:', error);
        Swal.fire({ title: "ERROR", text: "Hubo un problema al procesar la solicitud", icon: "error" });
    }
}


const limpiarP = () => {
    document.getElementById("producto").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("img").value = "";
}