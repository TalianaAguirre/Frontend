/* ── Variables ──────────────────────────────────────── */
const reservaForm = document.forms['reservaForm'];

/* ── Get / Set form data ────────────────────────────── */
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
    reservaForm['nombre_cliente'].value   = r.nombre_cliente   ?? '';
    reservaForm['telefono_cliente'].value = r.telefono_cliente ?? '';
    reservaForm['cantidad_personas'].value= r.cantidad_personas ?? '';
    reservaForm['fecha'].value            = r.fecha            ?? '';
    reservaForm['hora'].value             = (r.hora ?? '').substring(0, 5);
    reservaForm['mesa_id'].value          = r.mesa_id          ?? '';
    reservaForm['observaciones'].value    = r.observaciones    ?? '';
};

/* ── Validación ─────────────────────────────────────── */
const mostrarError = (id, show) => {
    const el = document.getElementById(id);
    el.classList.toggle('visible', show);
};

const validar = (datos) => {
    mostrarError('msgNombre',   !datos.nombre_cliente);
    mostrarError('msgTelefono', !datos.telefono_cliente);
    mostrarError('msgPersonas', !datos.cantidad_personas || datos.cantidad_personas < 1);
    mostrarError('msgFecha',    !datos.fecha);
    mostrarError('msgHora',     !datos.hora);
    mostrarError('msgMesa',     !datos.mesa_id);

    if (!datos.nombre_cliente || !datos.telefono_cliente || !datos.cantidad_personas
        || datos.cantidad_personas < 1 || !datos.fecha || !datos.hora || !datos.mesa_id) {
        return false;
    }

    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const sel = new Date(datos.fecha + 'T00:00:00');
    if (sel < hoy) {
        mostrarError('msgFecha', true);
        document.getElementById('msgFecha').textContent = 'No se permiten fechas pasadas';
        return false;
    }
    document.getElementById('msgFecha').textContent = 'Campo obligatorio';
    return true;
};

/* ── API calls ──────────────────────────────────────── */
const registrarReserva = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8002/api/reservas', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify(getReservaForm())
        });
        const body = await response.json();
        if (response.status === 201) {
            reservas.push(body.reserva);
            mostrarReservas();
            reservaForm.reset();
            toast('Reserva creada correctamente');
        } else {
            toast(body.message || 'Error al crear reserva', 'err');
        }
    } catch {
        toast('Error en el servicio', 'err');
    }
};

const actualizarReserva = async () => {
    try {
        const id = reserva.id;
        const response = await fetch(`http://127.0.0.1:8002/api/reservas/${id}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify(getReservaForm())
        });
        const body = await response.json();
        if (response.status === 200) {
            reserva = null;
            reservaForm.reset();
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

/* ── Eventos ────────────────────────────────────────── */
reservaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = getReservaForm();
    if (!validar(datos)) return;
    reserva ? actualizarReserva() : registrarReserva();
});

reservaForm.addEventListener('reset', () => {
    reserva = null;
    document.getElementById('formTitulo').textContent = 'Nueva reserva';
    // Limpiar mensajes de error
    document.querySelectorAll('.inputError').forEach(el => el.classList.remove('visible'));
});

reservaForm['nombre_cliente'].addEventListener('keyup', () => {
    mostrarError('msgNombre', !reservaForm['nombre_cliente'].value.trim());
});
