/* definición de variables */
const reservas = [];
let reserva = null;
const reservasTabla = document.getElementById('reservasTB');

/* definición de métodos o funciones */
const getToken = () => localStorage.getItem('token');

const mostrarReservas = () => {
    const tbody = reservasTabla.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    for (let item of reservas) {
        const tr = document.createElement('tr');

        const nombreTd = document.createElement('td');
        nombreTd.textContent = item.nombre_cliente;

        const fechaTd = document.createElement('td');
        fechaTd.textContent = item.fecha;

        const horaTd = document.createElement('td');
        horaTd.textContent = item.hora;

        const estadoTd = document.createElement('td');
        estadoTd.textContent = item.estado;

        const accionesTd = document.createElement('td');

        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.addEventListener('click', () => editarReserva(item));

        const cancelarBtn = document.createElement('button');
        cancelarBtn.textContent = 'Cancelar';
        cancelarBtn.addEventListener('click', () => cancelarReserva(item.id));

        accionesTd.appendChild(editarBtn);
        accionesTd.appendChild(cancelarBtn);

        tr.appendChild(nombreTd);
        tr.appendChild(fechaTd);
        tr.appendChild(horaTd);
        tr.appendChild(estadoTd);
        tr.appendChild(accionesTd);

        tbody.appendChild(tr);
    }
};

const consultarReservas = async () => {
    try {
        if (reservas.length > 0) reservas.splice(0, reservas.length);
        const response = await fetch('http://127.0.0.1:8002/api/reservas', {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await response.json();
        body.reservas.forEach(item => reservas.push(item));
        mostrarReservas();
    } catch (ex) {
        console.error('Error en el servicio');
    }
    console.log('Fin del request...');
};

const editarReserva = (value) => {
    reserva = value;
    setReservaForm(reserva);
};

const cancelarReserva = async (id) => {
    try {
        const response = await fetch('http://127.0.0.1:8002/api/reservas/' + id + '/cancelar', {
            method: 'put',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const status = response.status;
        if (status == 200) {
            consultarReservas();
        } else {
            const body = await response.json();
            alert(body.message);
        }
    } catch (ex) {
        console.error('Error en el servicio');
    }
    console.log('Fin del request...');
};

/* llamado de funciones por defecto */
consultarReservas();