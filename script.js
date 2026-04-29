document.addEventListener('DOMContentLoaded', () => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // CURSOR (Desktop)
    if (!isTouch) {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        if (cursor && follower) {
            let mx = 0, my = 0, fx = 0, fy = 0;
            document.addEventListener('mousemove', e => {
                mx = e.clientX; my = e.clientY;
                cursor.style.transform = `translate(${mx-10}px,${my-10}px)`;
            });
            (function anim() {
                fx += (mx-fx)*.15; fy += (my-fy)*.15;
                follower.style.transform = `translate(${fx-3}px,${fy-3}px)`;
                requestAnimationFrame(anim);
            })();
            document.querySelectorAll('a,button,.product-card,.cart-toggle,.faq-question').forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
            });
            document.querySelectorAll('.btn-magnetic').forEach(btn => {
                btn.addEventListener('mousemove', e => {
                    const r = btn.getBoundingClientRect();
                    btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.15}px,${(e.clientY-r.top-r.height/2)*.15}px)`;
                });
                btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
            });
        }
    }

    // LOADER
    const loader = document.getElementById('loader');
    if (loader) {
        const hide = () => { loader.style.opacity='0'; setTimeout(()=>loader.style.display='none',600); };
        window.addEventListener('load', () => setTimeout(hide, 800));
        setTimeout(hide, 3000);
    }

    // HAMBURGER
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
        navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));
    }

    // LAZY LOAD
    document.querySelectorAll('img').forEach(img => { if (!img.hasAttribute('loading')) img.setAttribute('loading','lazy'); });

    // REVEAL
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.05 });
    document.querySelectorAll('.section,.product-card,.story-section,.atelier,.reveal-item,.timeline-step,.testimonial-card,.lookbook-item').forEach(el => {
        if (!el.classList.contains('reveal-item')) el.classList.add('reveal-item');
        obs.observe(el);
    });

    // PARTICLES
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
        resize(); window.addEventListener('resize', resize);
        for (let i = 0; i < 60; i++) {
            particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*2+.5, dx: (Math.random()-.5)*.3, dy: (Math.random()-.5)*.3, o: Math.random()*.5+.2 });
        }
        function drawParticles() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
                ctx.fillStyle = `rgba(212,175,55,${p.o})`;
                ctx.fill();
                p.x += p.dx; p.y += p.dy;
                if (p.x<0||p.x>canvas.width) p.dx *= -1;
                if (p.y<0||p.y>canvas.height) p.dy *= -1;
            });
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }

    // COUNTERS
    const counters = document.querySelectorAll('.counter-number');
    let counted = false;
    const counterObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting && !counted) {
                counted = true;
                counters.forEach(c => {
                    const target = +c.dataset.target;
                    let current = 0;
                    const step = target / 60;
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) { c.textContent = target; clearInterval(timer); }
                        else c.textContent = Math.ceil(current);
                    }, 30);
                });
            }
        });
    }, { threshold: 0.3 });
    if (counters.length) counterObs.observe(counters[0].closest('.hero-counters'));

    // FAQ
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            document.querySelectorAll('.faq-item').forEach(i => { if (i !== item) i.classList.remove('active'); });
            item.classList.toggle('active');
        });
    });

    // SIZE SELECTOR
    document.querySelectorAll('.size-selector').forEach(sel => {
        sel.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sel.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });

    // CART
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    function openCart() { cartSidebar?.classList.add('active'); cartOverlay?.classList.add('active'); document.body.style.overflow='hidden'; }
    function closeCartFn() { cartSidebar?.classList.remove('active'); cartOverlay?.classList.remove('active'); document.body.style.overflow=''; }

    function updateCartUI() {
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = cart.length);
        const list = document.querySelector('.cart-items-list');
        const total = document.querySelector('.cart-total-value');
        if (!list) return;
        list.innerHTML = '';
        let sum = 0;
        if (!cart.length) list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:30px 0">Carrinho vazio</p>';
        cart.forEach((item, i) => {
            sum += item.price;
            const d = document.createElement('div');
            d.className = 'cart-item';
            d.innerHTML = `<img src="${item.image}" alt="${item.name}" width="50" height="50"><div class="cart-item-info"><h4>${item.name}${item.size ? ' - '+item.size : ''}</h4><p>R$ ${item.price.toFixed(2).replace('.',',')}</p></div><button class="remove-item" data-index="${i}">&times;</button>`;
            list.appendChild(d);
        });
        if (total) total.textContent = `R$ ${sum.toFixed(2).replace('.',',')}`;
        list.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => { cart.splice(+btn.dataset.index,1); localStorage.setItem('cart',JSON.stringify(cart)); updateCartUI(); });
        });
    }

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const sizeEl = btn.parentElement.querySelector('.size-btn.active');
            cart.push({ name: btn.dataset.name, price: parseFloat(btn.dataset.price), image: btn.dataset.image, size: sizeEl ? sizeEl.textContent : null });
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
            const orig = btn.textContent;
            btn.textContent = '✓ Adicionado!'; btn.style.background='var(--accent)'; btn.style.borderColor='var(--accent)'; btn.style.color='#000';
            setTimeout(() => { btn.textContent=orig; btn.style.background=''; btn.style.borderColor=''; btn.style.color=''; }, 1500);
        });
    });

    const checkoutBtn = document.querySelector('.checkout-whatsapp');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!cart.length) return;
            let msg = "Olá! Gostaria de fazer um pedido:\n\n";
            let sum = 0;
            cart.forEach(item => { msg += `• ${item.name}${item.size?' ('+item.size+')':''}  — R$ ${item.price.toFixed(2).replace('.',',')}\n`; sum += item.price; });
            msg += `\n*Total: R$ ${sum.toFixed(2).replace('.',',')}*\n\nComo posso prosseguir?`;
            window.open(`https://wa.me/5500000000000?text=${encodeURIComponent(msg)}`, '_blank');
        });
    }

    document.querySelectorAll('.cart-toggle').forEach(el => el.addEventListener('click', openCart));
    document.querySelector('.close-cart')?.addEventListener('click', closeCartFn);
    cartOverlay?.addEventListener('click', closeCartFn);
    updateCartUI();

    // SMOOTH SCROLL
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) { e.preventDefault(); const t = document.querySelector(this.getAttribute('href')); if (t) t.scrollIntoView({behavior:'smooth'}); });
    });
});
