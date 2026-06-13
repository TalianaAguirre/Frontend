
const productos = [];
const productosTabla = document.getElementById('productosTB');


const getToken = () => localStorage.getItem('token');

const mostrarProductos = () => {
    const tbody = productosTabla.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    for (let item of productos) {
        const tr = document.createElement('tr');

        const nombreTd = document.createElement('td');
        nombreTd.textContent = item.nombre;

        const categoriaTd = document.createElement('td');
        categoriaTd.textContent = item.categoria ? item.categoria.nombre : '';

        const precioTd = document.createElement('td');
        precioTd.textContent = item.precio;

        const disponibleTd = document.createElement('td');
        disponibleTd.textContent = item.disponible ? 'Sí' : 'No';

        const accionesTd = document.createElement('td');

        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.addEventListener('click', () => editarProducto(item));

        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.addEventListener('click', () => eliminarProducto(item.id));

        accionesTd.appendChild(editarBtn);
        accionesTd.appendChild(eliminarBtn);

        tr.appendChild(nombreTd);
        tr.appendChild(categoriaTd);
        tr.appendChild(precioTd);
        tr.appendChild(disponibleTd);
        tr.appendChild(accionesTd);

        tbody.appendChild(tr);
    }
};

const consultarProductos = async (params = {}) => {
    try {
        if (productos.length > 0) productos.splice(0, productos.length);
        const qs = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([,v]) => v !== '' && v !== null))
        ).toString();
        const response = await fetch(`http://127.0.0.1:8003/api/productos${qs ? '?' + qs : ''}`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await response.json();
        body.productos.forEach(item => productos.push(item));
        mostrarProductos();
    } catch (ex) {
        console.error('Error en el servicio');
    }
};

const editarProducto = (value) => {
    producto = value;
    setProductoForm(producto);
};

const eliminarProducto = async (id) => {
    try {
        const response = await fetch('http://127.0.0.1:8003/api/productos/' + id, {
            method: 'delete',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const status = response.status;
        if (status == 200) {
            consultarProductos();
        } else {
            const body = await response.json();
            alert(body.message);
        }
    } catch (ex) {
        console.error('Error en el servicio');
    }
    console.log('Fin del request...');
};


consultarProductos();

document.getElementById('btnFiltrar').addEventListener('click', () => {
    consultarProductos({
        categoria_id: document.getElementById('filtroCategoria').value,
        disponible: document.getElementById('filtroDisponible').value
    });
});