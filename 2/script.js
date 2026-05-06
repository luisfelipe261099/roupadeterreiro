const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const catalogGrid = document.querySelector('[data-catalog-grid]');
const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
const searchInput = document.querySelector('#catalog-search');

if (catalogGrid) {
  const cards = Array.from(catalogGrid.querySelectorAll('.product-card'));

  const applyFilters = () => {
    const activeButton = filterButtons.find((button) => button.classList.contains('active'));
    const activeCategory = activeButton ? activeButton.dataset.filter : 'todos';
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    cards.forEach((card) => {
      const category = card.dataset.category || '';
      const name = (card.dataset.name || '').toLowerCase();
      const categoryMatch = activeCategory === 'todos' || category === activeCategory;
      const searchMatch = query.length === 0 || name.includes(query);
      card.classList.toggle('is-hidden', !(categoryMatch && searchMatch));
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  applyFilters();
}

document.querySelectorAll('.js-product-whats').forEach((button) => {
  const product = button.getAttribute('data-product') || 'produto';
  const message = encodeURIComponent(`Ola, quero pedir este produto: ${product}`);
  button.setAttribute('href', `https://wa.me/5541998172291?text=${message}`);
  button.setAttribute('target', '_blank');
  button.setAttribute('rel', 'noopener noreferrer');
});
