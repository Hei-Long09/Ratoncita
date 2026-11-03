(() => {
  'use strict';
  const config = window.BIRTHDAY_CONFIG.memories;
  const $ = (selector) => document.querySelector(selector);
  const screen = $('#memories-screen');
  const viewport = $('#memories-viewport');
  const letterPage = $('#memory-letter-page');
  const letter = $('#memory-letter');
  const letterLines = $('#memory-letter-lines');
  const album = $('#memory-album');
  const music = $('#memories-music');
  const status = $('#memory-media-status');
  const progress = $('#memory-progress');
  const pauseButton = $('#pause-memories');
  const soundButton = $('#memories-sound');
  const giftScreen = $('#gift-screen');
  const giftBackground = $('#gift-background');
  const giftVideo = $('#gift-video');
  const giftStatus = $('#gift-status');
  const giftPlay = $('#gift-play');
  let giftSession = 0;
  let giftButton;
  const gallery = $('#gift-gallery');
  const galleryGrid = $('#gift-video-grid');
  const galleryReturn = $('#gallery-return');
  const passwordDialog = $('#video-password-dialog');
  const videoPassword = $('#video-password');
  const passwordError = $('#video-password-error');
  let pendingVideo = null;
  let selectedGalleryVideo = false;
  let selectedCard;
  function exitGiftFullscreen() {
    if (document.fullscreenElement === giftVideo && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    else if (giftVideo.webkitDisplayingFullscreen && giftVideo.webkitExitFullscreen) giftVideo.webkitExitFullscreen();
  }
  function showGallery() {
    giftSession++;
    giftVideo.pause();
    exitGiftFullscreen();
    giftVideo.hidden = true;
    giftPlay.hidden = true;
    giftStatus.textContent = '';
    galleryReturn.hidden = true;
    $('#gift-fullscreen').hidden = true;
    gallery.hidden = false;
    $('#gallery-title').focus();
  }
  function openGalleryVideo(number) {
    giftSession++;
    selectedGalleryVideo = true;
    gallery.hidden = true;
    giftVideo.hidden = false;
    $('#gift-fullscreen').hidden = false;
    galleryReturn.hidden = false;
    giftStatus.textContent = '';
    giftVideo.src = `assets/video%20${number}.mp4`;
    giftVideo.currentTime = 0;
    giftPlay.textContent = 'Reproducir este video ♡';
    playGift();
  }
  function buildVideoGallery() {
    galleryGrid.replaceChildren();
    for (let number = 1; number <= 6; number++) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'gift-video-card';
      const visual = document.createElement('span');
      visual.className = 'gift-video-preview';
      const badge = document.createElement('span');
      badge.textContent = number >= 5 ? '♡ Video secreto · Sin vista previa' : `▷ Video ${number}`;
      if (number <= 4) {
        const preview = document.createElement('video');
        preview.src = `assets/video%20${number}.mp4`;
        preview.muted = true;
        preview.playsInline = true;
        preview.preload = 'metadata';
        preview.setAttribute('aria-hidden', 'true');
        visual.append(preview);
      }
      visual.append(badge);
      const title = document.createElement('h3');
      title.textContent = number <= 3 ? 'Las sandías son deliciosas y dolorosas de romper.' : number === 4 ? 'Nuestros hijos acompañándonos a clases' : 'Cariño, si quieres ver, adivina la contraseña. Recuerda que es la caja de Pandora: si la abres, no hay vuelta atrás.';
      card.append(visual, title);
      card.addEventListener('click', () => {
        selectedCard = card;
        if (number <= 4) { openGalleryVideo(number); return; }
        pendingVideo = number;
        videoPassword.value = '';
        videoPassword.removeAttribute('aria-invalid');
        passwordError.textContent = '';
        passwordDialog.showModal();
        videoPassword.focus();
      });
      galleryGrid.append(card);
    }
  }
  $('#video-password-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (videoPassword.value !== window.BIRTHDAY_CONFIG.password) {
      passwordError.textContent = 'Esa no es la clave… recuerda el apodo que te di ♡';
      videoPassword.setAttribute('aria-invalid', 'true');
      videoPassword.focus();
      return;
    }
    const number = pendingVideo;
    pendingVideo = null;
    videoPassword.value = '';
    passwordDialog.close();
    if (number === 5 || number === 6) openGalleryVideo(number);
  });
  function cancelVideoPassword() {
    pendingVideo = null;
    videoPassword.value = '';
    passwordDialog.close();
    selectedCard?.focus();
  }
  $('#cancel-video-password').addEventListener('click', cancelVideoPassword);
  passwordDialog.addEventListener('cancel', () => { pendingVideo = null; videoPassword.value = ''; });
  galleryReturn.addEventListener('click', showGallery);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cancelled = Symbol('cancelled');
  const pending = new Set();
  let active = false;
  let paused = false;
  let session = 0;
  let fadeFrame;
  let audioSession = 0;
  let previous;
  let pages = [];
  let letterColumns = [];

  // El reloj de lectura se detiene al pausar o salir de la pestaña.
  function wait(ms, token, onProgress) {
    return new Promise((resolve, reject) => {
      let elapsed = 0;
      let last;
      const task = { frame: 0, reject };
      pending.add(task);
      function tick(now) {
        if (!active || token !== session) {
          pending.delete(task);
          reject(cancelled);
          return;
        }
        if (last !== undefined && !paused && !document.hidden) elapsed += Math.min(now - last, 100);
        last = now;
        const fraction = ms === 0 ? 1 : Math.min(1, elapsed / ms);
        if (onProgress) onProgress(fraction);
        if (fraction === 1) { pending.delete(task); resolve(); }
        else task.frame = requestAnimationFrame(tick);
      }
      task.frame = requestAnimationFrame(tick);
    });
  }
  function cancelSequence() {
    session++;
    for (const task of pending) { cancelAnimationFrame(task.frame); task.reject(cancelled); }
    pending.clear();
  }
  function makeParagraph(parent, text, className) {
    const paragraph = document.createElement('p');
    if (className) paragraph.className = className;
    paragraph.setAttribute('aria-label', text);
    const ink = document.createElement('span');
    ink.setAttribute('aria-hidden', 'true');
    paragraph.append(ink);
    parent.append(paragraph);
    return { paragraph, ink, text };
  }
  async function typeLine(line, token) {
    line.paragraph.classList.add('is-writing');
    const characters = Array.from(line.text);
    await wait(characters.length * config.typingMs, token, (fraction) => {
      line.ink.textContent = characters.slice(0, Math.floor(characters.length * fraction)).join('');
      if (letterPage.hidden === false) {
        // Mantener la última frase visible en celulares sin saltar a la siguiente sección.
        const bottom = line.paragraph.getBoundingClientRect().bottom - viewport.getBoundingClientRect().top + viewport.scrollTop;
        viewport.scrollTop = Math.max(viewport.scrollTop, bottom - viewport.clientHeight + 90);
      }
    });
    line.paragraph.classList.remove('is-writing');
  }
  function buildAlbum() {
    album.replaceChildren();
    pages = [];
    for (let index = 0; index < config.photos.length; index += 2) {
      const page = document.createElement('section');
      page.className = 'memory-photo-page';
      page.setAttribute('aria-label', `Recuerdos ${index + 1} y ${Math.min(index + 2, config.photos.length)}`);
      const grid = document.createElement('div');
      grid.className = 'memory-photo-grid';
      const lines = [];
      for (const [offset, photo] of config.photos.slice(index, index + 2).entries()) {
        const card = document.createElement('article');
        card.className = 'memory-photo-card';
        const copy = document.createElement('div');
        copy.className = 'memory-photo-copy';
        const number = document.createElement('span');
        number.className = 'memory-number';
        number.textContent = `RECUERDO ${String(index + offset + 1).padStart(2, '0')}`;
        const title = document.createElement('h2');
        title.textContent = photo.title;
        copy.append(number, title);
        for (const text of photo.lines) lines.push(makeParagraph(copy, text));
        const image = document.createElement('img');
        image.src = photo.src;
        image.alt = `Ratoncita · ${photo.title}`;
        image.loading = index < 4 ? 'eager' : 'lazy';
        image.decoding = 'async';
        // Reservar espacio sin recortar el rostro ni deformar las fotos.
        image.width = 600;
        image.height = 720;
        image.addEventListener('error', () => {
          image.hidden = true;
          const missing = document.createElement('p');
          missing.className = 'missing-memory';
          missing.textContent = `Aquí irá ratoncita ${String(index + offset + 1).padStart(2, '0')} ♡`;
          card.append(missing);
        }, {once:true});
        card.append(copy, image);
        grid.append(card);
      }
      page.append(grid);
      album.append(page);
      pages.push({ element: page, lines });
    }
    const end = document.createElement('div');
    end.className = 'memory-ending';
    const endText = document.createElement('p');
    endText.textContent = 'Y todavía nos quedan muchos recuerdos por crear. ♡';
    const replay = document.createElement('button');
    replay.className = 'primary';
    replay.type = 'button';
    replay.textContent = 'Volver a vivirlo ♡';
    replay.addEventListener('click', restart);
    giftButton = document.createElement('button');
    giftButton.className = 'primary';
    giftButton.type = 'button';
    giftButton.textContent = 'Florecita hay un regalo más';
    giftButton.addEventListener('click', openGift);
    end.append(endText, replay, giftButton);
    album.append(end);
    return end;
  }
  async function scrollToElement(element, token) {
    const destination = element.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
    await scrollToPosition(destination, token);
  }
  async function scrollToPosition(destination, token) {
    const start = viewport.scrollTop;
    await wait(reducedMotion.matches ? 0 : config.scrollMs, token, fraction => {
      const ease = fraction * fraction * (3 - 2 * fraction);
      viewport.scrollTop = start + (destination - start) * ease;
    });
  }
  async function run(token, ending) {
    try {
      for (const [index, text] of config.letter.entries()) {
        const column = index < Math.ceil(config.letter.length / 2) ? 0 : 1;
        const line = makeParagraph(letterColumns[column], text, 'memory-letter-line');
        await typeLine(line, token);
        if (index < config.letter.length - 1) await wait(config.linePauseMs, token);
      }
      await wait(config.letterHoldMs, token);
      letter.classList.add('letter-leaving');
      await wait(reducedMotion.matches ? 0 : 700, token);
      letterPage.hidden = true;
      album.hidden = false;
      viewport.scrollTop = 0;
      for (const [index, page] of pages.entries()) {
        progress.textContent = `Recuerdos ${index * 2 + 1}–${Math.min(index * 2 + 2, config.photos.length)} de ${config.photos.length}`;
        if (index > 0) await scrollToElement(page.element, token);
        for (const [lineIndex, line] of page.lines.entries()) {
          await typeLine(line, token);
          if (lineIndex < page.lines.length - 1) await wait(config.linePauseMs, token);
        }
        // Si el celular es corto, mostrar también la parte inferior de las fotos antes de avanzar.
        const bottom = page.element.getBoundingClientRect().bottom - viewport.getBoundingClientRect().top + viewport.scrollTop;
        if (bottom > viewport.scrollTop + viewport.clientHeight) {
          await scrollToPosition(bottom - viewport.clientHeight, token);
        }
        await wait(index === 0 ? config.firstPhotoHoldMs : config.photoHoldMs, token);
      }
      await scrollToElement(ending, token);
      progress.textContent = 'Todos nuestros recuerdos, con mucho cariño ♡';
      pauseButton.hidden = true;
      viewport.classList.add('can-explore');
    } catch (error) {
      if (error !== cancelled) {
        status.textContent = 'No se pudo continuar la lectura. Vuelve a entrar para intentarlo de nuevo.';
        console.error(error);
      }
    }
  }
  function restart() {
    cancelSequence();
    paused = false;
    pauseButton.hidden = false;
    pauseButton.textContent = 'Pausar lectura';
    pauseButton.setAttribute('aria-pressed', 'false');
    viewport.classList.remove('can-explore');
    letterPage.hidden = false;
    letter.classList.remove('letter-leaving');
    letterLines.replaceChildren();
    letterColumns = [document.createElement('div'), document.createElement('div')];
    letterLines.append(...letterColumns);
    album.hidden = true;
    viewport.scrollTop = 0;
    progress.textContent = 'Una carta para ti';
    run(session, buildAlbum());
  }
  function soundLabel() {
    soundButton.textContent = music.paused ? 'Activar música ♫' : 'Pausar música ♫';
    soundButton.setAttribute('aria-pressed', String(!music.paused));
  }
  function crossfade() {
    const old = previous.previousMusic;
    const token = ++audioSession;
    cancelAnimationFrame(fadeFrame);
    const oldVolume = old.volume;
    previous.originalVolume = oldVolume;
    // Reproducir directamente desde el clic, sin pasar por un AudioContext.
    // Así también funciona al abrir index.html como archivo local.
    music.muted = false;
    music.volume = 0.01;
    music.currentTime = 0;
    let start;
    music.play().then(() => {
      if (!active || token !== audioSession) return;
      status.textContent = '';
      soundLabel();
      // Esperar a que la canción arranque antes de bajar la anterior.
      fadeFrame = requestAnimationFrame(fade);
    }).catch(() => {
      if (!active || token !== audioSession) return;
      old.pause();
      restorePreviousVolume();
      music.volume = 0.65;
      status.textContent = 'Toca «Activar música» para escuchar Happy Birthday.';
      soundLabel();
    });
    function fade(now) {
      if (!active || token !== audioSession) return;
      start ??= now;
      const fraction = config.musicFadeMs <= 0 ? 1 : Math.min(1, (now - start) / config.musicFadeMs);
      old.volume = oldVolume * Math.cos(fraction * Math.PI / 2);
      music.volume = 0.01 + 0.64 * Math.sin(fraction * Math.PI / 2);
      if (fraction < 1) fadeFrame = requestAnimationFrame(fade);
      else { old.pause(); restorePreviousVolume(); }
    }
  }
  function restorePreviousVolume() {
    const old = previous.previousMusic;
    old.volume = previous.originalVolume ?? 0.65;
  }
  window.BirthdayMemories = {
    open(options) {
      previous = { ...options };
      active = true;
      screen.hidden = false;
      status.textContent = '';
      document.body.classList.add('watching-memories');
      previous.previousVideo.pause();
      crossfade();
      restart();
      pauseButton.focus();
    }
  };
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? 'Continuar lectura' : 'Pausar lectura';
    pauseButton.setAttribute('aria-pressed', String(paused));
    viewport.classList.toggle('can-explore', paused);
  });
  soundButton.addEventListener('click', () => {
    status.textContent = '';
    if (music.paused) {
      audioSession++;
      cancelAnimationFrame(fadeFrame);
      previous.previousMusic.pause();
      restorePreviousVolume();
      music.muted = false;
      music.volume = 0.65;
      music.play().then(soundLabel).catch(() => {
        status.textContent = 'No se pudo reproducir la canción. Comprueba el archivo de audio.';
        soundLabel();
      });
    } else {
      audioSession++;
      cancelAnimationFrame(fadeFrame);
      music.pause();
      previous.previousMusic.pause();
      restorePreviousVolume();
      music.volume = 0.65;
      soundLabel();
    }
  });
  music.addEventListener('play', soundLabel);
  music.addEventListener('pause', soundLabel);
  music.addEventListener('error', () => {
    status.textContent = 'No se pudo cargar assets/happybirthday.mpeg.';
  });
  function requestGiftFullscreen() {
    try {
      // Solicitarlo en el mismo clic para conservar la activación del usuario.
      const request = giftVideo.requestFullscreen || giftVideo.webkitRequestFullscreen;
      if (request) {
        const token = giftSession;
        Promise.resolve(request.call(giftVideo)).catch(() => {
          if (!giftScreen.hidden && token === giftSession) giftStatus.textContent = 'El video sigue disponible aquí. Puedes usar el control de pantalla completa del reproductor.';
        });
      } else if (giftVideo.webkitEnterFullscreen) {
        giftVideo.webkitEnterFullscreen();
      }
    } catch {
      giftStatus.textContent = 'Usa el control de pantalla completa del reproductor para ampliar tu regalo.';
    }
  }
  function playGift() {
    const token = giftSession;
    giftVideo.muted = false;
    giftVideo.volume = 1;
    giftPlay.hidden = true;
    giftVideo.play().then(() => {
      if (token === giftSession && !giftScreen.hidden) giftPlay.hidden = true;
    }).catch(() => {
      if (token !== giftSession || giftScreen.hidden) return;
      giftStatus.textContent = 'Toca el botón para reproducir tu regalo.';
      giftPlay.hidden = false;
    });
    requestGiftFullscreen();
  }
  function openGift() {
    giftSession++;
    audioSession++;
    cancelAnimationFrame(fadeFrame);
    music.pause();
    previous.previousMusic.pause();
    restorePreviousVolume();
    screen.hidden = true;
    giftScreen.hidden = false;
    giftStatus.textContent = '';
    gallery.hidden = true;
    galleryReturn.hidden = true;
    $('#gift-fullscreen').hidden = false;
    giftVideo.hidden = false;
    selectedGalleryVideo = false;
    giftVideo.src = 'assets/by%20jhonatan.mp4';
    giftPlay.textContent = 'Reproducir mi regalo ♡';
    buildVideoGallery();
    giftBackground.muted = true;
    giftBackground.currentTime = 0;
    giftVideo.currentTime = 0;
    const token = giftSession;
    giftBackground.play().catch(() => {
      if (token === giftSession && !giftScreen.hidden) giftStatus.textContent = 'No se pudo iniciar el fondo de princesa.';
    });
    playGift();
    $('#close-gift').focus();
  }
  giftPlay.addEventListener('click', playGift);
  $('#gift-fullscreen').addEventListener('click', requestGiftFullscreen);
  giftVideo.addEventListener('error', () => {
    if (!giftScreen.hidden && !giftVideo.hidden) {
      giftStatus.textContent = selectedGalleryVideo ? 'No se pudo cargar este video. Comprueba que esté en assets con el nombre video 1.mp4, video 2.mp4, etc.' : 'No se pudo cargar assets/by jhonatan.mp4.';
      giftPlay.hidden = false;
    }
  });
  giftVideo.addEventListener('ended', () => {
    if (giftScreen.hidden) return;
    showGallery();
  });
  $('#close-gift').addEventListener('click', () => {
    giftSession++;
    giftVideo.pause();
    giftBackground.pause();
    exitGiftFullscreen();
    giftScreen.hidden = true;
    screen.hidden = false;
    music.muted = false;
    music.volume = 0.65;
    music.play().then(soundLabel).catch(() => {
      status.textContent = 'Toca «Activar música» para escuchar Happy Birthday.';
      soundLabel();
    });
    giftButton.focus();
  });
  $('#close-memories').addEventListener('click', () => {
    active = false;
    cancelSequence();
    audioSession++;
    cancelAnimationFrame(fadeFrame);
    music.pause();
    restorePreviousVolume();
    screen.hidden = true;
    document.body.classList.remove('watching-memories');
    previous.onClose();
  });
})();
