document.addEventListener("DOMContentLoaded", () => {

    /* ─── NAV SCROLL EFFECT ─── */
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    /* ─── HERO PARALLAX / LOAD ANIMATION ─── */
    const hero = document.querySelector('.hero');
    if (hero) {
        setTimeout(() => hero.classList.add('loaded'), 100);
        window.addEventListener('scroll', () => {
            const bg = hero.querySelector('.hero-img-bg');
            if (bg) bg.style.transform = `scale(1.05) translateY(${window.scrollY * 0.18}px)`;
        }, { passive: true });
    }

    /* ─── SCROLL REVEAL ─── */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => io.observe(el));
    }

    /* ─── ANIMATED COUNTERS ─── */
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (counters.length) {
        const counterIO = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const el = e.target;
                const target = parseFloat(el.dataset.target);
                const suffix = el.dataset.suffix || '';
                const duration = 1400;
                const start = performance.now();
                const isFloat = el.dataset.target.includes('.');
                const animate = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const val = target * ease;
                    el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
                    if (progress < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
                counterIO.unobserve(el);
            });
        }, { threshold: 0.5 });
        counters.forEach(el => counterIO.observe(el));
    }

    /* ─── QUIZ ENGINE ─── */
    const quizConfig = {
        quiz1: { answers: ['b', 'c', 'b', 'a'], resultId: 'res1' },
        quiz2: { answers: ['b', 'c', 'b', 'a'], resultId: 'res2' },
        quiz3: { answers: ['b', 'a', 'c', 'b'], resultId: 'res3' },
    };

    const icons = {
        perfect: 'fa-solid fa-trophy',
        good:    'fa-solid fa-thumbs-up',
        bad:     'fa-solid fa-rotate-right',
    };
    const messages = {
        perfect: ['4/4 — Kiváló munka! Te vagy a bajnok!', 'green'],
        good:    ['%/4 — Nem rossz, de még gyakorolj!', 'orange'],
        bad:     ['%/4 — Olvasd el újra az anyagot!', 'red'],
    };

    Object.entries(quizConfig).forEach(([quizId, cfg]) => {
        const form = document.getElementById(quizId);
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const data = new FormData(this);
            let score = 0;
            cfg.answers.forEach((ans, i) => {
                if (data.get(`q${i + 1}`) === ans) score++;
            });

            const res = document.getElementById(cfg.resultId);
            let tier = score === 4 ? 'perfect' : score >= 2 ? 'good' : 'bad';
            const [msgTemplate, colorClass] = messages[tier];
            const msg = msgTemplate.replace('%', score);

            res.innerHTML = `<i class="${icons[tier]}"></i> ${msg}`;
            res.className = `result ${colorClass} show`;

            // Scroll result into view
            setTimeout(() => res.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        });
    });

    /* ─── SCROLL-REVEAL BOTTOM IMAGES ─── */
    const revealImgWraps = document.querySelectorAll('[data-reveal-img]');
    if (revealImgWraps.length) {
        const updateRevealImages = () => {
            revealImgWraps.forEach(wrap => {
                const rect = wrap.getBoundingClientRect();
                const windowH = window.innerHeight;

                // progress: 0 when top of element hits bottom of viewport,
                //           1 when element is fully scrolled through
                const progress = Math.max(0, Math.min(1,
                    (windowH - rect.top) / (rect.height + windowH * 0.4)
                ));

                if (progress > 0) {
                    wrap.classList.add('in-view');
                    // opacity: fades from 0 → 0.92 (nearly fully visible at end)
                    const opacity = Math.min(0.92, progress * 1.1);
                    // blur: starts at 20px, goes to 0px (sharp) as you scroll
                    const blur = Math.max(0, 20 - progress * 22);
                    wrap.style.setProperty('--img-opacity', opacity);
                    wrap.style.setProperty('--img-blur', blur + 'px');
                } else {
                    wrap.classList.remove('in-view');
                    wrap.style.setProperty('--img-opacity', 0);
                    wrap.style.setProperty('--img-blur', '20px');
                }
            });
        };

        window.addEventListener('scroll', updateRevealImages, { passive: true });
        updateRevealImages();
    }


    document.querySelectorAll('.submit-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const r = document.createElement('span');
            r.className = 'ripple';
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            r.style.cssText = `
                position:absolute; border-radius:50%; background:rgba(255,255,255,0.25);
                width:${size}px; height:${size}px; pointer-events:none;
                left:${e.clientX - rect.left - size/2}px;
                top:${e.clientY - rect.top - size/2}px;
                animation: rippleAnim 0.6s ease-out forwards;
            `;
            if (!document.getElementById('rippleStyle')) {
                const s = document.createElement('style');
                s.id = 'rippleStyle';
                s.textContent = '@keyframes rippleAnim{from{transform:scale(0);opacity:1}to{transform:scale(2.5);opacity:0}}';
                document.head.appendChild(s);
            }
            this.appendChild(r);
            setTimeout(() => r.remove(), 600);
        });
    });
});
