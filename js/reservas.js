/* ── Variables ──────────────────────────────────────── */
const reservas = [];
let reserva = null;
const reservasTabla = document.getElementById('reservasTB');

/* ── Utilidades ─────────────────────────────────────── */
const getToken = () => localStorage.getItem('token');

const toast = (msg, tipo = 'ok') => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast toast-${tipo} visible`;
    setTimeout(() => el.classList.remove('visible'), 3000);
};

const badgeEstado = (estado) => {
    const mapa = {
        pendiente: 'Pendiente',
        confirmada: 'Confirmada',
        cancelada: 'Cancelada',
        finalizada: 'Finalizada',
    };
    const label = mapa[estado] || estado;
    return `<span class="badge badge-${estado}">${label}</span>`;
};

/* ── Render tabla ───────────────────────────────────── */
const mostrarReservas = (lista = reservas) => {
    const tbody = reservasTabla.querySelector('tbody');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;opacity:.4;padding:24px">Sin registros</td></tr>';
        return;
    }

    for (const item of lista) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre_cliente}</td>
            <td>${item.fecha}</td>
            <td>${item.hora}</td>
            <td>${item.cantidad_personas}</td>
            <td>${item.mesa ? item.mesa.numero : item.mesa_id}</td>
            <td>${badgeEstado(item.estado)}</td>
            <td></td>
        `;

        const accionesTd = tr.querySelector('td:last-child');

        if (item.estado !== 'cancelada' && item.estado !== 'finalizada') {
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.addEventListener('click', () => editarReserva(item));
            accionesTd.appendChild(editBtn);

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancelar';
            cancelBtn.style.borderColor = 'rgba(220,100,80,0.3)';
            cancelBtn.style.color = 'rgba(220,100,80,0.8)';
            cancelBtn.addEventListener('click', () => confirmarCancelacion(item.id));
            accionesTd.appendChild(cancelBtn);
        }

        tbody.appendChild(tr);
    }
};

/* ── API calls ──────────────────────────────────────── */
const consultarReservas = async (params = {}) => {
    try {
        const qs = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([, v]) => v))
        ).toString();
        const url = `http://127.0.0.1:8002/api/reservas${qs ? '?' + qs : ''}`;
        const response = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await response.json();
        reservas.splice(0, reservas.length, ...(body.reservas ?? []));
        mostrarReservas();
    } catch {
        toast('Error al cargar reservas', 'err');
    }
};

const cancelarReserva = async (id) => {
    try {
        const response = await fetch(`http://127.0.0.1:8002/api/reservas/${id}/cancelar`, {
            method: 'put',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (response.status === 200) {
            toast('Reserva cancelada');
            consultarReservas();
        } else {
            const body = await response.json();
            toast(body.message || 'No se pudo cancelar', 'err');
        }
    } catch {
        toast('Error en el servicio', 'err');
    }
};

/* ── Cargar mesas disponibles en el select ──────────── */
const cargarMesas = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8002/api/mesas', {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await response.json();
        const sel = document.getElementById('mesa_id');
        sel.innerHTML = '<option value="">— Seleccionar mesa —</option>';
        (body.mesas ?? []).forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.numero} (cap. ${m.capacidad}) — ${m.estado}`;
            if (m.estado === 'fuera_servicio') opt.disabled = true;
            sel.appendChild(opt);
        });
    } catch {
        toast('Error cargando mesas', 'err');
    }
};

/* ── Editar ─────────────────────────────────────────── */
const editarReserva = (value) => {
    reserva = value;
    setReservaForm(reserva);
    document.getElementById('formTitulo').textContent = 'Editar reserva';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ── Diálogo cancelación ────────────────────────────── */
const confirmarCancelacion = (id) => {
    if (confirm('¿Deseas cancelar esta reserva?')) cancelarReserva(id);
};

/* ── Filtros ────────────────────────────────────────── */
document.getElementById('btnFiltrar').addEventListener('click', () => {
    consultarReservas({
        fecha:   document.getElementById('filtroFecha').value,
        cliente: document.getElementById('filtroCliente').value,
        estado:  document.getElementById('filtroEstado').value,
    });
});

/* ── Botón nueva reserva ────────────────────────────── */
document.getElementById('btnNueva').addEventListener('click', () => {
    document.getElementById('reservaForm').reset();
    reserva = null;
    document.getElementById('formTitulo').textContent = 'Nueva reserva';
});

/* ── Init ───────────────────────────────────────────── */
cargarMesas();
consultarReservas();
