# Una sorpresa para ti

Al terminar `by jhonatan.mp4` aparece una cuadrícula de seis videos sobre el fondo de princesa. Coloca los archivos `video 1.mp4` a `video 6.mp4` en `dist/assets/`. Los primeros cuatro muestran vista previa; los videos 5 y 6 solo muestran una tarjeta de video secreto y no cargan su archivo antes de introducir la clave de `BIRTHDAY_CONFIG.password` (`Ratoncita`). Cada apertura de un video secreto vuelve a pedir la clave. Al terminar un video se regresa a la lista; también está disponible el botón «Lista de videos».

Página de cumpleaños adaptable al celular, sin dependencias. Ejecuta `npm run dev` y abre http://127.0.0.1:3000.

## Personalización

Edita `dist/config.js`: clave del apodo (**Ratoncita**, con R mayúscula), destinatario y mensaje. La clave es una interacción de regalo y se puede leer en el código del navegador; no sirve para proteger información privada.

## Sorpresa bajo las estrellas

Debajo de «Un poquito más de magia», «Hay más sorpresas para ti» abre una pantalla con `dist/assets/estrellas.mp4` como fondo y `dist/assets/fecility.mp3` como música, ambos en bucle. El video está silenciado para escuchar solo la canción.

La bienvenida y el botón rosa dan paso a una dedicatoria que añade una línea exclusivamente al pulsar el botón Una línea más (también mediante su activación con teclado). Cada frase se revela suavemente durante 1,6 segundos y su espacio se expande de forma gradual. Al terminar, «Volver a leer» reinicia los textos sin interrumpir los medios. «Volver» detiene ambos y regresa a la felicitación. Puedes pausar o reactivar la música con su control.

Edita `stars` en `dist/config.js` para personalizar la bienvenida, el título y cada línea. Los textos están adaptados al español, sin asumir la edad de la destinataria. Si el navegador bloquea el audio, se muestra un mensaje para activarlo con el botón.

El servidor local admite los tipos de archivo multimedia y las peticiones por rangos para reproducción en celular. Ejecuta `node verify.cjs` para comprobar los estados de interacción y `npm.cmd run dev` para abrir el proyecto.

## Inventario visual

## Carta y recorrido de fotos

Al terminar la dedicatoria de estrellas aparece «Cariño, todavía hay más». La siguiente pantalla reutiliza el fondo rosa de entrada y añade cuadrados claros animados con CSS.

La carta aparece letra a letra; al terminar espera 3 segundos y se desvanece. Después aparecen siete secciones de dos fotos, desde `assets/ratoncita 01.jpeg` hasta `assets/ratoncita 14.jpeg`. Las secciones permanecen en el recorrido y se baja automáticamente entre ellas, sin desvanecer las fotos. Después de sus textos, cada sección espera 4 segundos antes de bajar a la siguiente. Al acabar se puede recorrer el álbum manualmente o reiniciar la lectura.

Los mensajes y los tiempos están en `memories` de `dist/config.js`. Son dedicatorias en español inspiradas en el tono de las referencias; personalízalas con tu historia. Cada `src` permite cambiar la foto o su extensión. Las fotos reales se reutilizan; no se generan ni se usan capturas de referencia como fondos.

La música cambia a `assets/happybirthday.mpeg` con un fundido cruzado de 2,5 segundos. La reproducción usa directamente los elementos de audio, con volumen gradual, sin depender de un AudioContext. El fundido comienza cuando la nueva canción ya está reproduciéndose. «Pausar lectura» detiene los textos y el avance para leer o desplazarse libremente; la canción sigue. El reloj de lectura también se pausa al ocultar la pestaña. «Volver» cancela el recorrido y regresa a las estrellas. Las preferencias de movimiento reducido eliminan el desplazamiento animado y los cuadrados en movimiento.

Comprobaciones: `npm.cmd run check`, `node verify.cjs` y `node verify-memories.cjs`. La reproducción y el acabado visual deben comprobarse también en un celular real.

## Recursos de la pantalla inicial

| Recurso de la captura | Decisión | Implementación |
| --- | --- | --- |
| Personaje blanco de ojos grandes con corazón rosa | Generar una ilustración original con IA, inspirada en el estilo y las proporciones | `dist/assets/heart-friend.png`, recurso independiente con transparencia |
| Base cuadrada pastel detrás del personaje | Construir con código | Degradado, borde y sombra en `.illustration` |
| Fondo rosa con variaciones melocotón | Construir con código | Gradientes CSS en `body` |
| Tarjeta rosa translúcida, bordes redondeados y sombra | Construir con código | `.card` adaptable |
| Campo blanco y botón coral | Controles HTML reales | Formulario con validación y teclado de texto |
| Indicador azul sobre el campo | Parece un cursor/indicador de carga superpuesto | Se omite de la interfaz final |
| Corazones, destellos, candado y ojo | Construir con código | SVG y caracteres decorativos, sin descargas |
| Textos de la referencia en chino | Adaptar al español | Texto HTML seleccionable |

La captura completa no se utiliza como fondo. Se añadieron estados de error, mostrar/ocultar clave, felicitación, confeti y regreso. Se respeta la preferencia de movimiento reducido.

Para compartir por WhatsApp, el sitio debe estar publicado con acceso público y se debe enviar su URL HTTPS. Un despliegue privado de Sites solo lo puede abrir su propietario hasta habilitar el acceso correspondiente.

Al entrar o regresar a las estrellas se inicia fecility; al entrar o regresar a la carta y los recuerdos se inicia Happy Birthday. La entrada restaura el volumen y desactiva el silencio aunque antes se haya pausado la canción. Los archivos MPEG declaran su tipo audio/mpeg y se precargan. Si el navegador rechaza el inicio, el control de música permite reintentarlo con volumen audible.

## Regalo final

Debajo de Volver a vivirlo aparece el botón Florecita hay un regalo más. Abre princesa.mp4 como fondo en bucle y silenciado e inicia by jhonatan.mp4 con su audio. La canción Happy Birthday se pausa mientras se ve el regalo y se reanuda al volver a los recuerdos. Ambos videos se detienen al salir de esa pantalla.

Se solicita pantalla completa en el mismo clic de entrada, con compatibilidad para el reproductor nativo de Safari. Si el navegador la rechaza, el video sigue visible en toda la página y se puede ampliar con el botón o el control del reproductor. Si se bloquea la reproducción, aparece un botón para iniciarla.
