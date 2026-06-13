
const reservaForm = document.forms['reservaForm'];


const getReservaForm = () => ({
    nombre_cliente:    reservaForm['nombre_cliente'].value.trim(),
    telefono_cliente:  reservaForm['telefono_cliente'].value.trim(),
    cantidad_personas: Number(reservaForm['cantidad_personas'].value),
    fecha:             reservaForm['fecha'].value,
    hora:              reservaForm['hora'].value,
    mesa_id:           Number(reservaForm['mesa_id'].value),
    observaciones:     reservaForm['observaciones'].value.trim(),
});

const setReservaForm = (r) => {
    reservaForm['nombre_cliente'].value    = r.nombre_cliente    ?? '';
    reservaForm['telefono_cliente'].value  = r.telefono_cliente  ?? '';
    reservaForm['cantidad_personas'].value = r.cantidad_personas ?? '';
    reservaForm['fecha'].value             = r.fecha             ?? '';
    reservaForm['hora'].value              = (r.hora ?? '').substring(0, 5);
    reservaForm['mesa_id'].value           = r.mesa_id           ?? '';
    reservaForm['observaciones'].value     = r.observaciones     ?? '';
};


const mostrarError = (id, show, msg = null) => {
    const el = document.getElementById(id);
    el.classList.toggle('visible', show);
    if (msg) el.textContent = msg;
};

const validar = (d) => {
    let ok = true;

    mostrarError('msgNombre',   !d.nombre_cliente,
        'Campo obligatorio');
    if (!d.nombre_cliente) ok = false;

    mostrarError('msgTelefono', !d.telefono_cliente,
        'Campo obligatorio');
    if (!d.telefono_cliente) ok = false;

    mostrarError('msgPersonas', !d.cantidad_personas || d.cantidad_personas < 1,
        'Debe ser mayor a cero');
    if (!d.cantidad_personas || d.cantidad_personas < 1) ok = false;

    mostrarError('msgFecha', !d.fecha, 'Campo obligatorio');
    if (!d.fecha) ok = false;

    if (d.fecha) {
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        const sel = new Date(d.fecha + 'T00:00:00');
        if (sel < hoy) {
            mostrarError('msgFecha', true, 'No se permiten fechas pasadas');
            ok = false;
        }
    }

    mostrarError('msgHora', !d.hora, 'Campo obligatorio');
    if (!d.hora) ok = false;

    mostrarError('msgMesa', !d.mesa_id, 'Seleccione una mesa');
    if (!d.mesa_id) ok = false;

    return ok;
};


const registrarReserva = async () => {
    try {
        const res = await fetch('http://127.0.0.1:8002/api/reservas', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify(getReservaForm())
        });
        const body = await res.json();
        if (res.status === 201) {
            reservas.push(body.reserva);
            mostrarReservas();
            reservaForm.reset();
            limpiarErrores();
            toast('Reserva creada correctamente');
        } else {
            toast(body.message || 'Error al crear la reserva', 'err');
        }
    } catch {
        toast('Error en el servicio', 'err');
    }
};

const actualizarReserva = async () => {
    try {
        const res = await fetch(`http://127.0.0.1:8002/api/reservas/${reserva.id}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify(getReservaForm())
        });
        const body = await res.json();
        if (res.status === 200) {
            reserva = null;
            reservaForm.reset();
            limpiarErrores();
            document.getElementById('formTitulo').textContent = 'Nueva reserva';
            toast('Reserva actualizada');
            consultarReservas();
        } else {
            toast(body.message || 'Error al actualizar', 'err');
        }
    } catch {
        toast('Error en el servicio', 'err');
    }
};


const limpiarErrores = () => {
    document.querySelectorAll('.inputError').forEach(el => el.classList.remove('visible'));
};


reservaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = getReservaForm();
    if (!validar(datos)) return;
    reserva ? actualizarReserva() : registrarReserva();
});

reservaForm.addEventListener('reset', () => {
    reserva = null;
    document.getElementById('formTitulo').textContent = 'Nueva reserva';
    limpiarErrores();
});


reservaForm['nombre_cliente'].addEventListener('keyup', () => {
    mostrarError('msgNombre', !reservaForm['nombre_cliente'].value.trim(), 'Campo obligatorio');
});


reservaForm['fecha'].addEventListener('change', () => {
    const val = reservaForm['fecha'].value;
    if (!val) { mostrarError('msgFecha', true, 'Campo obligatorio'); return; }
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const sel = new Date(val + 'T00:00:00');
    mostrarError('msgFecha', sel < hoy, 'No se permiten fechas pasadas');
});
