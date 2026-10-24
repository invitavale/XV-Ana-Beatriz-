// Variables globales
let isPlaying = false;
let currentSlide = 0;
let totalSlides = 0;

// Oculta la bienvenida con un fundido y pasa la nieve "de afuera" a la invitación
let welcomeHidden = false;
function hideWelcome() {
    if (welcomeHidden) return;
    welcomeHidden = true;
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.classList.add('is-leaving');
        setTimeout(() => { modal.style.display = 'none'; WinterSnow.stopIntro(); }, 1150);
    }
    WinterSnow.enter();
}

/* ---------------------------------------------------------
   Música de fondo (archivo propio: musica.mp3)
   Safari / iPhone solo dejan sonar audio si play() se llama
   DIRECTAMENTE dentro del toque del usuario. Por eso lo
   primero que hace "Ingresar con música" es audio.play(),
   sin esperas ni setTimeout antes.
   --------------------------------------------------------- */
function getAudio() {
    return document.getElementById('bgMusic');
}

function playMusic() {
    const audio = getAudio();
    if (!audio) return;
    audio.muted = false;
    const p = audio.play();               // síncrono, dentro del gesto del usuario
    isPlaying = true;
    updateMusicIcon();
    if (p && typeof p.catch === 'function') {
        p.catch(() => {                   // si el navegador lo bloquea, el botón queda en pausa
            isPlaying = false;
            updateMusicIcon();
        });
    }
}

function pauseMusic() {
    const audio = getAudio();
    if (!audio) return;
    audio.pause();
    isPlaying = false;
    updateMusicIcon();
}

function showMusicButton() {
    const musicPlayer = document.getElementById('musicPlayer');
    if (musicPlayer) musicPlayer.style.display = 'block';
}

/* ---------------------------------------------------------
   Intro: el PRIMER toque en cualquier parte de la pantalla
   1) arranca la música (audio.play() dentro del mismo toque:
      así Safari / iPhone la dejan sonar),
   2) reproduce el video del sobre (sin sonido),
   3) al terminar el video se abre la invitación.
   --------------------------------------------------------- */
let introStarted = false;
function startIntro() {
    if (introStarted) return;
    introStarted = true;

    playMusic();                      // primero la música, dentro del gesto
    showMusicButton();

    const overlay = document.getElementById('welcomeModal');
    const video = document.getElementById('introVideo');
    if (overlay) overlay.classList.add('is-playing');

    if (!video) { hideWelcome(); return; }

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        hideWelcome();
    };

    // Empieza el fundido un poco antes del final para que sea suave
    video.addEventListener('timeupdate', () => {
        if (video.duration && video.currentTime >= video.duration - 0.9) finish();
    });
    video.addEventListener('ended', finish);
    video.addEventListener('error', finish);

    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(finish);   // si el video no puede sonar, se entra directo
    setTimeout(finish, 13000);                                 // respaldo por si el video se queda trabado
}

function toggleMusic() {
    if (isPlaying) pauseMusic(); else playMusic();
}

// Si la persona cambia de pestaña o bloquea el teléfono, se pausa;
// al volver, sigue sonando si estaba sonando.
let resumeOnReturn = false;
document.addEventListener('visibilitychange', () => {
    const audio = getAudio();
    if (!audio) return;
    if (document.hidden) {
        resumeOnReturn = isPlaying;
        if (isPlaying) audio.pause();
    } else if (resumeOnReturn) {
        audio.play().catch(() => { isPlaying = false; updateMusicIcon(); });
    }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializeCarousel();

    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) musicToggle.addEventListener('click', toggleMusic);

    const intro = document.getElementById('welcomeModal');
    if (intro) {
        intro.addEventListener('click', startIntro);
        intro.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startIntro(); }
        });
    }

    // Mostrar el modal de bienvenida para elegir con/sin música
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'flex';
    }
    // La nieve se inicia después de mostrar el modal para que mida bien la pantalla
    WinterSnow.init();
});

function updateMusicIcon() {
    const volumeIcon = document.getElementById('volumeIcon');
    if (!volumeIcon) return;
    if (isPlaying) {
        volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#fff"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08" stroke="#fff" stroke-width="2" stroke-linecap="round"></path>
        `;
    } else {
        volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#fff"></polygon>
            <line x1="16" y1="9" x2="22" y2="15" stroke="#fff" stroke-width="2" stroke-linecap="round"></line>
            <line x1="22" y1="9" x2="16" y2="15" stroke="#fff" stroke-width="2" stroke-linecap="round"></line>
        `;
    }
}

