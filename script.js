document.addEventListener('DOMContentLoaded', () => {
    // ===== DETECT TOUCH DEVICE =====
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // ===== CUSTOM CURSOR (Desktop Only) =====
    if (!isTouch) {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');

        if (cursor && follower) {
            let mouseX = 0, mouseY = 0;
            let followerX = 0, followerY = 0;

            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                cursor.style.transform = `translate(${mouseX - 10}px, ${mouseY - 10}px)`;
            });

            // Smooth follower with RAF
            function animateFollower() {
                followerX += (mouseX - followerX) * 0.15;
                followerY += (mouseY - followerY) * 0.15;
                follower.style.transform = `translate(${followerX - 3}px, ${followerY - 3}px)`;
                requestAnimationFrame(animateFollower);
            }
            animateFollower();

            // Hover effect
            document.querySelectorAll('a, button, .product-card, .cart-toggle').forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
            });

            // Magnetic buttons
            document.querySelectorAll('.btn-magnetic').forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translate(0, 0)';
                });
            });
        }
    }

    // ===== LOADER =====
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 600);
            }, 800);
        });
        // Fallback: hide loader after 3s no matter what
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 600);
        }, 3000);
    }

    // ===== HAMBURGER MENU =====
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('open'));
        });
    }

    // ===== LAZY LOAD =====
    document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });

    // ===== REVEAL ON SCROLL =====
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.section, .product-card, .story-section, .atelier, .reveal-item').forEach(el => {
        if (!el.classList.contains('reveal-item')) el.classList.add('reveal-item');
        revealObserver.observe(el);
    });

    // ===== CART LOGIC =====
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');

    function openCart() {
        cartSidebar?.classList.add('active');
        cartOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartFn() {
        cartSidebar?.classList.remove('active');
        cartOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateCartUI() {
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = cart.length);

        const cartItemsList = document.querySelector('.cart-items-list');
        const cartTotal = document.querySelector('.cart-total-value');

        if (cartItemsList) {
            cartItemsList.innerHTML = '';
            let total = 0;

            if (cart.length === 0) {
                cartItemsList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 30px 0;">Carrinho vazio</p>';
            }

            cart.forEach((item, index) => {
                total += item.price;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" width="50" height="50">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <button class="remove-item" data-index="${index}">&times;</button>
                `;
                cartItemsList.appendChild(div);
            });

            if (cartTotal) cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

            // Remove item listeners
            cartItemsList.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    cart.splice(parseInt(btn.dataset.index), 1);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartUI();
                });
            });
        }
    }

    // Add to Cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            cart.push({
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                image: btn.dataset.image
            });
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();

            // Feedback
            const original = btn.textContent;
            btn.textContent = '✓ Adicionado!';
            btn.style.background = 'var(--accent)';
            btn.style.borderColor = 'var(--accent)';
            btn.style.color = '#000';
            setTimeout(() => {
                btn.textContent = original;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 1500);
        });
    });

    // WhatsApp Checkout
    const checkoutBtn = document.querySelector('.checkout-whatsapp');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;

            let msg = "Olá! Gostaria de fazer um pedido:\n\n";
            let total = 0;
            cart.forEach(item => {
                msg += `• ${item.name} — R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
                total += item.price;
            });
            msg += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;
            msg += "\n\nComo posso prosseguir com o pagamento e entrega?";

            window.open(`https://wa.me/5500000000000?text=${encodeURIComponent(msg)}`, '_blank');
        });
    }

    // Cart toggle
    document.querySelectorAll('.cart-toggle').forEach(el => {
        el.addEventListener('click', openCart);
    });
    document.querySelector('.close-cart')?.addEventListener('click', closeCartFn);
    cartOverlay?.addEventListener('click', closeCartFn);

    updateCartUI();

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});
