const usuario = JSON.parse(localStorage.getItem('usuario'));

const cargarUsuario = () => {
    if (!usuario) {
        window.location.href = '../index.html';
        return;
    }
    document.getElementById('nombreUsuario').textContent = usuario.nombre || usuario.usuario;
};

const cerrarSesion = async () => {
    try {
        await fetch('http://127.0.0.1:8001/api/auth/logout', {
            method: 'post',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
    } catch (ex) {
        console.error('Error en el servicio');
    }
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '../index.html';
    console.log('Fin del request...');
};

document.getElementById('btnLogout').addEventListener('click', cerrarSesion);

cargarUsuario();