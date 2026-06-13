const pedidoForm = document.forms['pedidoForm'];
let pedido = null;
let lineas = [];       // [{producto_id, cantidad, precio, nombre}]
let catalogoProductos = [];

const cargarCatalogo = async () => {
    try {
        const res = await fetch('http://127.0.0.1:8003/api/productos', {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await res.json();
        catalogoProductos = (body.productos ?? []).filter(p => p.disponible);
    } catch { toast('Error cargando productos', 'err'); }
};

const renderLineas = () => {
    const cont = document.getElementById('listaProductos');
    cont.innerHTML = '';
    let subtotal = 0;

    lineas.forEach((l, i) => {
        subtotal += l.precio * l.cantidad;

        const fila = document.createElement('div');
        fila.className = 'linea-pedido';

        const sel = document.createElement('select');
        catalogoProductos.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nombre} ($${p.precio})`;
            if (p.id === l.producto_id) opt.selected = true;
            sel.appendChild(opt);
        });
        sel.addEventListener('change', () => {
            const p = catalogoProductos.find(x => x.id == sel.value);
            if (p) { lineas[i].producto_id = p.id; lineas[i].precio = p.precio; lineas[i].nombre = p.nombre; }
            renderLineas();
        });

        const qty = document.createElement('input');
        qty.type = 'number'; qty.min = 1; qty.value = l.cantidad;
        qty.addEventListener('change', () => { lineas[i].cantidad = Math.max(1, Number(qty.value)); renderLineas(); });

        const del = document.createElement('button');
        del.type = 'button'; del.textContent = '✕';
        del.classList.add('btn-eliminar-linea');
        del.addEventListener('click', () => { lineas.splice(i, 1); renderLineas(); });

        fila.append(sel, qty, del);
        cont.appendChild(fila);
    });

    document.getElementById('subtotal').textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById('total').textContent = `$${subtotal.toLocaleString()}`;
};

document.getElementById('btnAgregarProducto').addEventListener('click', () => {
    if (!catalogoProductos.length) { toast('Sin productos disponibles', 'err'); return; }
    const p = catalogoProductos[0];
    lineas.push({ producto_id: p.id, cantidad: 1, precio: p.precio, nombre: p.nombre });
    renderLineas();
});

const getPedidoForm = () => ({
    mesa_id:   Number(pedidoForm['mesa_id'].value),
    productos: lineas.map(l => ({ producto_id: l.producto_id, cantidad: l.cantidad }))
});

const validarPedido = (d) => {
    const show = (id, v) => document.getElementById(id).classList.toggle('visible', v);
    show('msgMesa',      !d.mesa_id);
    show('msgProductos', d.productos.length === 0);
    return d.mesa_id && d.productos.length > 0;
};

const registrarPedido = async () => {
    try {
        const res = await fetch('http://127.0.0.1:8004/api/pedidos', {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
            body: JSON.stringify(getPedidoForm())
        });
        const body = await res.json();
        if (res.status === 201) {
            pedidos.push(body.pedido);
            mostrarPedidos();
            lineas = [];
            renderLineas();
            pedidoForm.reset();
            toast('Pedido creado');
        } else { toast(body.message || 'Error al crear pedido', 'err'); }
    } catch { toast('Error en el servicio', 'err'); }
};

const actualizarPedido = async () => {
    try {
        const res = await fetch(`http://127.0.0.1:8004/api/pedidos/${pedido.id}`, {
            method: 'put',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
            body: JSON.stringify(getPedidoForm())
        });
        const body = await res.json();
        if (res.status === 200) {
            pedido = null; lineas = [];
            renderLineas(); pedidoForm.reset();
            document.getElementById('formTitulo').textContent = 'Nuevo pedido';
            toast('Pedido actualizado');
            consultarPedidos();
        } else { toast(body.message || 'Error al actualizar', 'err'); }
    } catch { toast('Error en el servicio', 'err'); }
};

pedidoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = getPedidoForm();
    if (!validarPedido(datos)) return;
    pedido ? actualizarPedido() : registrarPedido();
});

pedidoForm.addEventListener('reset', () => {
    pedido = null; lineas = [];
    renderLineas();
    document.getElementById('formTitulo').textContent = 'Nuevo pedido';
    document.querySelectorAll('.inputError').forEach(el => el.classList.remove('visible'));
});

cargarCatalogo();
