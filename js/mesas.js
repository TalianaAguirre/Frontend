const mesas = [];
let mesa = null;
const mesasTabla = document.getElementById('mesasTB');

const getToken = () => localStorage.getItem('token');

const mostrarMesas = () => {
    const tbody = mesasTabla.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    for (let item of mesas) {
        const tr = document.createElement('tr');

        const numeroTd = document.createElement('td');
        numeroTd.textContent = item.numero;

        const capacidadTd = document.createElement('td');
        capacidadTd.textContent = item.capacidad;

        const estadoTd = document.createElement('td');
        estadoTd.textContent = item.estado;

        const accionesTd = document.createElement('td');

        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.addEventListener('click', () => editarMesa(item));

        const estadoBtn = document.createElement('button');
        estadoBtn.textContent = 'Cambiar estado';
        estadoBtn.addEventListener('click', () => cambiarEstadoMesa(item.id));

        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.addEventListener('click', () => eliminarMesa(item.id));
        accionesTd.appendChild(eliminarBtn);

        accionesTd.appendChild(editarBtn);
        accionesTd.appendChild(estadoBtn);
        accionesTd.appendChild(eliminarBtn); 

        tr.appendChild(numeroTd);
        tr.appendChild(capacidadTd);
        tr.appendChild(estadoTd);
        tr.appendChild(accionesTd);

        tbody.appendChild(tr);
    }
};

const consultarMesas = async () => {
    try {
        if (mesas.length > 0) mesas.splice(0, mesas.length);
        console.log(getToken());

        const response = await fetch('http://127.0.0.1:8002/api/mesas', {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        console.log(response);
        const body = await response.json();
        body.mesas.forEach(item => mesas.push(item));
        mostrarMesas();
    } catch (ex) {
        console.error('Error en el servicio');
    }
    console.log('Fin del request...');
};

const editarMesa = (value) => {
    mesa = value;
    setMesaForm(mesa);
};

const cambiarEstadoMesa = async (id) => {
    const nuevoEstado = prompt('Nuevo estado (disponible, reservada, ocupada, fuera_servicio):');
    if (!nuevoEstado) return;
    try {
        const response = await fetch('http://127.0.0.1:8002/api/mesas/' + id + '/estado', {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        const status = response.status;
        if (status == 200) {
            consultarMesas();
        } else {
            const body = await response.json();
            alert(body.message);
        }
    } catch (ex) {
        console.error('Error en el servicio');
    }
    console.log('Fin del request...');
};
const eliminarMesa = async (id) => {
    if (!confirm('¿Eliminar esta mesa?')) return;
    try {
        const response = await fetch('http://127.0.0.1:8002/api/mesas/' + id, {
            method: 'delete',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (response.status === 200) {
            consultarMesas();
        } else {
            const body = await response.json();
            alert(body.message);
        }
    } catch (ex) {
        console.error('Error en el servicio');
    }
};
consultarMesas();