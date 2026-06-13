
const productoForm = document.forms['productoForm'];
let producto = null;


const getProductoForm = () => ({
    nombre:       productoForm['nombre'].value.trim(),
    categoria_id: Number(productoForm['categoria_id'].value),
    precio:       Number(productoForm['precio'].value),
    descripcion:  productoForm['descripcion'].value.trim(),
    disponible:   productoForm['disponible'].value === '1',
});

const setProductoForm = (p) => {
    productoForm['nombre'].value       = p.nombre       ?? '';
    productoForm['categoria_id'].value = p.categoria_id ?? '';
    productoForm['precio'].value       = p.precio       ?? '';
    productoForm['descripcion'].value  = p.descripcion  ?? '';
    productoForm['disponible'].value   = p.disponible ? '1' : '0';
};


const validarProducto = (d) => {
    const show = (id, v) => document.getElementById(id).classList.toggle('visible', v);
    show('msgNombre',    !d.nombre);
    show('msgCategoria', !d.categoria_id);
    show('msgPrecio',    !d.precio || d.precio <= 0);
    return d.nombre && d.categoria_id && d.precio > 0;
};


const registrarProducto = async () => {
    try {
        const res = await fetch('http://127.0.0.1:8003/api/productos', {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
            body: JSON.stringify(getProductoForm())
        });
        const body = await res.json();
        if (res.status === 201) {
            productos.push(body.producto);
            mostrarProductos();
            productoForm.reset();
            toast('Producto creado');
        } else { toast(body.message || 'Error al crear', 'err'); }
    } catch { toast('Error en el servicio', 'err'); }
};

const actualizarProducto = async () => {
    try {
        const res = await fetch(`http://127.0.0.1:8003/api/productos/${producto.id}`, {
            method: 'put',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
            body: JSON.stringify(getProductoForm())
        });
        const body = await res.json();
        if (res.status === 200) {
            producto = null;
            productoForm.reset();
            document.getElementById('formTitulo').textContent = 'Nuevo producto';
            toast('Producto actualizado');
            consultarProductos();
        } else { toast(body.message || 'Error al actualizar', 'err'); }
    } catch { 
        
    console.error(ex);

        toast('Error en el servicio', 'err'); }
};


productoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = getProductoForm();
    if (!validarProducto(datos)) return;
    producto ? actualizarProducto() : registrarProducto();
});

productoForm.addEventListener('reset', () => {
    producto = null;
    document.getElementById('formTitulo').textContent = 'Nuevo producto';
    document.querySelectorAll('.inputError').forEach(el => el.classList.remove('visible'));
});
