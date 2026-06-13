
const pedidos = [];
const pedidosTabla = document.getElementById('pedidosTB');

const getToken = () => localStorage.getItem('token');

const toast = (msg, tipo = 'ok') => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast toast-${tipo} visible`;
    setTimeout(() => el.classList.remove('visible'), 3000);
};

const badgePedido = (estado) => {
    const mapa = { pendiente:'Pendiente', en_preparacion:'En preparación', entregado:'Entregado', pagado:'Pagado', cancelado:'Cancelado' };
    const badge = { pendiente:'pendiente', en_preparacion:'reservada', entregado:'confirmada', pagado:'disponible', cancelado:'cancelada' };
    return `<span class="badge badge-${badge[estado] || 'pendiente'}">${mapa[estado] || estado}</span>`;
};

const mostrarPedidos = (lista = pedidos) => {
    const tbody = pedidosTabla.querySelector('tbody');
    tbody.innerHTML = '';
    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;opacity:.4;padding:24px">Sin registros</td></tr>';
        return;
    }
    for (const item of lista) {
        const tr = document.createElement('tr');
        const nProds = item.detalles ? item.detalles.length : (item.cantidad_productos ?? '—');
        tr.innerHTML = `
            <td>#${item.id}</td>
            <td>${item.mesa ? item.mesa.numero : item.mesa_id}</td>
            <td>${nProds} ítem(s)</td>
            <td>$${Number(item.total ?? 0).toLocaleString()}</td>
            <td>${badgePedido(item.estado)}</td>
            <td></td>
        `;
        const td = tr.querySelector('td:last-child');

        if (item.estado !== 'cancelado' && item.estado !== 'pagado') {
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.addEventListener('click', () => {
    pedido = item;
    document.getElementById('formTitulo').textContent = 'Editar pedido';
    cargarMesasPedido().then(() => {
        pedidoForm['mesa_id'].value = item.mesa_id;
    });
    lineas = (item.detalles ?? []).map(d => ({
        producto_id: d.producto_id,
        cantidad: d.cantidad,
        precio: d.precio_unitario,
        nombre: d.nombre_producto
    }));
    renderLineas();
});
            td.appendChild(editBtn);
        }

        const estadoBtn = document.createElement('button');
        estadoBtn.textContent = 'Estado';
        estadoBtn.addEventListener('click', () => cambiarEstadoPedido(item.id));
        td.appendChild(estadoBtn);

        tbody.appendChild(tr);
    }
};


const consultarPedidos = async (params = {}) => {
    try {
        const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v])=>v))).toString();
        const res = await fetch(`http://127.0.0.1:8004/api/pedidos${qs ? '?'+qs : ''}`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await res.json();
        pedidos.splice(0, pedidos.length, ...(body.pedidos ?? []));
        mostrarPedidos();
    } catch { toast('Error al cargar pedidos', 'err'); }
};

const cargarMesasPedido = async () => {
    try {
        const res = await fetch('http://127.0.0.1:8002/api/mesas', {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await res.json();
        const sel = document.getElementById('mesa_id');
        sel.innerHTML = '<option value="">— Seleccionar mesa —</option>';
        (body.mesas ?? []).filter(m => m.estado !== 'disponible').forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.numero} — ${m.estado}`;
            sel.appendChild(opt);
        });
    } catch { toast('Error cargando mesas', 'err'); }
};

const cambiarEstadoPedido = async (id) => {
    const estados = ['pendiente','en_preparacion','entregado','pagado','cancelado'];
    const nuevo = prompt(`Nuevo estado:\n${estados.join(', ')}`);
    if (!nuevo || !estados.includes(nuevo)) return;
    try {
        const res = await fetch(`http://127.0.0.1:8004/api/pedidos/${id}/estado`, {
            method: 'put',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
            body: JSON.stringify({ estado: nuevo })
        });
        if (res.status === 200) { toast('Estado actualizado'); consultarPedidos(); }
        else { const b = await res.json(); toast(b.message || 'Error', 'err'); }
    } catch { toast('Error en el servicio', 'err'); }
};


document.getElementById('btnFiltrar').addEventListener('click', () => {
    consultarPedidos({ estado: document.getElementById('filtroEstado').value });
});
document.getElementById('btnNuevo').addEventListener('click', () => {
    document.getElementById('pedidoForm').reset();
    pedido = null;
    document.getElementById('formTitulo').textContent = 'Nuevo pedido';
    cargarMesasPedido();
});


cargarMesasPedido();
consultarPedidos();
