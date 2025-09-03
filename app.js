// ATENCIÓN: La configuración de Firebase que pegaste aquí es visible públicamente.
// Te recomiendo que vayas a la consola de Firebase y regeneres la clave de API (API Key)
// para asegurar que nadie más pueda usarla.

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB47qGmUrXN_5qJSFhEX3WLD2BvLd5oEGs",
  authDomain: "commqat.firebaseapp.com",
  projectId: "commqat",
  storageBucket: "commqat.firebasestorage.app",
  messagingSenderId: "218735319330",
  appId: "1:218735319330:web:8f686fba441ce11c0f2d7b",
  measurementId: "G-FY8XM94GT9"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Instancias de los servicios
const auth = firebase.auth();
const db = firebase.firestore();

// Función para registrar un nuevo usuario
function registrar(email, password, callback) {
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log('Usuario registrado con éxito:', userCredential.user);
      callback(null);
    })
    .catch((error) => {
      console.error('Error en el registro:', error.message);
      callback(error.message);
    });
}

// Función para iniciar sesión
function iniciarSesion(email, password, callback) {
  console.log('Attempting to sign in with email:', email);
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log('Inicio de sesión exitoso:', userCredential.user);
      callback(null);
    })
    .catch((error) => {
      console.error('Error al iniciar sesión:', error.code, error.message);
      callback(error.message);
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

// Función para crear un nuevo proyecto
function crearProyecto(nombre, description, callback) {
  const user = auth.currentUser;
  if (user) {
    db.collection('Proyectos').add({
      nombre: nombre,
      description: description
    })
    .then((docRef) => {
      console.log('Proyecto creado con ID:', docRef.id);
      callback(null, docRef.id);
    })
    .catch((error) => {
      console.error('Error al crear proyecto:', error);
      callback(error);
    });
  }
}

// Función para cargar los proyectos de un usuario
function cargarProyectos(callback) {
  const user = auth.currentUser;
  if (user) {
    db.collection('Proyectos').get()
      .then((querySnapshot) => {
        const proyectos = [];
        querySnapshot.forEach((doc) => {
          proyectos.push({ id: doc.id, ...doc.data() });
        });
        callback(null, proyectos);
      })
      .catch((error) => {
        console.error('Error al cargar proyectos:', error);
        callback(error);
      });
  }
}

// Función para actualizar un proyecto
function actualizarProyecto(projectId, newData, callback) {
  db.collection('Proyectos').doc(projectId).update(newData)
    .then(() => {
      console.log('Proyecto actualizado con éxito');
      callback(null);
    })
    .catch((error) => {
      console.error('Error al actualizar el proyecto:', error);
      callback(error);
    });
}

// Función para guardar un nuevo documento en una colección
function guardarDato(coleccion, projectId, datos) {
  db.collection(coleccion).add({ ...datos, projectId: projectId })
    .then((docRef) => {
      console.log('Documento guardado con ID:', docRef.id);
    })
    .catch((error) => {
      console.error('Error al guardar:', error);
    });
}

// Función para guardar un nuevo documento en una colección con un ID específico
function guardarDatoConId(coleccion, id, datos) {
  db.collection(coleccion).doc(id).set(datos)
    .then(() => {
      console.log('Documento guardado con ID:', id);
    })
    .catch((error) => {
      console.error('Error al guardar:', error);
    });
}

// Función para leer todos los documentos de una colección en tiempo real
function leerDatos(coleccion, projectId, callback) {
  db.collection(coleccion).where('projectId', '==', projectId)
    .onSnapshot((querySnapshot) => {
    const documentos = [];
    querySnapshot.forEach((doc) => {
      documentos.push({ id: doc.id, ...doc.data() });
    });
    callback(null, documentos);
  }, (error) => {
    console.error(`Error al leer datos de ${coleccion}:`, error);
    callback(error, null);
  });
}

// Función para guardar un nuevo faltante
function guardarFaltante(faltante, callback) {
  db.collection('faltantes').add(faltante)
    .then((docRef) => {
      console.log('Faltante guardado con ID:', docRef.id);
      callback(null, docRef.id);
    })
    .catch((error) => {
      console.error('Error al guardar faltante:', error);
      callback(error);
    });
}

// Función para leer los faltantes de un proyecto
function leerFaltantes(projectId, callback) {
  db.collection('faltantes').where('projectId', '==', projectId).onSnapshot((querySnapshot) => {
    const faltantes = [];
    querySnapshot.forEach((doc) => {
      faltantes.push({ id: doc.id, ...doc.data() });
    });
    callback(null, faltantes);
  }, (error) => {
    console.error('Error al leer faltantes:', error);
    callback(error);
  });
}

// Función para actualizar el estado de un faltante
function actualizarEstadoFaltante(faltanteId, nuevoEstado, callback) {
  db.collection('faltantes').doc(faltanteId).update({
    status: nuevoEstado
  })
  .then(() => {
    console.log('Estado del faltante actualizado');
    callback(null);
  })
  .catch((error) => {
    console.error('Error al actualizar estado:', error);
    callback(error);
  });
}

// Función para guardar documentos en lote
function batchSave(collectionName, documents, projectId, callback) {
  const batch = db.batch();
  documents.forEach((doc) => {
    const docRef = db.collection(collectionName).doc();
    batch.set(docRef, { ...doc, projectId: projectId });
  });

  batch.commit()
    .then(() => {
      console.log('Lote de documentos guardado con éxito.');
      callback(null);
    })
    .catch((error) => {
      console.error('Error al guardar el lote:', error);
      callback(error);
    });
}

function guardarPruebaFuncional(testData, callback) {
    db.collection('pruebasFuncionales').doc(testData.instrumentId).set(testData)
        .then(() => {
            console.log('Prueba funcional guardada con éxito');
            callback(null);
        })
        .catch((error) => {
            console.error('Error al guardar la prueba funcional:', error);
            callback(error);
        });
}

function actualizarDatoIngenieria(collectionName, docId, newData, callback) {
    db.collection(collectionName).doc(docId).update(newData)
        .then(() => {
            console.log('Dato de ingeniería actualizado con éxito');
            callback(null);
        })
        .catch((error) => {
            console.error('Error al actualizar el dato de ingeniería:', error);
            callback(error);
        });
}