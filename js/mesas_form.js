const mesaForm = document.forms['mesaForm'];

const getMesaForm = () => {
    return {
        numero: mesaForm['numero'].value,
        capacidad: mesaForm['capacidad'].value,
        estado: mesaForm['estado'].value
    };
};

const setMesaForm = (mesa) => {
    mesaForm['numero'].value = mesa.numero;
    mesaForm['capacidad'].value = mesa.capacidad;
    mesaForm['estado'].value = mesa.estado;
};

const validarInputs = (datos) => {
    const msgNumero = document.getElementById('msgNumero');
    const msgCapacidad = document.getElementById('msgCapacidad');

    if (!datos.numero) {
        msgNumero.classList.add('visible');
    } else {
        msgNumero.classList.remove('visible');
    }

    if (!datos.capacidad || datos.capacidad <= 0) {
        msgCapacidad.classList.add('visible');
    } else {
        msgCapacidad.classList.remove('visible');
    }
};

const registrarMesa = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8002/api/mesas', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify(getMesaForm())
        });
        const body = await response.json();
        const status = response.status;
        if (status == 201) {
            mesas.push(body.mesa);
            mostrarMesas();
            mesaForm.reset();
        } else {
            alert(body.message);
        }
    } catch (ex) {
        console.error('Error en el servicio');
    }
    console.log('Fin del request...');
};

const actualizarMesa = async () => {
    try {
        const id = mesa.id;
        const response = await fetch('http://127.0.0.1:8002/api/mesas/' + id, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify(getMesaForm())
        });
        const body = await response.json();
        const status = response.status;
        if (status == 200) {
            consultarMesas();
            mesa = null;
            mesaForm.reset();
        } else {
            alert(body.message);
        }
    } catch (ex) {
        console.error('Error en el servicio');
    }
    console.log('Fin del request...');
};

mesaForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const datos = getMesaForm();
    validarInputs(datos);
    if (!datos.numero || !datos.capacidad || datos.capacidad <= 0) return;
    mesa ? actualizarMesa() : registrarMesa();
});

mesaForm.addEventListener('reset', () => {
    mesa = null;
});

mesaForm['numero'].addEventListener('keyup', () => {
    const datos = getMesaForm();
    validarInputs(datos);
});

