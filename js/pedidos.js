/* definición de variables */
const pedidos = [];
let pedido = null;
const pedidosTabla = document.getElementById('pedidosTB');

/* definición de métodos o funciones */
const getToken = () => localStorage.getItem('token');

const mostrarPedidos = () => {
    const tbody = pedidosTabla.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    for (let item of pedidos) {
        const tr = document.createElement('tr');

        const mesaTd = document.createElement('td');
        mesaTd.textContent = item.mesa_id;

        const fechaTd = document.createElement('td');
        fechaTd.textContent = item.fecha;

        const totalTd = document.createElement('td');
        totalTd.textContent = item.total;

        const estadoTd = document.createElement('td');
        estadoTd.textContent = item.estado;

        const accionesTd = document.createElement('td');

        const verBtn = document.createElement('button');
        verBtn.textContent = 'Ver detalle';
        verBtn.addEventListener('click', () => verPedido(item.id));

        const estadoBtn = document.createElement('button');
        estadoBtn.textContent = 'Cambiar estado';
        estadoBtn.addEventListener('click', () => cambiarEstadoPedido(item.id));

        accionesTd.appendChild(verBtn);
        accionesTd.appendChild(estadoBtn);

        tr.appendChild(mesaTd);
        tr.appendChild(fechaTd);
        tr.appendChild(totalTd);
        tr.appendChild(estadoTd);
        tr.appendChild(accionesTd);

        tbody.appendChild(tr);
    }
};

const consultarPedidos = async () => {
    try {
        if (pedidos.length > 0) pedidos.splice(0, pedidos.length);
        const response = await fetch('http://127.0.0.1:8004/api/pedidos', {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await response.json();
        body.pedidos.forEach(item => pedidos.push(item));
        mostrarPedidos();
    } catch (ex) {
        console.error('Error en el servicio');
    }
    console.log('Fin del request...');
};

const verPedido = async (id) => {
    try {
        const response = await fetch('http://127.0.0.1:8004/api/pedidos/' + id, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await response.json();
        if (body.success) {
            pedido = body.pedido;
            alert('Pedido #' + pedido.id + ' - Total: ' + pedido.total);
        }
    } catch (ex) {
        console.error('Error en el servicio');
    }
    console.log('Fin del request...');
};

const cambiarEstadoPedido = async (id) => {
    const nuevoEstado = prompt('Nuevo estado (pendiente, en_preparacion, entregado, pagado, cancelado):');
    if (!nuevoEstado) return;
    try {
        const response = await fetch('http://127.0.0.1:8004/api/pedidos/' + id + '/estado', {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        const status = response.status;
        if (status == 200) {
            consultarPedidos();
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
consultarPedidos();