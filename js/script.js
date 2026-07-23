const hamburger = document.querySelector('.hamburger'),
    menu = document.querySelector('.menu'),
    closeElem = document.querySelector('.menu__close'),
    overlay = document.querySelector('.menu__overlay');

hamburger.addEventListener('click', () => {
    menu.classList.add('active');
});

closeElem.addEventListener('click', () => {
    menu.classList.remove('active');
});

overlay.addEventListener('click', () => {
    menu.classList.remove('active');
});

const percents = document.querySelectorAll('.skills__level-percent'),
    lines = document.querySelectorAll('.skills__level-line');

percents.forEach((item, i) => {
    lines[i].style.width = item.innerHTML;
});

const modal = document.getElementById('certModal');
const modalImg = modal.querySelector('.modal__img');

document.querySelectorAll('[data-cert]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        modalImg.src = link.getAttribute('href');
        modal.classList.add('active');
    });
});

modal.addEventListener('click', e => {
    if (e.target.closest('.modal__content') && !e.target.classList.contains('modal__close')) return;
    modal.classList.remove('active');
    modalImg.src = '';
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        modal.classList.remove('active');
        modalImg.src = '';
    }
});