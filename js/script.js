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

/* ============ Виджет: бесплатный AI-аудит лендинга ============ */
(function () {
    const form = document.getElementById('audit-form');
    if (!form) return;
    const urlInput = document.getElementById('audit-url');
    const statusEl = document.getElementById('audit-status');
    const listEl = document.getElementById('audit-list');
    const fullEl = document.getElementById('audit-full');
    const API = 'https://audit.eduardwit.ru/api/audit';

    function normalize(value) {
        value = value.trim();
        if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
        return value;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const url = normalize(urlInput.value);
        if (!url) return;
        statusEl.textContent = 'Анализируем лендинг…';
        listEl.innerHTML = '';
        fullEl.style.display = 'none';
        try {
            const res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Ошибка ' + res.status);
            listEl.innerHTML = '';
            (data.top_5_recommendations || []).forEach(function (rec, i) {
                const li = document.createElement('li');
                const strong = document.createElement('strong');
                strong.textContent = 'Рекомендация ' + (i + 1) + '. ';
                li.appendChild(strong);
                li.appendChild(document.createTextNode(rec));
                listEl.appendChild(li);
            });
            statusEl.textContent = '';
            fullEl.style.display = 'inline-block';
        } catch (err) {
            statusEl.textContent = '' + (err.message || 'Не удалось выполнить аудит.');
        }
    });
})();