// Countdown
function initializeCountdown() {
    const targetDate = new Date('2026-12-12T19:00:00-04:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Carrusel
function initializeCarousel() {
    const track = document.getElementById('carouselTrack');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (!track) return;

    // calcular total dinámicamente
    const items = track.querySelectorAll('.carousel-item');
    totalSlides = items.length;
    const totalSlidesElement = document.getElementById('totalSlides');
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });
    }

    // Ajuste inicial para asegurar cálculo correcto tras el render
    updateCarousel();
    requestAnimationFrame(updateCarousel);
    setTimeout(updateCarousel, 200);

    // Auto-play del carrusel
    setInterval(() => {
        nextSlide();
    }, 2500);
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    if (track) {
        const items = track.querySelectorAll('.carousel-item');
        if (!items.length) return;
        const container = track.parentElement;

        // Temporarily reset transform to measure actual positions
        const previousTransform = track.style.transform;
        track.style.transform = 'none';

        const firstRect = items[0].getBoundingClientRect();
        const secondRect = items[1] ? items[1].getBoundingClientRect() : null;
        const stepWidth = Math.max(1, secondRect ? Math.round(secondRect.left - firstRect.left) : Math.round(firstRect.width));

        const containerWidth = Math.round(container.getBoundingClientRect().width);
        const visibleCount = Math.max(1, Math.floor((containerWidth + 1) / stepWidth));
        const maxIndex = Math.max(0, totalSlides - visibleCount);

        // Detecta si hay que dar la vuelta (de la última foto a la 1, o viceversa)
        let wrapped = false;
        if (currentSlide > maxIndex) { currentSlide = 0; wrapped = true; }
        if (currentSlide < 0) { currentSlide = maxIndex; wrapped = true; }

        const trackRect = track.getBoundingClientRect();
        const baseLeft = Math.round(firstRect.left - trackRect.left);
        const translateXpx = -Math.round(baseLeft + (currentSlide * stepWidth));

        if (wrapped) {
            // Al dar la vuelta, salta directo a la foto 1 sin animar el regreso
            // (evita el efecto de "devolverse" deslizando hacia atrás por todas las fotos)
            const prevTransition = track.style.transition;
            track.style.transition = 'none';
            track.style.transform = `translateX(${translateXpx}px)`;
            void track.offsetWidth; // fuerza reflow para aplicar el salto sin animación
            track.style.transition = prevTransition || '';
        } else {
            // Apply transform
            track.style.transform = `translateX(${translateXpx}px)`;
        }
        // console.log('Carousel moved to slide:', { currentSlide, visibleCount, maxIndex, translateXpx, stepWidth, baseLeft });
    }
    updateSlideCounter();
    markCenterCarouselItem();
}

function nextSlide() {
    currentSlide++;
    updateCarousel();
}

function previousSlide() {
    currentSlide--;
    updateCarousel();
}

function updateSlideCounter() {
    const currentSlideElement = document.getElementById('currentSlide');
    const totalSlidesElement = document.getElementById('totalSlides');
    if (currentSlideElement) currentSlideElement.textContent = (currentSlide + 1);
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;
}

// Mark center carousel item on desktop
function markCenterCarouselItem() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const items = Array.from(track.querySelectorAll('.carousel-item'));
    if (!items.length) return;
    items.forEach(it => it.classList.remove('is-center'));

    const firstItem = items[0];
    const container = track.parentElement;
    const itemWidth = firstItem.getBoundingClientRect().width;
    const containerWidth = container.getBoundingClientRect().width;
    const visibleCount = Math.max(1, Math.floor(containerWidth / itemWidth));

    const centerIndex = (currentSlide + Math.floor(visibleCount / 2)) % items.length;
    items[centerIndex].classList.add('is-center');
}


window.addEventListener('resize', markCenterCarouselItem);

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(markCenterCarouselItem, 200);
});

// Funciones de los botones
function openLocation(location) {
    // Enlaces de ejemplo (dirección ficticia) - ceremonia y celebración
    const mapsUrls = {
        ceremony: "https://maps.app.goo.gl/43DMkVUKLLY1VvYg8?g_st=iw",
        reception: "https://maps.app.goo.gl/43DMkVUKLLY1VvYg8?g_st=iw"
    };
    const mapsUrl = mapsUrls[location] || mapsUrls.ceremony;
    window.open(mapsUrl, '_blank');
}

