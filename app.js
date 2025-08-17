// Instancias de los servicios
const auth = firebase.auth();

// Función para registrar un nuevo usuario
function registrar(email, password) {
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log('Usuario registrado con éxito:', userCredential.user);
    })
    .catch((error) => {
      console.error('Error en el registro:', error.message);
    });
}

// Función para iniciar sesión
function iniciarSesion(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log('Inicio de sesión exitoso:', userCredential.user);
    })
    .catch((error) => {
      console.error('Error al iniciar sesión:', error.message);
    });
}

// Función para cerrar sesión
function cerrarSesion() {
  auth.signOut().then(() => {
    console.log('Sesión cerrada');
  }).catch((error) => {
    console.error('Error al cerrar sesión:', error);
  });
}

// Observador para saber si el usuario está autenticado
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('Usuario autenticado:', user.uid);
    // Aquí puedes mostrar contenido para usuarios logueados
  } else {
    console.log('No hay sesión activa.');
    // Aquí puedes mostrar contenido para visitantes
  }
});


// Instancia de Firestore
const db = firebase.firestore();

// Función para guardar un nuevo documento en una colección
function guardarDato(coleccion, datos) {
  db.collection(coleccion).add(datos)
    .then((docRef) => {
      console.log('Documento guardado con ID:', docRef.id);
    })
    .catch((error) => {
      console.error('Error al guardar:', error);
    });
}

// Función para leer todos los documentos de una colección en tiempo real
function leerDatos(coleccion, callback) {
  db.collection(coleccion)
    .orderBy('timestamp')
    .onSnapshot((querySnapshot) => {
    const documentos = [];
    querySnapshot.forEach((doc) => {
      documentos.push({ id: doc.id, ...doc.data() });
    });
    callback(documentos);
  });
}
