// Backend de guardado en la base de datos de claude.ai. Solo existe cuando la app corre como
// artefacto dentro de claude.ai; cada usuario tiene su espacio privado en data/users/<id>.
// Si algo falla, lanza el error: la fachada (almacen.js) cae a localStorage.

// Devuelve el backend listo, o null si no estamos en claude.ai o no hay usuario.
export async function conectarClaude() {
  if (!window.claude || typeof claude.use !== 'function') return null;
  const [db, user] = await Promise.all([
    claude.use('db').catch(() => null),
    claude.use('user').catch(() => null)
  ]);
  if (!db || !user) return null;
  try {
    const uid = await user.id();
    return uid ? crearAlmacenClaude(db, uid) : null;
  } catch (e) { return null; }
}

function crearAlmacenClaude(db, uid) {
  const base = `data/users/${uid}`;
  const debilesRef = () => db.doc(`${base}/progreso`).collection('debiles');
  return {
    async getDoc(name, fallback) {
      const s = await db.doc(`${base}/${name}`).get();
      return s.exists ? structuredClone(s.data()) : fallback;
    },
    async setDoc(name, data) {
      await db.doc(`${base}/${name}`).set(data);
      return true;
    },
    async listDebiles() {
      const snap = await debilesRef().orderBy('fecha', 'desc').get();
      return snap.docs.map(d => ({ id: d.id, ...structuredClone(d.data()) }));
    },
    async addDebil(item) {
      const ref = await debilesRef().add(item);
      return { id: ref.id, ...item };
    },
    async updateDebil(id, item) {
      const { id: _id, ...datos } = item; // el id es el nombre del documento, no un campo
      await debilesRef().doc(id).set(datos);
      return true;
    },
    // Borra los documentos pedidos y cada punto débil. Uno por vez: borrar un documento no borra
    // lo que cuelga de su ruta, por eso los débiles se recorren aparte.
    async borrarTodo(nombres) {
      const snap = await debilesRef().get();
      for (const d of snap.docs) await debilesRef().doc(d.id).delete();
      for (const n of nombres) await db.doc(`${base}/${n}`).delete();
      return true;
    }
  };
}
