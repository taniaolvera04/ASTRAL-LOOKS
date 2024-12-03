const registrarUsuario = async () => {
    let name = document.getElementById("name-log").value.trim();
    let email = document.getElementById("email-log").value.trim();
    let password = document.getElementById("password-log").value.trim();

    if (!name || !email || !password) {
        Swal.fire({ title: "ERROR", text: "Todos los campos son obligatorios.", icon: "error" });
        return;
    }

    let datos = new FormData();
    datos.append("action", "register");
    datos.append("name", name);
    datos.append("email", email);
    datos.append("password", password);

    try {
        let respuesta = await fetch("assets/php/login.php", { method: "POST", body: datos });
        let json = await respuesta.json();

        if (json.success) {
            Swal.fire({ title: "¡REGISTRO ÉXITOSO!", text: `Bienvenido, ${name}`, icon: "success" });
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        Swal.fire({ title: "ERROR", text: "Hubo un problema al procesar la solicitud.", icon: "error" });
    }
};

const iniciarSesion = async () => {
    let email = document.getElementById("email-sing").value.trim();
    let password = document.getElementById("password-sing").value.trim();

    if (!email || !password) {
        Swal.fire({ title: "ERROR", text: "Todos los campos son obligatorios.", icon: "error" });
        return;
    }

    let datos = new FormData();
    datos.append("action", "login");
    datos.append("email", email);
    datos.append("password", password);

    try {
        let respuesta = await fetch("assets/php/login.php", { method: "POST", body: datos });
        let json = await respuesta.json();

        if (json.success) {
            localStorage.setItem("usuario", JSON.stringify({
                name: json.mensaje.split(', ')[1], 
                email: email,
                foto: json.foto || 'assets/imgUsers/icon.png'
            }));
            Swal.fire({ title: "Éxito", text: "Sesión iniciada correctamente", icon: "success" });
            window.location.href = json.isAdmin ? "citas.html" : "info.html";
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        Swal.fire({ title: "ERROR", text: "Hubo un problema al procesar la solicitud.", icon: "error" });
    }
};

const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
};

const cargarPerfil = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario) {
        document.getElementById("user-name").textContent = usuario.name;
        document.getElementById("user-email").textContent = usuario.email;
        document.getElementById("user-photo").src = usuario.foto || 'assets/imgUsers/icon.png';

        // Llenar el input del nombre en la modal de edición
        document.getElementById("update-name").value = usuario.name;
    } else {
        window.location.href = "index.html";
    }
};

// Ejecutar la carga de perfil al cargar la página.
window.onload = cargarPerfil;


function previewPhoto() {
    const fileInput = document.getElementById("update-photo");
    const preview = document.getElementById("photo-preview");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = "none";
    }
}


const actualizarPerfil = async () => {
    const name = document.getElementById("update-name").value.trim();
    const photo = document.getElementById("update-photo").files[0];

    if (!name) {
        Swal.fire({ title: "ERROR", text: "El nombre no puede estar vacío.", icon: "error" });
        return;
    }

    const datos = new FormData();
    datos.append("action", "updateProfile");
    datos.append("name", name);
    if (photo) datos.append("photo", photo);

    try {
        const response = await fetch("assets/php/login.php", { method: "POST", body: datos });
        const data = await response.json();

        if (data.success) {
            Swal.fire({ title: "Éxito", text: data.mensaje, icon: "success" });
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            usuario.name = name;
            if (data.newPhoto) usuario.foto = data.newPhoto;
            localStorage.setItem("usuario", JSON.stringify(usuario));
            cargarPerfil();
        } else {
            Swal.fire({ title: "ERROR", text: data.mensaje, icon: "error" });
        }
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        Swal.fire({ title: "ERROR", text: "Error al procesar la solicitud.", icon: "error" });
    }
};