// NOTA: esta es una plantilla de ejemplo. Reemplaza el contenido de estas
// funciones con tu propio enlace (Google Drive, Google Form, lista de
// regalos, etc.) cuando personalices la invitación.

function sharePhotos() {
    // Ejemplo: aquí se debe colocar el enlace real a la carpeta de Google Drive.
    window.open('https://photos.app.goo.gl/3CHhoAoMwGeUJKqU9', '_blank');
}

function showDressCode() {
    const modal = document.getElementById('dresscodeModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeDressCodeModal() {
    // El click dentro de la tarjeta del modal usa stopPropagation(), así que
    // esta función solo se dispara al hacer click en el fondo oscuro o en la X.
    const modal = document.getElementById('dresscodeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showGifts() {
    const modal = document.getElementById('giftsModal');
    if (modal) modal.style.display = 'flex';
}

function closeGiftsModal() {
    const modal = document.getElementById('giftsModal');
    if (modal) modal.style.display = 'none';
}

// Copia el número de cuenta; el ícono cambia a un check por un momento
function copyAccount(btn) {
    const text = document.getElementById('bankAccount').textContent.trim();
    const done = () => {
        btn.classList.add('copied');
        btn.setAttribute('aria-label', 'Número copiado');
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.setAttribute('aria-label', 'Copiar número de cuenta');
        }, 1800);
    };
    const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
        fallback();
    }
}

function confirmAttendance() {
    // Ejemplo: aquí se debe colocar el enlace real al formulario de Google Forms.
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSeF5u6Gbe_Zg1ZvNi-SjCKFw6TM9Go3zAktnbt3QgyEQt6Jbg/viewform?usp=publish-editor', '_blank');
}

// Sistema de Toast
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    
    toastContent.innerHTML = `
        <h4 style="font-weight: 700; color: #fff; margin-bottom: 0.35rem; letter-spacing: 0.2px;">${title}</h4>
        <p style="color: #ddd;">${message}</p>
    `;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Nota: el efecto de portada ahora se logra 100% con CSS (hero fijo detrás
// del contenido, ver .hero-section y .content en CCSB.css), igual que en
// boda100L. Ya no hace falta mover nada por JS en el scroll.


// Forzar limpieza de caches en clientes antiguos
(function() {
  function clearCaches() {
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
      }).catch(() => {});
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clearCaches);
  } else {
    clearCaches();
  }
})();


/* =========================================================
   Nieve Winter Wonderland
   - Bienvenida: nevada intensa (canvas a pantalla completa).
   - Al entrar: la portada recibe esa nevada y va bajando
     poco a poco hasta una nevada suave.
   - Cada sección tiene su propio canvas: la nieve cae DENTRO
     de la sección y se desplaza con ella al hacer scroll
     (no queda pegada a la pantalla).
   ========================================================= */
