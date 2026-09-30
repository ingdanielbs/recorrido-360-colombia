const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.card');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.filter;

    filters.forEach((item) => item.classList.toggle('is-active', item === button));

    cards.forEach((card) => {
      const categories = card.dataset.category?.split(/\s+/) ?? [];
      const visible = value === 'todos' || categories.includes(value);
      card.hidden = !visible;
    });
  });
});
