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
function registrar(email, password, fullName, callback) {
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log('Usuario registrado con éxito:', userCredential.user);
      // Crear un documento en la colección 'users'
      const userRef = db.collection('users').doc(userCredential.user.uid);
      userRef.set({
        email: email,
        fullName: fullName,
        level: email === 'contacto10@gmail.com' ? 'admin' : 'normal'
      })
      .then(() => {
        callback(null);
      })
      .catch((error) => {
        console.error('Error al guardar datos de usuario:', error);
        callback(error.message);
      });
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
  return db.collection(coleccion).add({ ...datos, projectId: projectId })
    .then((docRef) => {
      console.log('Documento guardado con ID:', docRef.id);
      return docRef;
    })
    .catch((error) => {
      console.error('Error al guardar:', error);
      throw error;
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
  const query = db.collection(coleccion).where('projectId', '==', projectId);
  // Return the unsubscribe function so callers can detach the listener if needed
  const unsubscribe = query.onSnapshot((querySnapshot) => {
    const documentos = [];
    querySnapshot.forEach((doc) => {
      documentos.push({ id: doc.id, ...doc.data() });
    });
    callback(null, documentos);
  }, (error) => {
    console.error(`Error al leer datos de ${coleccion}:`, error);
    callback(error, null);
  });

  return unsubscribe;
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

// Leer una colección completa en tiempo real (sin filtrar por projectId)
// Devuelve la función unsubscribe
function leerColeccion(coleccion, callback) {
  const unsubscribe = db.collection(coleccion).onSnapshot((querySnapshot) => {
    const documentos = [];
    querySnapshot.forEach((doc) => {
      documentos.push({ id: doc.id, ...doc.data() });
    });
    callback(null, documentos);
  }, (error) => {
    console.error(`Error al leer la colección ${coleccion}:`, error);
    callback(error, null);
  });
  return unsubscribe;
}

// Guardar un documento en una colección sin agregar projectId
function guardarDatoGlobal(coleccion, datos) {
  return db.collection(coleccion).add(datos)
    .then((docRef) => {
      console.log('Documento guardado con ID (global):', docRef.id);
      return docRef;
    })
    .catch((error) => {
      console.error('Error al guardar (global):', error);
      throw error;
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

// Upsert documents by a key field (e.g. 'name') within a project:
// - If a document with the same keyField exists for the project, update it
// - Otherwise, create a new document
function upsertDocumentsByName(collectionName, documents, projectId, keyField, callback) {
  // Helper to normalize keys: remove diacritics, collapse spaces, lowercase
  function normalizeKey(value) {
    if (value === undefined || value === null) return '';
    try {
      const s = value.toString();
      return s.normalize('NFKD').replace(/\p{Diacritic}/gu, '').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    } catch (e) {
      return ('' + value).toString().toLowerCase().trim();
    }
  }

  // Fetch existing docs for the project and build a lookup by normalized key
  db.collection(collectionName).where('projectId', '==', projectId).get()
    .then(querySnapshot => {
      const existingMap = {};
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data() || {};
        const keyVal = data[keyField] || '';
        const nk = normalizeKey(keyVal);
        if (nk) existingMap[nk] = docSnap.ref;
      });

      const ops = documents.map(doc => {
        const rawKey = doc[keyField] || '';
        const nk = normalizeKey(rawKey);

        if (nk && existingMap[nk]) {
          // Update existing document
          const docRef = existingMap[nk];
          const payload = { ...doc, projectId: projectId };
          return docRef.update(payload);
        } else {
          // Create new document
          const payload = { ...doc, projectId: projectId };
          return db.collection(collectionName).add(payload);
        }
      });

      return Promise.all(ops).then(() => {
        console.log(`Upsert de ${documents.length} documentos en ${collectionName} completado.`);
        callback(null);
      });
    })
    .catch(error => {
      console.error(`Error en upsertDocumentsByName para ${collectionName}:`, error);
      callback(error);
    });
}

async function batchUpsertInstruments(collectionName, documents, projectId, callback) {
  const promises = documents.map(async (doc) => {
    const query = db.collection(collectionName)
      .where('projectId', '==', projectId)
      .where('name', '==', doc.name);
    
    const querySnapshot = await query.get();
    
    if (querySnapshot.empty) {
      // No existing document, create a new one
      const docRef = db.collection(collectionName).doc();
      return docRef.set({ ...doc, projectId: projectId });
    } else {
      // Existing document(s) found, update the first one
      const existingDocId = querySnapshot.docs[0].id;
      const docRef = db.collection(collectionName).doc(existingDocId);
      return docRef.update(doc);
    }
  });

  try {
    await Promise.all(promises);
    console.log('Lote de instrumentos guardado/actualizado con éxito.');
    callback(null);
  } catch (error) {
    console.error('Error al guardar/actualizar el lote de instrumentos:', error);
    callback(error);
  }
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

function eliminarDatoIngenieria(collectionName, docId, callback) {
    db.collection(collectionName).doc(docId).delete()
        .then(() => {
            console.log('Documento eliminado con éxito');
            callback(null);
        })
        .catch((error) => {
            console.error('Error al eliminar el documento:', error);
            callback(error);
        });
}

function batchDelete(collectionName, docIds, callback) {
    const batch = db.batch();
    docIds.forEach(id => {
        const docRef = db.collection(collectionName).doc(id);
        batch.delete(docRef);
    });

    batch.commit()
        .then(() => {
            console.log('Lote de documentos eliminado con éxito.');
            callback(null);
        })
        .catch((error) => {
            console.error('Error al eliminar el lote de documentos:', error);
            callback(error);
        });
}