// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await inicializarTareas();
        setInterval(validarTareas, 60000); // Validar cada minuto (opcional)
    } catch (error) {
        console.error("Error al cargar tareas:", error);
    }
});

// Función para obtener tareas desde el servidor
async function obtenerTareasDelMes() {
    const tareas = [
        "Realiza 2 citas para cualquier peinado",
        "Realiza 2 citas para cualquier corte",
        "Gasta aproximadamente $200 en cortes",
        "Compra un paquete de 3 cortes",
        "Reserva 3 peinados durante el mes",
        "Asiste a una cita antes del día 15 del mes",
        "Realiza un gasto total superior a $300",
        "Reserva al menos 4 citas en el mes"
    ];
    // Elegir 3 tareas aleatorias
    const tareasAleatorias = [];
    while (tareasAleatorias.length < 3) {
        const tarea = tareas[Math.floor(Math.random() * tareas.length)];
        if (!tareasAleatorias.includes(tarea)) {
            tareasAleatorias.push(tarea);
        }
    }
    return tareasAleatorias.map((descripcion, index) => ({
        id: index + 1,
        descripcion,
        completada: false,
    }));
}

// Función para inicializar la lógica de tareas
async function inicializarTareas() {
    try {
        const tareas = await obtenerTareasDelServidor();
        if (tareas.length === 0) {
            await generarNuevasTareas();
        }
        await mostrarTareas(); // Mostrar tareas iniciales
        await validarTareas(); // Validar tareas solo una vez
    } catch (error) {
        console.error("Error al inicializar las tareas:", error);
    }
}

// Función para obtener tareas del servidor
async function obtenerTareasDelServidor() {
    try {
        const response = await fetch("assets/php/tareas.php?action=obtenerTareas");
        return await response.json();
    } catch (error) {
        console.error("Error al obtener las tareas del servidor:", error);
        return [];
    }
}

// Función para generar nuevas tareas
async function generarNuevasTareas() {
    try {
        const nuevasTareas = await obtenerTareasDelMes();
        await fetch("assets/php/tareas.php?action=guardarTareas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevasTareas),
        });
    } catch (error) {
        console.error("Error al generar nuevas tareas:", error);
    }
}

// Función para mostrar tareas en la interfaz
let tareasMarcadas = false; // Variable de control global para evitar bucles

async function mostrarTareas() {
    const listaTareas = document.getElementById("tareasLista");
    const contenedorCupones = document.getElementById("contenedorCupones");
    listaTareas.innerHTML = "";

    try {
        const tareas = await obtenerTareasDelServidor();

        if (tareas.every(tarea => tarea.completada)) {
            listaTareas.innerHTML = `<p>Espera al siguiente mes para más tareas.</p>`;
            contenedorCupones.style.display = "block";

            if (!tareasMarcadas) { 
                tareasMarcadas = true; 
                await validarTareas(); // Validar tareas completas
            }

            return; 
        }

        tareas.forEach((tarea) => {
            const tareaItem = document.createElement("li");
            tareaItem.innerHTML = `
                <label>
                    <span style="text-decoration: ${tarea.completada ? "line-through" : "none"};">
                        ${tarea.descripcion}
                    </span>
                    ${tarea.completada ? "✅" : ""}
                </label>
            `;
            listaTareas.appendChild(tareaItem);
        });
    } catch (error) {
        console.error("Error al mostrar las tareas:", error);
        listaTareas.innerHTML = "<li>Error al cargar las tareas</li>";
    }
}

