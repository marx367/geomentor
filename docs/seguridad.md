# Seguridad

## Claves de IA

- Las carga cada estudiante en el panel de configuración.
- Se guardan en **localStorage** de su navegador (clave `gm_ia`), en texto plano.
- Se envían **solo** al proveedor elegido, directo desde el navegador.
- **Nunca** van en el código ni en el repositorio. Si hace falta un ejemplo, usar `TU_CLAVE_ACA`.

### Riesgos

- Cualquiera con acceso a ese navegador o perfil puede leer la clave (F12 → Application → Local Storage).
- Una extensión maliciosa del navegador también puede leerla.
- Si la app se publica en internet y otra persona carga **tu** clave, el uso se cobra en tu cuenta.

### Recomendaciones

- Usar claves con **límite de gasto** configurado en el proveedor.
- No cargar claves en computadoras compartidas. Para borrarlas: panel de IA → borrar, o limpiar los datos del sitio.
- Si la app pasa a tener varios usuarios con claves compartidas, hace falta un backend que guarde la clave (ver "Señales para reevaluar" en `CLAUDE.md`).

## Datos del estudiante

Los apuntes, el progreso y los puntos débiles quedan en el navegador. Si en el futuro se guardan datos reales de otras personas en un servidor, hace falta **control de acceso** antes de usarlos.

## Repositorio

- Repositorio **privado** en GitHub.
- Hook de pre-commit con **gitleaks**: bloquea commits que contengan algo con forma de clave.
- `.gitignore` excluye `.env` y archivos de claves.

## Código

- El laboratorio usa un parser propio: **nunca `eval` ni `new Function`** sobre lo que escribe el usuario.
- El texto de la IA y del usuario se escapa (`escapeHTML`) antes de insertarlo como HTML.
