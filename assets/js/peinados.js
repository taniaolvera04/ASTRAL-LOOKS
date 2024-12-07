const guardarPeinado = async () => {
    let nombre = document.getElementById('nombrePeinado').value;
    let descripcion = document.getElementById('descripcion').value;
    let tiempo = document.getElementById('tiempo').value;
    let precio = document.getElementById('precio').value;
    let imagen = document.getElementById('imagen').files[0];

    if (!nombre || !descripcion || !tiempo || !precio || !imagen) {
        Swal.fire({ title: "ERROR", text: "Todos los campos son obligatorios", icon: "error" });
        return;
    }

    let datos = new FormData();
    datos.append("nombre", nombre);
    datos.append("descripcion", descripcion);
    datos.append("tiempo", tiempo);
    datos.append("precio", precio);
    datos.append("imagen", imagen);
    datos.append("action", "guardar");

    try {
        let respuesta = await fetch("assets/php/peinados.php", { method: 'POST', body: datos });
        let json = await respuesta.json();
        Swal.fire({ title: json.success ? "¡Registro Exitoso!" : "ERROR", text: json.mensaje, icon: json.success ? "success" : "error" });
        if (json.success) cargarPeinados();
    } catch (error) {
        console.error('Error:', error);
    }
};

const cargarPeinados = async () => {
    let datos = new FormData();
    datos.append("action", "mostrar");
    let respuesta = await fetch("assets/php/peinados.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    let tablaHTML = '';
    json.data.forEach(peinado => {
        tablaHTML += `
        <tr>
            <td>${peinado.nombre}</td>
            <td>${peinado.descripcion}</td>
            <td>${peinado.tiempo} minutos</td>
            <td>$${peinado.precio}</td>
            <td><img src="assets/imgPeinados/${peinado.imagen}" height="90" class="rounded"></td>
            <td>
                <button class="btn btn-info btn-sm" onclick="mostrarPeinado(${peinado.id_peinado})" data-bs-toggle="modal" data-bs-target="#updateModal"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg></button>
                <button class="btn btn-danger btn-sm" onclick="eliminarPeinado(${peinado.id_peinado})"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                    </svg></button>
            </td>
        </tr>
        `;
    });
    document.querySelector("tbody").innerHTML = tablaHTML;
};

const vistaPrevia = (inputId, previewId) => {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.style.display = "none";
    }
};

const mostrarPeinado = async (id_peinado) => {
    let datos = new FormData();
    datos.append("id_peinado", id_peinado);
    datos.append("action", "mostrarUno");

    let respuesta = await fetch("assets/php/peinados.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    document.getElementById('updateIdPeinado').value = json.id_peinado;
    document.getElementById('updateNombrePeinado').value = json.nombre;
    document.getElementById('updateDescripcion').value = json.descripcion;
    document.getElementById('updateTiempo').value = json.tiempo;
    document.getElementById('updatePrecio').value = json.precio;
    document.getElementById('previewActualizar').src = `assets/imgPeinados/${json.imagen}`;
    document.getElementById('previewActualizar').style.display = "block";
};


const actualizarPeinado = async () => {
    let id_peinado = document.getElementById('updateIdPeinado').value; // Cambia dataset.id_peinado por value
    let nombre = document.getElementById('updateNombrePeinado').value;
    let descripcion = document.getElementById('updateDescripcion').value;
    let tiempo = document.getElementById('updateTiempo').value;
    let precio = document.getElementById('updatePrecio').value;
    let imagen = document.getElementById('updateImagen').files[0] || null;
    
    let datos = new FormData();
    datos.append("id_peinado", id_peinado);
    datos.append("nombre", nombre);
    datos.append("descripcion", descripcion);
    datos.append("tiempo", tiempo);
    datos.append("precio", precio);
    datos.append("imagen", imagen);
    datos.append("action", "actualizar");

    try {
        let respuesta = await fetch("assets/php/peinados.php", { method: 'POST', body: datos });
        let json = await respuesta.json();
        if (json.success) {
            Swal.fire({ title: "¡Actualización Exitosa!", text: json.mensaje, icon: "success" });
            document.getElementById("updateImagen").value = "";
            cargarPeinados();
            
            
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({ title: "ERROR", text: "Error al comunicarse con el servidor", icon: "error" });
    }
    
};

const eliminarPeinado = async (id_peinado) => {
    Swal.fire({
        title: "¿Estás seguro de eliminarlo?",
        showDenyButton: true,
        confirmButtonText: "Sí",
        denyButtonText: "No"
    }).then(async (result) => {
        if (result.isConfirmed) {
            let datos = new FormData();
            datos.append("id_peinado", id_peinado);
            datos.append("action", "eliminar");

            try {
                let respuesta = await fetch("assets/php/peinados.php", { method: 'POST', body: datos });
                let json = await respuesta.json();
                Swal.fire({ title: json.success ? "¡Eliminación Exitosa!" : "ERROR", text: json.mensaje, icon: json.success ? "success" : "error" });
                if (json.success) cargarPeinados();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', cargarPeinados);