async function marcarTarea() {
    try {
        const tareas = await obtenerTareasDelServidor();
        
        // Revisar si todas las tareas están completadas
        if (tareas.every(tarea => tarea.completada)) {
            console.warn("Todas las tareas ya están completadas.");
            
            // Generar cupón solo después de completar las 3 tareas
            const response = await fetch("assets/php/tareas.php?action=validarTareas");
            if (!response.ok) throw new Error(`Error al validar tareas: ${await response.text()}`);
            
            const result = await response.json();
            if (result.cuponGenerado) {
                mostrarCupones();
                Swal.fire({
                    title: "¡Felicidades!",
                    text: `Ya tienes un cupón: ${result.cupon.beneficio}`,
                    icon: "success",
                    confirmButtonText: "Aceptar",
                });
            }
            return;
        }

        // Marcar una tarea pendiente como completada
        const tareaPendiente = tareas.find(tarea => !tarea.completada);
        if (tareaPendiente) {
            const response = await fetch("assets/php/tareas.php?action=marcarTarea", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: tareaPendiente.id }),
            });

            if (!response.ok) {
                throw new Error(`Error al marcar tarea: ${await response.text()}`);
            }

            const result = await response.json();
            if (result.completadas === 3) {
                const beneficio = result.beneficio || "Sin beneficio asignado";

                Swal.fire({
                    title: "¡Felicidades!",
                    text: `Has ganado un cupón: ${beneficio}`,
                    icon: "success",
                    confirmButtonText: "Aceptar",
                });
                mostrarCupones();
            }
        }
        mostrarTareas(); // Actualizar la lista
    } catch (error) {
        console.error("Error al marcar la tarea:", error);
    }
}


// Variable global para evitar múltiples alertas
let cuponAlertado = false;

// Función para validar tareas y mostrar cupón si corresponde
async function validarTareas() {
    try {
        const response = await fetch("assets/php/tareas.php?action=validarTareas");
        if (!response.ok) throw new Error(`Error del servidor: ${response.statusText}`);

        const data = await response.json();

        console.log("Validación de tareas:", data);
        console.log("VALOS CUPON: ",data.cupon);

        // Manejar lógica de cupón
        if (data.cupon) {
            const { canjeado, beneficio } = data.cupon;
            if (canjeado && !cuponAlertado) {
                Swal.fire({
                    title: "¡Cupón Canjeado!",
                    text: "Este cupón ya fue utilizado.",
                    icon: "warning",
                    confirmButtonText: "Aceptar",
                });
                cuponAlertado = true;
            } else if (!canjeado && !cuponAlertado) {
                Swal.fire({
                    title: "¡Tienes un Cupón!",
                    text: `Beneficio: ${beneficio || "Sin beneficio asignado"}`,
                    icon: "info",
                    confirmButtonText: "Aceptar",
                });
                cuponAlertado = true;
            }
        } else if (data.tareas && data.tareas.every(t => t.completada) && !cuponAlertado) {
            Swal.fire({
                title: "¡Tareas completadas!",
                text: "Has cumplido todas las tareas del mes.",
                icon: "success",
                confirmButtonText: "Aceptar",
            });
            cuponAlertado = true;

        }
        await mostrarTareas();
        await mostrarCupones();
    } catch (error) {
        console.error("Error al validar las tareas:", error);
    }
}


// Función para mostrar cupones en la interfaz
async function mostrarCupones() {
    const contenedorCupones = document.getElementById("contenedorCupones");
    contenedorCupones.innerHTML = "";

    try {
        const response = await fetch("assets/php/tareas.php?action=obtenerCupones");
        if (!response.ok) throw new Error(`Error al obtener los cupones: ${response.statusText}`);

        const text = await response.text();
        const cupones = text ? JSON.parse(text) : [];

        if (cupones.length === 0) {
            contenedorCupones.style.display = "none";
            return;
        }

        cupones.forEach(cupon => {
            const { beneficio, fecha, canjeado } = cupon;
            const estado = canjeado ? "Canjeado" : "Pendiente de canje";
            const estadoClass = canjeado ? "canjeado" : "pendiente";

            const cuponItem = document.createElement("div");
            cuponItem.classList.add("cupon");
            cuponItem.innerHTML = `
                <div class="cupon-contenido">
                    <p>${beneficio}</p>
                    <span class="fecha">Ganado el: ${fecha}</span>
                    <span class="${estadoClass}">${estado}</span>
                </div>
            `;
            contenedorCupones.appendChild(cuponItem);
        });
        contenedorCupones.style.display = "block";
    } catch (error) {
        console.error("Error al mostrar los cupones:", error);
    }
}
