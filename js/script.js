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

/* ============ Виджет: Content Factory демо ============ */
(function () {
    const form = document.getElementById('cf-form');
    if (!form) return;
    const inputEl = document.getElementById('cf-input');
    const statusEl = document.getElementById('cf-status');
    const resultEl = document.getElementById('cf-result');
    const WEBHOOK = 'https://n8n.eduardwit.ru/webhook/content-intake';
    const TOKEN = '26081978';
    const SUPABASE_URL = 'https://supabase.eduardwit.ru';
    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc5MDQ0NDAwLCJleHAiOjE5MzY4MTA4MDB9.xgdflSp9w0s94W2ts6GKgnQv8THTNaoQe0yI3TttZjQ';
    let timer = null;
    let externalId = null;

    function renderSteps(stepIndex) {
        const steps = [
            'Заявка принята',
            'AI анализирует персонажа',
            'Контент готов',
            'Опубликовано'
        ];
        const html = steps.map(function (s, i) {
            const done = i < stepIndex ? 'done' : '';
            const mark = i < stepIndex ? '&#10003;' : '';
            return '<div class="cf-widget__step ' + done + '"><span class="mark">' + mark + '</span>' + s + '</div>';
        }).join('');
        return '<div class="cf-widget__result-steps">' + html + '</div>';
    }

    function renderCard(item) {
        const c = item.content || {};
        const traits = Array.isArray(c.черты) ? c.черты : [];
        const traitsHtml = traits.map(function (t) {
            return '<span class="cf-widget__trait">' + t + '</span>';
        }).join('');
        return '<div class="cf-widget__result-card">' +
            '<div class="cf-widget__result-name">' + (c.имя || 'Персонаж') + '</div>' +
            '<span class="cf-widget__result-role">' + (c.роль || '') + '</span>' +
            (traitsHtml ? '<div class="cf-widget__result-block"><b>Черты</b><div class="cf-widget__result-traits">' + traitsHtml + '</div></div>' : '') +
            (c.мотивация ? '<div class="cf-widget__result-block"><b>Мотивация</b><p>' + c.мотивация + '</p></div>' : '') +
            (c.предыстория ? '<div class="cf-widget__result-block"><b>Предыстория</b><p>' + c.предыстория + '</p></div>' : '') +
            '</div>';
    }

    async function poll() {
        try {
            const headers = {
                apikey: ANON_KEY,
                Authorization: 'Bearer ' + ANON_KEY
            };
            // 1. cf_inbox по external_id → id входящей заявки
            const rIn = await fetch(SUPABASE_URL + '/rest/v1/cf_inbox?select=id,status&external_id=eq.' + externalId + '&limit=1', { headers });
            const inbox = await rIn.json();
            const status = (inbox[0] || {}).status;
            const inboxId = (inbox[0] || {}).id || null;

            // 2. cf_items по inbox_id (в cf_items нет external_id)
            let items = [], itemId = null;
            if (inboxId) {
                const rItem = await fetch(SUPABASE_URL + '/rest/v1/cf_items?select=content,id&inbox_id=eq.' + inboxId + '&limit=1', { headers });
                items = await rItem.json();
                itemId = items.length ? items[0].id : null;
            }

            let stepIndex = 0;
            if (status && status !== 'new') stepIndex = 1;
            if (items.length) stepIndex = 2;

            let pubs = [];
            if (itemId) {
                const rPubs = await fetch(SUPABASE_URL + '/rest/v1/cf_publications?select=platform,status&item_id=eq.' + itemId + '&status=eq.success&limit=5', { headers });
                pubs = await rPubs.json();
            }
            if (pubs.length) stepIndex = 3;

            if (items.length) {
                resultEl.innerHTML = renderCard(items[0]) + renderSteps(stepIndex);
            } else {
                resultEl.innerHTML = renderSteps(stepIndex);
            }

            if (stepIndex >= 3) {
                clearInterval(timer);
                statusEl.textContent = 'Готово — персонаж опубликован.';
            }
        } catch (e) {
            console.error(e);
        }
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const text = inputEl.value.trim();
        if (!text) return;
        statusEl.textContent = 'Отправляем заявку…';
        resultEl.innerHTML = '';
        const name = text.split(',')[0].trim();
        const bio = text.indexOf(',') > -1 ? text.slice(text.indexOf(',') + 1).trim() : text;
        externalId = 'demo-' + Date.now();
        try {
            const res = await fetch(WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Ingest-Token': TOKEN
                },
                body: JSON.stringify({
                    source: 'demo',
                    external_id: externalId,
                    type: 'character',
                    payload: { name: name, bio: bio }
                })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            statusEl.textContent = 'Заявка принята — AI работает…';
            await poll();
            timer = setInterval(poll, 4000);
            setTimeout(function () {
                clearInterval(timer);
                if (statusEl.textContent.indexOf('Готово') === -1) {
                    statusEl.textContent = 'Время ожидания вышло — конвейер может быть занят. Попробуйте ещё раз.';
                }
            }, 90000);
        } catch (err) {
            statusEl.textContent = 'Не удалось отправить заявку: ' + (err.message || '');
        }
    });
})();