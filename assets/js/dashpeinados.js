const masPedidos1 = async () => {
    const action = document.getElementById('action1');
    action.innerHTML = '';

    const datos = new FormData();
    datos.append("action", "PeinadosMasPedidos");

    let respuesta = await fetch("assets/php/dashboard.php", { method: 'POST', body: datos });
    let json = await respuesta.json();
    console.log(json);


    const obtenerNombreMes = (mes) => {
        const meses = {
            '01': 'Enero 2024', '02': 'Febrero 2024', '03': 'Marzo 2024', '04': 'Abril 2024',
            '05': 'Mayo 2024', '06': 'Junio 2024', '07': 'Julio 2024', '08': 'Agosto 2024',
            '09': 'Septiembre 2024', '10': 'Octubre 2024', '11': 'Noviembre 2024', '12': 'Diciembre 2024'
        };
        return meses[mes.slice(5, 7)] || mes;
    };
    if (!json.data || json.data.length === 0) {
        console.log("No se recibieron datos");
        return;
    }
    
    if (json.data) {
        const peinados = json.data;

        const dataGroupedByMonth = {};

        peinados.forEach(item => {
            const { mes, peinado, cantidad } = item;
            if (!dataGroupedByMonth[mes]) {
                dataGroupedByMonth[mes] = {};
            }
            dataGroupedByMonth[mes][peinado] = cantidad;
        });

        const mesesDelAno = [
            '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
            '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'
        ];

        const meses = mesesDelAno.map(mes => obtenerNombreMes(mes));

        const peinadoLabels = [...new Set(peinados.map(item => item.peinado))];
        const datasets = peinadoLabels.map(corte => {
            return {
                label: corte,
                data: mesesDelAno.map(mes => dataGroupedByMonth[mes] && dataGroupedByMonth[mes][corte] || 0),
                backgroundColor: '#1a98ff', 
                borderColor: '#005eff',  
                borderWidth: 1
            };
        });

        let canvasPeinados = document.createElement('canvas');
        canvasPeinados.id = 'canvasPeinados';
        action.appendChild(canvasPeinados);

        let ctxPeinados = canvasPeinados.getContext('2d');
        let chartPeinados = new Chart(ctxPeinados, {
            type: 'bar',
            data: {
                labels: meses,
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    } else {
        console.log("No se recibieron datos");
    }
};
