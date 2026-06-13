
const reservas = [];
let reserva = null;
const reservasTabla = document.getElementById('reservasTB');


const getToken = () => localStorage.getItem('token');

const toast = (msg, tipo = 'ok') => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast toast-${tipo} visible`;
    setTimeout(() => el.classList.remove('visible'), 3000);
};

const badgeEstado = (estado) => {
    const labels = {
        pendiente:  'Pendiente',
        confirmada: 'Confirmada',
        cancelada:  'Cancelada',
        finalizada: 'Finalizada',
    };
    return `<span class="badge badge-${estado}">${labels[estado] ?? estado}</span>`;
};

const mesasMap = {};

const mostrarReservas = (lista = reservas) => {
    const tbody = reservasTabla.querySelector('tbody');
    tbody.innerHTML = '';

    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;opacity:.4;padding:24px">Sin registros</td></tr>';
        return;
    }

    for (const item of lista) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre_cliente}</td>
            <td>${item.fecha}</td>
            <td>${item.hora.substring(0, 5)}</td>
            <td>${item.cantidad_personas}</td>
            <td>${mesasMap[item.mesa_id] ?? item.mesa_id}</td>
            <td>${badgeEstado(item.estado)}</td>
            <td></td>
        `;

        const tdAcciones = tr.querySelector('td:last-child');

        if (item.estado !== 'cancelada' && item.estado !== 'finalizada') {
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.addEventListener('click', () => editarReserva(item));

            const btnCancelar = document.createElement('button');
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.classList.add('btn-cancelar-reserva');
            btnCancelar.addEventListener('click', () => {
                if (confirm(`¿Cancelar la reserva de ${item.nombre_cliente}?`)) {
                    cancelarReserva(item.id);
                }
            });

            tdAcciones.appendChild(btnEditar);
            tdAcciones.appendChild(btnCancelar);
        }

        tbody.appendChild(tr);
    }
};

const cargarMesas = async () => {
    try {
        const res = await fetch('http://127.0.0.1:8002/api/mesas', {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await res.json();
        const mesas = body.mesas ?? [];


        mesas.forEach(m => { mesasMap[m.id] = m.numero; });


        const sel = document.getElementById('mesa_id');
        sel.innerHTML = '<option value="">— Seleccionar mesa —</option>';
        mesas.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.numero}  (cap. ${m.capacidad})`;
            if (m.estado === 'fuera_servicio') {
                opt.disabled = true;
                opt.textContent += ' — fuera de servicio';
            }
            sel.appendChild(opt);
        });
    } catch {
        toast('Error cargando mesas', 'err');
    }
};



const consultarReservas = async (params = {}) => {
    try {
        const qs = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([, v]) => v))
        ).toString();
        const url = `http://127.0.0.1:8002/api/reservas${qs ? '?' + qs : ''}`;
        const res = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const body = await res.json();
        reservas.splice(0, reservas.length, ...(body.reservas ?? []));
        mostrarReservas();
    } catch {
        toast('Error al cargar reservas', 'err');
    }
};

const cancelarReserva = async (id) => {
    try {
        const res = await fetch(`http://127.0.0.1:8002/api/reservas/${id}/cancelar`, {
            method: 'put',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (res.status === 200) {
            toast('Reserva cancelada');
            consultarReservas();
        } else {
            const body = await res.json();
            toast(body.message || 'No se pudo cancelar', 'err');
        }
    } catch {
        toast('Error en el servicio', 'err');
    }
};


const editarReserva = (value) => {
    reserva = value;
    setReservaForm(reserva);
    document.getElementById('formTitulo').textContent = 'Editar reserva';
    document.querySelector('.formulario-interno').scrollIntoView({ behavior: 'smooth' });
};


document.getElementById('btnFiltrar').addEventListener('click', () => {
    consultarReservas({
        fecha:   document.getElementById('filtroFecha').value,
        cliente: document.getElementById('filtroCliente').value,
        estado:  document.getElementById('filtroEstado').value,
    });
});


document.getElementById('btnNueva').addEventListener('click', () => {
    document.getElementById('reservaForm').reset();
    reserva = null;
    document.getElementById('formTitulo').textContent = 'Nueva reserva';
});


cargarMesas();
consultarReservas();
