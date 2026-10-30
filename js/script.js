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

/* ============ Портфолио: фильтры по направлениям ============ */
(function () {
    const filters = document.querySelectorAll('.projects__filter');
    const cards = document.querySelectorAll('.projects__card[data-cat]');
    if (!filters.length || !cards.length) return;
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            cards.forEach(card => {
                const cats = (card.dataset.cat || '').split(' ');
                card.style.display = (filter === 'all' || cats.indexOf(filter) > -1) ? '' : 'none';
            });
        });
    });
})();

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
    const motivationEl = document.getElementById('cf-motivation');
    const extraEl = document.getElementById('cf-extra');
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

    function roleRu(role) {
        const map = {
            'protagonist': 'Главный герой',
            'supporting': 'Второстепенный',
            'antagonist': 'Антагонист'
        };
        return map[role] || role || '';
    }

    function renderCard(item) {
        const c = item.content || {};
        const traits = Array.isArray(c.черты) ? c.черты : [];
        const traitsHtml = traits.map(function (t) {
            return '<span class="cf-widget__trait">' + t + '</span>';
        }).join('');
        return '<div class="cf-widget__result-card">' +
            '<div class="cf-widget__result-name">' + (c.имя || 'Персонаж') + '</div>' +
            '<span class="cf-widget__result-role">' + roleRu(c.роль) + '</span>' +
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
            if (pubs.length) stepIndex = 4; // 4 = все шаги пройдены, включая «Опубликовано»

            if (items.length) {
                resultEl.innerHTML = renderCard(items[0]) + renderSteps(stepIndex);
            } else {
                resultEl.innerHTML = renderSteps(stepIndex);
            }

            if (stepIndex >= 4) {
                clearInterval(timer);
                const platforms = pubs.map(function (p) { return p.platform; });
                statusEl.textContent = 'Готово — опубликовано: ' + (platforms.length ? platforms.join(', ') : 'готово');
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
        const motivation = motivationEl ? motivationEl.value.trim() : '';
        const extra = extraEl ? extraEl.value.trim() : '';
        const payload = { name: name, bio: bio };
        if (motivation) payload.motivation = motivation;
        if (extra) payload.extra = extra;
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
                    payload: payload
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

/* ============ Виджет: Автоконтент под ключ (CrewAI демо) ============ */
(function () {
    const form = document.getElementById('ac-form');
    if (!form) return;
    const topicInput = document.getElementById('ac-topic');
    const statusEl = document.getElementById('ac-status');
    const resultEl = document.getElementById('ac-result');
    const WEBHOOK = 'https://n8n.eduardwit.ru/webhook/auto-content-demo';

    // Мини-Markdown рендер + чистка эмодзи: ответ конвейера (md-текст) показываем
    // оформленными блоками, а не «сырым» текстом с разметкой.
    function escapeHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function stripEmoji(s) {
        return s
            .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu, '')
            .replace(/\s{2,}/g, ' ');
    }

    function renderMarkdown(text) {
        const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
        let html = '';
        let list = null;

        const closeList = () => {
            if (list) { html += '</' + list + '>'; list = null; }
        };

        const inline = (s) => {
            s = escapeHtml(s);
            s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
            return s;
        };

        lines.forEach(line => {
            const t = stripEmoji(line.trim());
            if (!t) { closeList(); return; }

            const h = t.match(/^(#{1,4})\s+(.*)$/);
            if (h) {
                closeList();
                const lvl = Math.min(h[1].length + 1, 6);
                html += '<h' + lvl + '>' + inline(h[2].replace(/^#+\s*/, '')) + '</h' + lvl + '>';
                return;
            }

            if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(t)) { closeList(); html += '<hr>'; return; }

            const uDash = t.match(/^[-*+]\s+(.*)$/);
            if (uDash) {
                if (list !== 'ul') { closeList(); list = 'ul'; html += '<ul>'; }
                html += '<li>' + inline(uDash[1]) + '</li>';
                return;
            }

            const uNum = t.match(/^\d+[.)]\s+(.*)$/);
            if (uNum) {
                if (list !== 'ol') { closeList(); list = 'ol'; html += '<ol>'; }
                html += '<li>' + inline(uNum[1]) + '</li>';
                return;
            }

            closeList();
            html += '<p>' + inline(t) + '</p>';
        });
        closeList();
        return html;
    }

    // Шаги конвейера — показываем по таймеру, пока n8n гонит CrewAI (2–4 минуты).
    const STEPS = [
        'Разведчик трендов анализирует нишу',
        'Автор пишет черновик',
        'Фактчекер проверяет утверждения',
        'SEO-специалист готовит упаковку',
        'Сборка итогового контент-пакета'
    ];

    function renderSteps(stepIndex) {
        const html = STEPS.map(function (s, i) {
            const done = i < stepIndex ? 'done' : '';
            const mark = i < stepIndex ? '&#10003;' : '';
            return '<div class="cf-widget__step ' + done + '"><span class="mark">' + mark + '</span>' + s + '</div>';
        }).join('');
        return '<div class="cf-widget__result-steps">' + html + '</div>';
    }

    let stepTimer = null;

    function cleanup() {
        clearTimeout(stepTimer);
    }

    function runSteps() {
        let i = 0;
        resultEl.innerHTML = renderSteps(0);
        stepTimer = setInterval(function () {
            i += 1;
            resultEl.innerHTML = renderSteps(i);
            if (i >= STEPS.length) clearInterval(stepTimer);
        }, 45000);
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const topic = (topicInput.value || '').trim();
        if (!topic) return;
        statusEl.textContent = 'Команда агентов работает…';
        resultEl.innerHTML = '';
        cleanup();
        runSteps();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Генерация…';
        try {
            const res = await fetch(WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topic,
                    source: 'eduardwit.ru',
                    type: 'auto_content_demo',
                    timestamp: new Date().toISOString()
                })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json().catch(() => null);
            const text = (data && (data.result || data.output || data.text)) || 'Контент-пакет сформирован.';
            cleanup();
            resultEl.innerHTML = '<div class="cf-widget__result-card"><div class="cf-widget__result-name">Контент-пакет готов</div>' +
                '<div class="ac-widget__result-text">' + renderMarkdown(text) + '</div></div>';
            statusEl.textContent = 'Готово — контент-пакет сформирован за 2–4 минуты.';
        } catch (err) {
            cleanup();
            statusEl.innerHTML = 'Не удалось отправить запрос. Напишите тему напрямую ' +
                '<a href="https://t.me/EduardWIT_assistent_bot" target="_blank" rel="noopener" style="color:#000;font-weight:700;">Telegram-боту</a>.';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Сгенерировать';
        }
    });
})();