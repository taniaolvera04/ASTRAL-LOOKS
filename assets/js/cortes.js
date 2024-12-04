const guardarCorte = async () => {
    let corte = document.getElementById('corte').value;
    let precio = document.getElementById('precio').value;
    let img = document.getElementById('img').files[0];

    if (corte.trim() === "" || precio.trim() === "") {
        Swal.fire({ title: "ERROR", text: "CAMPOS VACÍOS", icon: "error" });
        return;
    }

    let datos = new FormData();
    datos.append("corte", corte);
    datos.append("precio", precio);
    datos.append("img", img);
    datos.append("action", "guardarC");

    try {
        let respuesta = await fetch("assets/php/cortes.php", { method: 'POST', body: datos });
        let json = await respuesta.json();
        Swal.fire({ title: json.success ? "¡REGISTRO ÉXITOSO!" : "ERROR", text: json.mensaje, icon: json.success ? "success" : "error" });
        if (json.success) limpiarP();
        cargarCortes();
    } catch (error) {
        console.error('Error:', error);
    }
};

const cargarCortes = async () => {
    const datos = new FormData();
    datos.append("action", "selectAllC");
    let respuesta = await fetch("assets/php/cortes.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    let tablaHTML = ``

    json.data.forEach(item => {
        tablaHTML += `
        <tr>
            <td>${item[1]}</td>
            <td>${item[2]}</td>
            <td><img src="assets/imgCortes/${item[3]}" height="90px"></td>
            <td colspan="2">

                <button class="btn btn-info btn-sm" onclick="mostrarCorte(${item[0]})"  data-bs-toggle="modal" data-bs-target="#editCorte">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarCorte(${item[0]})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                    </svg>
                </button>
            </td>
        </tr>
    `;
    
    });

    tablaHTML += `</tbody></table></center>`;

    document.getElementById("cortes").innerHTML = tablaHTML;
};



const mostrarCorte=async(idc)=>{
    let datos=new FormData();
    datos.append("idc",idc);
    datos.append('action','selectC');
    
    let respuesta=await fetch("assets/php/cortes.php",{method:'POST',body:datos});
    let json=await respuesta.json();

    document.querySelector("#idc").value=json.id_c;
    document.querySelector("#ecorte").value=json.corte;
    document.querySelector("#eprecio").value=json.precio;
    document.getElementById("eimg").src="../img_cortes/"+json.img;
   
}

const actualizarCorte= async () => {
    var idc = document.querySelector("#idc").value;
    var corte = document.querySelector("#ecorte").value;
    var precio = document.querySelector("#eprecio").value;
    var img = document.querySelector("#eimg").files[0];
    
    if (corte.trim() == "" || precio.trim() == "" ) {
        Swal.fire({title: "ERROR",text: "Tienes campos vacíos",icon: "error"});
        return;
    }
    
    let datos = new FormData();
    datos.append("idc", idc);
    datos.append("corte", corte);
    datos.append("precio", precio);
    datos.append("imgc", img); 
    datos.append('action', 'updateC');
    
    try {
        let respuesta = await fetch("assets/php/cortes.php", { method: 'POST', body: datos });
        let json = await respuesta.json();
        
        if (json.success == true) {
            Swal.fire({ title: "¡ACTUALIZACIÓN ÉXITOSA!", text: json.mensaje, icon: "success" });
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }
        cargarCortes(); 
        document.querySelector("#eimg").value="";
    } catch (error) {
        console.error('Error al actualizar el corte:', error);
        Swal.fire({ title: "ERROR", text: "Hubo un problema al procesar la solicitud", icon: "error" });
    }
}



const eliminarCorte = async (idc) => {
    Swal.fire({
        title: "¿Estás seguro de eliminarlo?",
        showDenyButton: true,
        confirmButtonText: "Si",
        denyButtonText: "No"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {

                let formData = new FormData();
                formData.append('idc', idc);
                formData.append('action', 'deleteC');

                let respuesta = await fetch("assets/php/cortes.php", {
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

                        cargarCortes();
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
                console.error('Error al eliminar el corte:', error);
                Swal.fire({
                    title: "Error",
                    text: "Hubo un problema al intentar eliminar el corte",
                    icon: "error"
                });
            }
        }
    });
}




const limpiarP = () => {
    document.getElementById("corte").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("img").value = "";
}