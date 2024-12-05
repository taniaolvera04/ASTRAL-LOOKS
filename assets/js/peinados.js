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
            <td><img src="assets/imgPeinados/${peinado.imagen}" width="60" height="60" class="rounded"></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="mostrarPeinado(${peinado.id_peinado})" data-bs-toggle="modal" data-bs-target="#updateModal">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarPeinado(${peinado.id_peinado})">Eliminar</button>
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
