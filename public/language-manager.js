/**
 * Language Manager for First Runner
 * Handles PT/EN switching and persistence across all pages.
 */

const LANG_KEY = 'first_runner_lang';

function initLanguage() {
    const savedLang = localStorage.getItem(LANG_KEY) || 'pt';
    setLanguage(savedLang);
}

function setLanguage(lang) {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    
    // Update active state in switcher UI
    updateSwitcherUI(lang);
    
    // Translate all elements with data-i18n attribute
    translatePage(lang);
}

function translatePage(lang) {
    if (!window.translations || !window.translations[lang]) {
        console.warn(`Translations for language "${lang}" not found.`);
        return;
    }

    const dict = window.translations[lang];
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            // If it's an input/textarea, update the placeholder
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = dict[key];
            } else {
                // Otherwise update innerHTML (to support <br> etc.)
                el.innerHTML = dict[key];
            }
        }
    });

    // Special case for Lucide icons (some text might be inside buttons with icons)
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function updateSwitcherUI(lang) {
    const switcherLabel = document.querySelector('#lang-switcher-label');
    if (switcherLabel) {
        switcherLabel.textContent = lang.toUpperCase();
    }

    // Update active class in dropdown
    const options = document.querySelectorAll('.lang-option');
    options.forEach(opt => {
        const optLang = opt.getAttribute('data-lang');
        if (optLang === lang) {
            opt.classList.add('text-cyan-400', 'bg-white/5');
            opt.classList.remove('text-white/60');
            const subLabel = opt.querySelector('.lang-sublabel');
            if (subLabel) subLabel.classList.remove('opacity-50');
        } else {
            opt.classList.remove('text-cyan-400', 'bg-white/5');
            opt.classList.add('text-white/60');
            const subLabel = opt.querySelector('.lang-sublabel');
            if (subLabel) subLabel.classList.add('opacity-50');
        }
    });
}

// Global function to be called from the UI
window.switchLanguage = function(lang) {
    setLanguage(lang);
};

// Auto-init on DOM content loaded
document.addEventListener('DOMContentLoaded', initLanguage);