const WinterSnow = (() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    const isSmall = window.innerWidth < 768;

    // Densidad = copos por cada 100.000 px² de área
    const DENSITY = {
        intro:   reduceMotion ? 8 : 46,
        heroIn:  reduceMotion ? 6 : 30,   // al entrar
        heroOut: reduceMotion ? 3 : 9,    // nevada suave en portada
        section: reduceMotion ? 3 : 10
    };
    const MAX = {
        intro: isSmall ? 170 : 300,
        hero: isSmall ? 110 : 200,
        section: isSmall ? 45 : 80
    };

    /* ---------- Sprites (se dibujan una sola vez) ---------- */
    function crystalSprite(px, color, glow) {
        const c = document.createElement('canvas');
        c.width = c.height = px;
        const g = c.getContext('2d');
        const r = px * 0.42;
        g.translate(px / 2, px / 2);
        g.strokeStyle = color;
        g.lineCap = 'round';
        g.lineWidth = Math.max(1, px / 15);
        if (glow) { g.shadowColor = glow; g.shadowBlur = px / 6; }
        for (let i = 0; i < 6; i++) {
            g.save();
            g.rotate(i * Math.PI / 3);
            g.beginPath();
            g.moveTo(0, 0); g.lineTo(0, -r);
            // ramitas
            g.moveTo(0, -r * 0.5);  g.lineTo(-r * 0.24, -r * 0.72);
            g.moveTo(0, -r * 0.5);  g.lineTo(r * 0.24, -r * 0.72);
            g.moveTo(0, -r * 0.25); g.lineTo(-r * 0.16, -r * 0.4);
            g.moveTo(0, -r * 0.25); g.lineTo(r * 0.16, -r * 0.4);
            g.stroke();
            g.restore();
        }
        g.fillStyle = color;
        g.beginPath(); g.arc(0, 0, px / 18, 0, Math.PI * 2); g.fill();
        return c;
    }

    function dotSprite(px, inner, outer) {
        const c = document.createElement('canvas');
        c.width = c.height = px;
        const g = c.getContext('2d');
        const grd = g.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
        grd.addColorStop(0, inner);
        grd.addColorStop(0.45, inner);
        grd.addColorStop(1, outer);
        g.fillStyle = grd;
        g.fillRect(0, 0, px, px);
        return c;
    }

    const THEMES = {
        // sobre fondo oscuro / foto
        dark: {
            crystal: crystalSprite(64, 'rgba(255,255,255,0.95)', 'rgba(190,215,245,0.9)'),
            dot: dotSprite(32, 'rgba(255,255,255,0.95)', 'rgba(255,255,255,0)')
        },
        // sobre fondo blanco hielo: copos azul cristal
        light: {
            crystal: crystalSprite(64, 'rgba(120,152,201,0.85)', 'rgba(255,255,255,0.9)'),
            dot: dotSprite(32, 'rgba(150,180,222,0.8)', 'rgba(150,180,222,0)')
        },
        // sobre las secciones azul hielo: copos blancos con borde azul suave
        frost: {
            crystal: crystalSprite(64, 'rgba(255,255,255,0.98)', 'rgba(71,102,154,0.55)'),
            dot: dotSprite(32, 'rgba(255,255,255,1)', 'rgba(255,255,255,0)')
        }
    };

    const imgFlake = new Image();
    imgFlake.src = 'winter-copo-cristal.webp';

    /* ---------- Campo de nieve ---------- */
    class Field {
        constructor(canvas, opts) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.theme = THEMES[opts.theme || 'light'];
            this.density = opts.density;
            this.max = opts.max;
            this.big = opts.big || 1;         // escala de tamaño
            this.flakes = [];
            this.visible = true;
            this.running = !!opts.running;
            this.w = 0; this.h = 0;
            this.fadeTo = null;               // {from, to, start, dur}
            this.resize();
        }

        target() {
            return Math.min(this.max, Math.round(this.w * this.h / 100000 * this.density));
        }

        resize() {
            const host = this.canvas.parentElement;
            const w = Math.max(1, host.clientWidth);
            const h = Math.max(1, host.clientHeight);
            if (w === this.w && h === this.h) return;
            this.w = w; this.h = h;
            this.canvas.width = Math.round(w * DPR);
            this.canvas.height = Math.round(h * DPR);
            this.flakes.forEach(f => { if (f.x > w) f.x = Math.random() * w; if (f.y > h) f.y = Math.random() * h; });
            this.fill(true);
        }

        fill(scatter) {
            const t = this.target();
            while (this.flakes.length < t) this.flakes.push(this.make(scatter));
        }

        make(scatter) {
            const z = Math.random();                       // profundidad 0 (lejos) – 1 (cerca)
            const roll = Math.random();
            const kind = roll < 0.58 ? 'dot' : (roll < 0.95 ? 'crystal' : 'image');
            let size;
            if (kind === 'dot') size = (1.6 + z * 3.2) * this.big;
            else if (kind === 'crystal') size = (7 + z * 9) * this.big;
            else size = (14 + z * 10) * this.big;
            return {
                x: Math.random() * this.w,
                y: scatter ? Math.random() * this.h : -size - Math.random() * 40,
                size,
                kind,
                vy: (reduceMotion ? 10 : 22) + z * (reduceMotion ? 18 : 48),
                sway: 8 + Math.random() * 22,
                swaySpeed: 0.4 + Math.random() * 0.9,
                phase: Math.random() * Math.PI * 2,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 0.9,
                alpha: 0.45 + z * 0.55
            };
        }

        setDensity(to, dur) {
            this.fadeTo = { from: this.density, to, start: performance.now(), dur };
        }

        step(dt, now) {
            if (this.fadeTo) {
                const k = Math.min(1, (now - this.fadeTo.start) / this.fadeTo.dur);
                const e = 1 - Math.pow(1 - k, 2);
                this.density = this.fadeTo.from + (this.fadeTo.to - this.fadeTo.from) * e;
                if (k >= 1) this.fadeTo = null;
            }
            const t = this.target();
            const time = now / 1000;
            for (let i = this.flakes.length - 1; i >= 0; i--) {
                const f = this.flakes[i];
                f.y += f.vy * dt;
                f.rot += f.vr * dt;
                f.dx = Math.sin(time * f.swaySpeed + f.phase) * f.sway;
                if (f.y - f.size > this.h) {
                    // Si hay que nevar menos, el copo que sale no vuelve a aparecer
                    if (this.flakes.length > t) { this.flakes.splice(i, 1); continue; }
                    Object.assign(f, this.make(false));
                }
            }
            // Si hay que nevar más, agregamos copos desde arriba
            if (this.flakes.length < t) {
                const add = Math.min(t - this.flakes.length, 3);
                for (let i = 0; i < add; i++) this.flakes.push(this.make(false));
            }
        }

        draw() {
            const ctx = this.ctx;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const imgReady = imgFlake.complete && imgFlake.naturalWidth > 0;
            for (const f of this.flakes) {
                const x = (f.x + (f.dx || 0)) * DPR;
                const y = f.y * DPR;
                const s = f.size * DPR;
                ctx.globalAlpha = f.alpha;
                if (f.kind === 'dot') {
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.drawImage(this.theme.dot, x - s, y - s, s * 2, s * 2);
                } else {
                    const cos = Math.cos(f.rot), sin = Math.sin(f.rot);
                    ctx.setTransform(cos, sin, -sin, cos, x, y);
                    const sprite = (f.kind === 'image' && imgReady) ? imgFlake : this.theme.crystal;
                    ctx.drawImage(sprite, -s / 2, -s / 2, s, s);
                }
            }
            ctx.globalAlpha = 1;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }

    /* ---------- Orquestación ---------- */
    let intro = null, hero = null;
    const sections = [];
    let last = performance.now();
    let entered = false;

    function addCanvas(host, cls) {
        const c = document.createElement('canvas');
        c.className = cls;
        c.setAttribute('aria-hidden', 'true');
        host.insertBefore(c, host.firstChild);
        return c;
    }

    function loop(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const heroVisible = window.scrollY < window.innerHeight;
        if (intro && intro.running) { intro.step(dt, now); intro.draw(); }
        if (hero && hero.running && heroVisible) { hero.step(dt, now); hero.draw(); }
        if (entered) {
            for (const f of sections) {
                if (f.visible) { f.step(dt, now); f.draw(); }
            }
        }
        requestAnimationFrame(loop);
    }

    function init() {
        const introCanvas = document.getElementById('introSnow');
        if (introCanvas) {
            intro = new Field(introCanvas, { theme: 'dark', density: DENSITY.intro, max: MAX.intro, running: true, big: 1.1 });
        }

        const heroEl = document.querySelector('[data-snow="hero"]');
        if (heroEl) {
            const c = addCanvas(heroEl, 'section-snow');
            c.style.zIndex = '2';
            hero = new Field(c, { theme: 'dark', density: 0, max: MAX.hero });
        }

        const io = 'IntersectionObserver' in window
            ? new IntersectionObserver(entries => {
                entries.forEach(e => { if (e.target._snow) e.target._snow.visible = e.isIntersecting; });
            }, { rootMargin: '120px 0px' })
            : null;

        const ro = 'ResizeObserver' in window
            ? new ResizeObserver(entries => entries.forEach(e => e.target._snow && e.target._snow.resize()))
            : null;

        document.querySelectorAll('[data-snow]:not([data-snow="hero"])').forEach(el => {
            const c = addCanvas(el, 'section-snow');
            const theme = el.classList.contains('alt') ? 'frost' : 'light';
            const f = new Field(c, { theme, density: DENSITY.section, max: MAX.section, running: true });
            el._snow = f;
            sections.push(f);
            if (io) io.observe(el);
            if (ro) ro.observe(el);
        });

        window.addEventListener('resize', () => {
            if (intro) intro.resize();
            if (hero) hero.resize();
            if (!ro) sections.forEach(f => f.resize());
        });

        requestAnimationFrame(t => { last = t; requestAnimationFrame(loop); });
    }

    // Al entrar: la portada empieza con nevada intensa y va bajando
    function enter() {
        entered = true;
        if (hero) {
            hero.resize();
            hero.density = DENSITY.heroIn;
            hero.flakes = [];
            hero.fill(true);
            hero.running = true;
            hero.setDensity(DENSITY.heroOut, 6000);
        }
        if (intro) intro.setDensity(0, 1000);
    }

    function stopIntro() {
        if (!intro) return;
        intro.running = false;
        intro.flakes = [];
        intro.ctx.clearRect(0, 0, intro.canvas.width, intro.canvas.height);
    }

    return { init, enter, stopIntro };
})();
