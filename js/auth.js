
const inicioForm = document.forms['inicioForm'];


const getLoginForm = () => {
    return {
        login: inicioForm['login_user'].value,
        contrasena: inicioForm['contrasena'].value
    };
};

const validarInputs = (datos) => {
    const msgUsuario = document.getElementById('msgUsuario');
    const msgContrasena = document.getElementById('msgContrasena');

    if (!datos.login) {
        msgUsuario.style.display = 'block';
    } else {
        msgUsuario.style.display = 'none';
    }

    if (!datos.contrasena) {
        msgContrasena.style.display = 'block';
    } else {
        msgContrasena.style.display = 'none';
    }
};

const iniciarSesion = async () => {
    try {
        const response = await fetch('http://localhost:8001/api/auth/login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(getLoginForm())
        });
        const body = await response.json();
        const status = response.status;
        if (status == 200) {
            localStorage.setItem('token', body.token);
            localStorage.setItem('usuario', JSON.stringify(body.usuario));
            window.location.href = 'dashboard.html';
        } else {
            alert(body.message);
        }
    } catch (ex) {
        console.error('Error en el servicio');
    }
    console.log('Fin del request...');
};


inicioForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const datos = getLoginForm();
    validarInputs(datos);
    if (!datos.login || !datos.contrasena) return;
    iniciarSesion();
});

