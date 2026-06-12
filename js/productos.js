/* ── Variables ── */
const productos = [];
let producto = null;
const productosTabla = document.getElementById('productosTB');

/* ── Utilidades ── */
const getToken = () => localStorage.getItem('token');

const toast = (msg, tipo = 'ok') => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast toast-${tipo} visible`;
    setTimeout(() => el.classList.remove('visible'), 3000);
};

/* ── Render ── */
const mostrarProductos = (lista = productos) => {
    const tbody = productosTabla.querySelector('tbody');
    tbody.innerHTML = '';
    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;opacity:.4;padding:24px">Sin registros</td></tr>';
        return;
    }
    for (const item of lista) {
        const tr = document.createElement('tr');
        const disp = item.disponible
            ? '<span class="badge badge-disponible">Sí</span>'
            : '<span class="badge badge-cancelada">No</span>';
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.categoria ? item.categoria.nombre : '—'}</td>
            <td>$${Number(item.precio).toLocaleString()}</td>
            <td>${disp}</td>
            <td></td>
        `;
        const td = tr.querySelector('td:last-child');
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', () => { producto = item; setProductoForm(item); document.getElementById('formTitulo').textContent = 'Editar producto'; });
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.style.cssText = 'border-color:rgba(220,100,80,0.3);color:rgba(220,100,80,0.8)';
        delBtn.addEventListener('click', () => { if (confirm('¿Eliminar producto?')) eliminarProducto(item.id); });
        td.append(editBtn, delBtn);
        tbody.appendChild(tr);
    }
};

/* ── API ── */
const consultarProductos = async (params = {}) => {
    try {
        const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v])=>v))).toString();
        const res = await fetch(`http://127.0.0.1:8003/api/productos${qs ? '?'+qs : ''}`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await res.json();
        productos.splice(0, productos.length, ...(body.productos ?? []));
        mostrarProductos();
    } catch { toast('Error al cargar productos', 'err'); }
};

const cargarCategoriasFiltro = async () => {
    try {
        const res = await fetch('http://127.0.0.1:8003/api/categorias', {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await res.json();
        const sel1 = document.getElementById('filtroCategoria');
        const sel2 = document.getElementById('categoria_id');
        (body.categorias ?? []).forEach(c => {
            [sel1, sel2].forEach(sel => {
                const opt = document.createElement('option');
                opt.value = c.id; opt.textContent = c.nombre;
                sel.appendChild(opt.cloneNode(true));
            });
        });
    } catch { toast('Error cargando categorías', 'err'); }
};

const eliminarProducto = async (id) => {
    try {
        const res = await fetch(`http://127.0.0.1:8003/api/productos/${id}`, {
            method: 'delete',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (res.status === 200) { toast('Producto eliminado'); consultarProductos(); }
        else { const b = await res.json(); toast(b.message || 'Error', 'err'); }
    } catch { toast('Error en el servicio', 'err'); }
};

/* ── Filtros / botones ── */
document.getElementById('btnFiltrar').addEventListener('click', () => {
    consultarProductos({
        categoria_id: document.getElementById('filtroCategoria').value,
        disponible:   document.getElementById('filtroDisponible').value,
    });
});
document.getElementById('btnNuevo').addEventListener('click', () => {
    document.getElementById('productoForm').reset();
    producto = null;
    document.getElementById('formTitulo').textContent = 'Nuevo producto';
});

/* ── Init ── */
cargarCategoriasFiltro();
consultarProductos();
