(() => {
  'use strict';
  const config = window.BIRTHDAY_CONFIG;
  const form = document.querySelector('#unlock-form');
  const input = document.querySelector('#password');
  const feedback = document.querySelector('#feedback');
  const entry = document.querySelector('#entry');
  const surprise = document.querySelector('#surprise');
  const toggle = document.querySelector('#toggle-password');
  document.querySelector('#recipient').textContent = config.recipient;
  document.querySelector('#birthday-message').textContent = config.message;
  toggle.addEventListener('click', () => {
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    toggle.setAttribute('aria-label', visible ? 'Ocultar clave' : 'Mostrar clave');
    toggle.setAttribute('aria-pressed', String(visible));
  });
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    feedback.textContent = '';
  });
  function celebrate() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = document.querySelector('#confetti');
    container.replaceChildren();
    const colors = ['#d85e8a','#fff2d9','#ffffff','#ba83b5','#f6ba82'];
    for (let i = 0; i < 65; i++) {
      const piece = document.createElement('i');
      piece.className = 'piece';
      piece.style.setProperty('--left', `${Math.random() * 100}%`);
      piece.style.setProperty('--color', colors[i % colors.length]);
      piece.style.setProperty('--duration', `${2.5 + Math.random() * 2}s`);
      piece.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
      piece.addEventListener('animationend', () => piece.remove(), {once:true});
      container.append(piece);
    }
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value !== config.password) {
      feedback.textContent = !input.value ? 'Escribe tu apodo para continuar.' : 'Esa no es la clave… prueba con el apodo que te di';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      entry.classList.remove('shake');
      void entry.offsetWidth;
      entry.classList.add('shake');
      return;
    }
    entry.hidden = true;
    surprise.hidden = false;
    surprise.focus();
    celebrate();
  });
  document.querySelector('#celebrate').addEventListener('click', celebrate);
  const stars = document.querySelector('#stars-screen');
  const video = document.querySelector('#stars-video');
  const music = document.querySelector('#stars-music');
  const starsTitle = document.querySelector('#stars-title');
  const starsIntro = document.querySelector('#stars-intro');
  const starsLines = document.querySelector('#stars-lines');
  const starsNext = document.querySelector('#stars-next');
  const starsMore = document.querySelector('#stars-more');
  const starsHint = document.querySelector('#stars-hint');
  const musicToggle = document.querySelector('#toggle-music');
  const mediaStatus = document.querySelector('#media-status');
  let lineIndex = -1;
  let screenSession = 0;
  function updateMusicControl() {
    musicToggle.textContent = music.paused ? 'Activar música ♫' : 'Pausar música ♫';
    musicToggle.setAttribute('aria-pressed', String(!music.paused));
  }
  function playMusic() {
    // Invocar desde el toque permite iniciar el audio en navegadores móviles.
    const session = screenSession;
    music.muted = false;
    music.volume = 0.65;
    music.play().then(() => {
      if (stars.hidden || session !== screenSession) return;
      updateMusicControl();
    }).catch(() => {
      if (stars.hidden || session !== screenSession) return;
      updateMusicControl();
      mediaStatus.textContent = 'Toca «Activar música» para escuchar la canción.';
    });
  }
  function resetStars() {
    starsMore.hidden = true;
    lineIndex = -1;
    starsTitle.textContent = config.stars.greeting;
    starsIntro.textContent = config.stars.intro;
    starsIntro.hidden = false;
    starsLines.replaceChildren();
    starsNext.textContent = 'Pide un deseo ✧';
    starsHint.textContent = 'Un pequeño momento, solo para ti.';
  }
  function advanceStars() {
    if (lineIndex === -1) {
      starsTitle.textContent = config.stars.title;
      starsIntro.hidden = true;
      lineIndex = 0;
      starsNext.textContent = 'Una línea más ♡';
      starsHint.textContent = 'Pulsa «Una línea más» para seguir leyendo.';
    } else if (lineIndex < config.stars.lines.length) {
      const line = document.createElement('p');
      line.className = 'stars-line';
      line.textContent = config.stars.lines[lineIndex++];
      const reveal = document.createElement('div');
      reveal.className = 'stars-line-reveal';
      reveal.append(line);
      starsLines.append(reveal);
      if (lineIndex === config.stars.lines.length) {
        starsNext.textContent = 'Volver a leer ♡';
        starsMore.hidden = false;
        starsHint.textContent = 'Que todos tus deseos encuentren su estrella.';
      }
    } else {
      resetStars();
    }
  }
  document.querySelector('#more-surprises').addEventListener('click', () => {
    screenSession++;
    resetStars();
    mediaStatus.textContent = '';
    surprise.hidden = true;
    stars.hidden = false;
    document.body.classList.add('watching-stars');
    document.querySelector('#confetti').replaceChildren();
    video.currentTime = 0;
    music.currentTime = 0;
    music.volume = 0.65;
    video.muted = true;
    const session = screenSession;
    video.play().catch(() => {
      if (!stars.hidden && session === screenSession) mediaStatus.textContent = 'No se pudo iniciar el video. Vuelve a entrar para intentarlo otra vez.';
    });
    playMusic();
    starsNext.focus();
  });
  starsNext.addEventListener('click', advanceStars);
  starsMore.addEventListener('click', () => {
    window.BirthdayMemories.open({
      previousMusic: music,
      previousVideo: video,
      onClose() {
        stars.hidden = false;
        mediaStatus.textContent = '';
        playMusic();
        video.play().catch(() => {});
        starsMore.focus();
      }
    });
    stars.hidden = true;
  });
  musicToggle.addEventListener('click', () => {
    mediaStatus.textContent = '';
    if (music.paused) playMusic();
    else { music.pause(); updateMusicControl(); }
  });
  music.addEventListener('play', updateMusicControl);
  music.addEventListener('pause', updateMusicControl);
  video.addEventListener('error', () => { mediaStatus.textContent = 'No se pudo cargar el video de estrellas.'; });
  music.addEventListener('error', () => { mediaStatus.textContent = 'No se pudo cargar la música.'; });
  document.querySelector('#close-stars').addEventListener('click', () => {
    screenSession++;
    video.pause();
    music.pause();
    stars.hidden = true;
    surprise.hidden = false;
    document.body.classList.remove('watching-stars');
    document.querySelector('#more-surprises').focus();
  });
  document.querySelector('#back').addEventListener('click', () => {
    surprise.hidden = true;
    entry.hidden = false;
    entry.classList.remove('shake');
    form.reset();
    input.type = 'password';
    input.removeAttribute('aria-invalid');
    toggle.setAttribute('aria-label', 'Mostrar clave');
    toggle.setAttribute('aria-pressed', 'false');
    feedback.textContent = '';
    document.querySelector('#confetti').replaceChildren();
    input.focus();
  });
})();
