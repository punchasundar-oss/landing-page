/**
 * Hero Component — CTA behaviour and scroll/navigation logic.
 *
 * Reads configuration from data attributes on each .hero element and
 * enhances the CTA links with smooth-scroll or navigation behaviour.
 * Falls back gracefully: if JS fails the <a> hrefs still work.
 *
 * Supported data attributes on the hero root:
 *   data-primary-cta-scroll    ID of an on-page element to scroll to
 *   data-primary-cta-target    Fallback URL when scroll target is missing
 *   data-secondary-cta-target  URL for the secondary CTA
 *
 * Dispatches a "hero:cta-click" CustomEvent on the hero element for each
 * CTA activation, allowing external code (analytics, modals) to hook in
 * without modifying this file.
 */
(function () {
    'use strict';

    /**
     * Read hero configuration from data attributes.
     * @param {HTMLElement} heroEl - The .hero root element.
     * @returns {Object} Configuration object with resolved values.
     */
    function readConfig(heroEl) {
        return {
            primaryScrollTarget: heroEl.dataset.primaryCtaScroll || null,
            primaryNavTarget: heroEl.dataset.primaryCtaTarget || '/contact',
            secondaryNavTarget: heroEl.dataset.secondaryCtaTarget || '/contact'
        };
    }

    /**
     * Dispatch a custom event on the hero element for external listeners.
     * @param {HTMLElement} heroEl - The .hero root element.
     * @param {string} ctaType - "primary" or "secondary".
     * @param {string} action - "scroll" or "navigate".
     * @param {string} destination - The scroll target ID or URL.
     */
    function emitCtaEvent(heroEl, ctaType, action, destination) {
        heroEl.dispatchEvent(new CustomEvent('hero:cta-click', {
            bubbles: true,
            detail: { cta: ctaType, action: action, destination: destination }
        }));
    }

    /**
     * Handle primary CTA click: smooth-scroll to target or navigate.
     * @param {Event} e - The click event.
     * @param {HTMLElement} heroEl - The .hero root element.
     * @param {Object} cfg - Configuration from readConfig().
     */
    function handlePrimaryClick(e, heroEl, cfg) {
        if (cfg.primaryScrollTarget) {
            var target = document.getElementById(cfg.primaryScrollTarget);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                emitCtaEvent(heroEl, 'primary', 'scroll', '#' + cfg.primaryScrollTarget);
                return;
            }
        }

        /* Scroll target not configured or not found — navigate to fallback URL. */
        e.preventDefault();
        emitCtaEvent(heroEl, 'primary', 'navigate', cfg.primaryNavTarget);
        window.location.href = cfg.primaryNavTarget;
    }

    /**
     * Handle secondary CTA click: navigate to configured URL.
     * @param {Event} e - The click event.
     * @param {HTMLElement} heroEl - The .hero root element.
     * @param {Object} cfg - Configuration from readConfig().
     */
    function handleSecondaryClick(e, heroEl, cfg) {
        e.preventDefault();
        emitCtaEvent(heroEl, 'secondary', 'navigate', cfg.secondaryNavTarget);
        window.location.href = cfg.secondaryNavTarget;
    }

    /**
     * Initialise a single hero element: read config, bind CTA handlers.
     * @param {HTMLElement} heroEl - The .hero root element.
     */
    function initHero(heroEl) {
        var cfg = readConfig(heroEl);

        var primaryCta = heroEl.querySelector('[data-cta="primary"]');
        var secondaryCta = heroEl.querySelector('[data-cta="secondary"]');

        if (primaryCta) {
            primaryCta.addEventListener('click', function (e) {
                handlePrimaryClick(e, heroEl, cfg);
            });
        }

        if (secondaryCta) {
            secondaryCta.addEventListener('click', function (e) {
                handleSecondaryClick(e, heroEl, cfg);
            });
        }
    }

    /* --- Bootstrap --- */
    document.addEventListener('DOMContentLoaded', function () {
        var heroes = document.querySelectorAll('.hero');
        for (var i = 0; i < heroes.length; i++) {
            initHero(heroes[i]);
        }
    });
})();
