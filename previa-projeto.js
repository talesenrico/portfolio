document.querySelectorAll('[data-previa]').forEach((card) => {
  const video = card.querySelector('video');
  const button = card.querySelector('.botao-previa');
  const label = button.querySelector('span');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let requested = false;
  let attempt = 0;

  function stop() {
    requested = false;
    attempt += 1;
    video.pause();
    if (video.readyState > 0) video.currentTime = 0;
    card.classList.remove('reproduzindo');
    button.setAttribute('aria-pressed', 'false');
    label.textContent = 'Reproduzir prévia';
  }

  async function play() {
    if (requested) return;
    requested = true;
    const current = ++attempt;
    video.muted = true;
    try {
      await video.play();
      if (current !== attempt) return;
      card.classList.add('reproduzindo');
      button.setAttribute('aria-pressed', 'true');
      label.textContent = 'Pausar prévia';
    } catch (error) {
      if (current !== attempt) return;
      stop();
      if (error.name !== 'AbortError') label.textContent = 'Tentar reproduzir';
    }
  }

  card.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse' && !reducedMotion.matches) play();
  });
  card.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') stop();
  });
  button.addEventListener('click', () => requested ? stop() : play());
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') stop();
  });
  card.addEventListener('focusout', (event) => {
    if (!card.contains(event.relatedTarget) && !card.matches(':hover')) stop();
  });
  video.addEventListener('error', () => {
    stop();
    label.textContent = 'Prévia indisponível';
    button.disabled = true;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) stop();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) stop();
    }).observe(card);
  }
});
