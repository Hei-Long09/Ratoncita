# Publicar y actualizar desde GitHub

Usa la carpeta `sorpresa-rosa` como raíz del repositorio. Aquí deben quedar `package.json`, `.github/` y `dist/`, sin una carpeta adicional por encima.

## Primera publicación

1. Instala GitHub Desktop desde https://desktop.github.com/ e inicia sesión.
2. Usa **File → Add Local Repository** y selecciona la carpeta `sorpresa-rosa`. Si todavía no es un repositorio, elige la opción para crearlo en esa ubicación.
3. Comprueba los archivos, crea el primer commit y usa **Publish repository**. Elige la visibilidad que quieras para tus archivos.
4. En GitHub abre **Settings → Pages → Build and deployment → Source → GitHub Actions**.
5. En **Actions**, abre **Publicar página de cumpleaños** y pulsa **Run workflow** sobre `main`. Si pide habilitar Actions, actívalo primero.
6. Cuando la ejecución termine correctamente, el enlace aparecerá en **Settings → Pages** y en el despliegue de Actions. Ese es el enlace para WhatsApp.

GitHub Pages está disponible para repositorios públicos en GitHub Free. Para usar Pages con un repositorio privado se requiere un plan compatible. Otra opción es conservar el repositorio privado y conectarlo a un servicio de alojamiento compatible.

## Actualizaciones

1. Añade fotos o videos en `dist/assets/`.
2. Edita los mensajes y las rutas en `dist/config.js` para los recuerdos. Actualmente la cuadrícula de videos tiene seis entradas; para aumentar esa cantidad también hay que modificarla en `dist/memories.js`.
3. Revisa los cambios en GitHub Desktop, escribe un mensaje, pulsa **Commit to main** y luego **Push origin**.
4. El workflow publicará nuevamente `dist/`. El enlace se mantiene.

## Tamaños de los videos

El archivo actual más grande es `video 4.mp4`, de aproximadamente 86 MiB. Utiliza GitHub Desktop o Git para subirlo: el navegador de GitHub limita las cargas a 25 MiB por archivo. Git normal bloquea archivos que superan 100 MiB. Para videos futuros más grandes, comprímelos o usa alojamiento externo de video; acumular archivos pesados también hace crecer el historial del repositorio.

Solo se publica `dist/`. El servidor local, la documentación y las comprobaciones quedan en el repositorio. La configuración local `.openai/` queda excluida por `.gitignore`.

Referencias: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages y https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
