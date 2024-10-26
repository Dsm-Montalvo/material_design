const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const connection = require('./config/database');
const path = require('path');
const app = express();
// Requerir bcrypt para hashear contraseñas
const bcrypt = require('bcrypt');

// Configuración del servidor
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(express.static('public'));

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Configurar la carpeta de vistas

// Rutas para las páginas
app.get('/', (req, res) => res.sendFile(__dirname + '/views/portal.html'));
app.get('/sitio.html', (req, res) => res.sendFile(__dirname + '/views/sitio.html'));
app.get('/inicio.html', (req, res) => res.sendFile(__dirname + '/views/inicio.html'));
app.get('/catalogo.html', (req, res) => res.sendFile(__dirname + '/views/catalogo.html'));
app.get('/contacto.html', (req, res) => res.sendFile(__dirname + '/views/contacto.html'));
app.get('/producto1.html', (req, res) => res.sendFile(__dirname + '/views/producto1.html'));
app.get('/producto2.html', (req, res) => res.sendFile(__dirname + '/views/producto2.html'));
app.get('/producto3.html', (req, res) => res.sendFile(__dirname + '/views/producto3.html'));
app.get('/usuario.html', (req, res) => res.sendFile(__dirname + '/views/usuario.html'));

// Ruta para mostrar el formulario de registro
app.get('/register.html', (req, res) => {
    res.sendFile(__dirname + '/views/register.html'); // Asegúrate de que esta ruta sea correcta
});

// Ruta para manejar el registro de usuarios
// Ruta para manejar el registro de usuarios
app.post('/register', (req, res) => {
    const { email, password, confirmPassword } = req.body;

    // Verificar si las contraseñas coinciden
    if (password !== confirmPassword) {
        return res.redirect('/register.html?error=Las contraseñas no coinciden.');
    }

    // Verificar si el correo ya está registrado
    const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error('Error al verificar el correo:', err);
            return res.redirect('/register.html?error=Error al verificar el correo.');
        }

        if (results.length > 0) {
            return res.redirect('/register.html?error=Este correo ya está registrado.');
        }

        // Guardar el nuevo usuario en la base de datos
        const query = 'INSERT INTO usuarios (email, password) VALUES (?, ?)';
        connection.query(query, [email, password], (err, results) => {
            if (err) {
                console.error('Error al crear el usuario:', err);
                return res.redirect('/register.html?error=Error al crear el usuario. El correo puede estar ya registrado.');
            }
            res.redirect('/inicio.html'); // Redirigir al inicio de sesión después de crear el usuario
        });
    });
});
//*****************************************************admin
app.get('/inicioadmin', (req, res) => {
    // Suponiendo que el usuario está almacenado en req.user después de la autenticación
    const usuarioEmail = req.session.user.email; // Asumiendo que tienes el email del usuario
   
    res.render('admin/inicio', { UsuarioEmail: usuarioEmail });
});

app.get('/admin/catalogo', (req, res) => {
    if (req.session.loggedin) {
        res.render('admin/catalogo', { email: req.session.user.email });
    } else {
        res.redirect('/inicio.html'); // Redirigir si el usuario no está autenticado
    }
});
app.get('/admin/', (req, res) => {
    if (req.session.loggedin) {
        res.render('admin/portal', { email: req.session.user.email });
    } else {
        res.redirect('/inicio.html'); // Redirigir si el usuario no está autenticado
    }
});
app.get('/admin/producto1', (req, res) => {
    if (req.session.loggedin) {
        res.render('admin/producto1', { email: req.session.user.email });
    } else {
        res.redirect('/inicio.html'); // Redirigir si el usuario no está autenticado
    }
});
app.get('/admin/producto2', (req, res) => {
    if (req.session.loggedin) {
        res.render('admin/producto2', { email: req.session.user.email });
    } else {
        res.redirect('/inicio.html'); // Redirigir si el usuario no está autenticado
    }
});
app.get('/admin/producto3', (req, res) => {
    if (req.session.loggedin) {
        res.render('admin/producto3', { email: req.session.user.email });
    } else {
        res.redirect('/inicio.html'); // Redirigir si el usuario no está autenticado
    }
});
app.get('/admin/sitio', (req, res) => {
    if (req.session.loggedin) {
        res.render('admin/sitio', { email: req.session.user.email });
    } else {
        res.redirect('/inicio.html'); // Redirigir si el usuario no está autenticado
    }
});

//*********************************************************** 
// Ruta para manejo de inicio de sesión
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';

    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error al verificar usuario:', err);
            return res.redirect('/inicio.html?error=Error al verificar usuario.'); // Mensaje de error
        }
        if (results.length > 0) {
            req.session.loggedin = true;
            req.session.email = email;
            req.session.user = { email };
            res.redirect('/inicioadmin');
        } else {
            res.redirect('/inicio.html?error=Correo o contraseña incorrectos'); // Mensaje de error
        }
    });
});

// Ruta para manejar el cierre de sesión
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.redirect('/inicioadmin'); // Redirige de vuelta si hay un error
        }
        res.redirect('/'); // Redirige al inicio de sesión
    });
});

// Ruta para manejo de contacto
app.post('/contacto', (req, res) => {
    const { nombre, email, mensaje } = req.body;
    const query = 'INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)';

    connection.query(query, [nombre, email, mensaje], (err) => {
        if (err) {
            console.error('Error al guardar el contacto:', err);
            return res.redirect('/contacto.html?error=Hubo un error al enviar el mensaje.'); // Mensaje de error
        }
        res.redirect('/contacto.html?success=Mensaje enviado correctamente.'); // Mensaje de éxito
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});