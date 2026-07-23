// 📊 Аналитика целей для Яндекс.Метрики
(function () {
    const COUNTER_ID = 109690102;

    // Ждём загрузку DOM
    document.addEventListener('DOMContentLoaded', function () {
        // 1. Отслеживаем клик по демо-боту (работает на всех страницах, где есть ссылки)
        const demoLinks = document.querySelectorAll('a[href*="t.me/EduardWIT_assistent_bot"]');
        demoLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (typeof ym !== 'undefined') {
                    ym(COUNTER_ID, 'reachGoal', 'demo_bot_click');
                    console.log('📊 Metrika: demo_bot_click');
                }
            });
        });

        // 2. Отслеживаем просмотр кейса (срабатывает только на /case/* страницах)
        if (window.location.pathname.includes('/case/')) {
            const caseName = window.location.pathname.split('/').pop().replace('.html', '');
            if (typeof ym !== 'undefined') {
                ym(COUNTER_ID, 'reachGoal', 'case_view', { case: caseName });
                console.log('📊 Metrika: case_view →', caseName);
            }
        }
    });
})();