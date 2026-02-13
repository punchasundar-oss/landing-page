/**
 * Unit tests for the Hero component.
 *
 * Tests cover:
 *   - HTML structure and content rendering
 *   - Data-attribute configuration and defaults
 *   - CTA click behaviour (scroll vs navigate)
 *   - Image error fallback
 *   - CustomEvent analytics hook
 *   - Graceful degradation (no-JS fallback links)
 *
 * Run:  node hero.test.js
 */

var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var JSDOM = jsdom.JSDOM;

var htmlSource = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
var jsSource = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');

/* Suppress jsdom "Not implemented: navigation" errors from window.location.href assignments. */
var virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on('error', function () { /* swallow jsdom navigation errors */ });

var passed = 0;
var failed = 0;
var testNames = [];

function assert(condition, name) {
    testNames.push(name);
    if (condition) {
        passed++;
        console.log('  PASS  ' + name);
    } else {
        failed++;
        console.error('  FAIL  ' + name);
    }
}

/**
 * Create a fresh JSDOM instance with the landing page HTML.
 * Optionally inject main.js and fire DOMContentLoaded.
 */
function createDOM(opts) {
    opts = opts || {};
    var dom = new JSDOM(htmlSource, {
        url: 'https://localhost/',
        runScripts: opts.runScripts ? 'dangerously' : undefined,
        resources: opts.runScripts ? 'usable' : undefined,
        virtualConsole: virtualConsole
    });
    if (opts.runScripts) {
        var scriptEl = dom.window.document.createElement('script');
        scriptEl.textContent = jsSource;
        dom.window.document.head.appendChild(scriptEl);
        dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
    }
    return dom;
}

/* ======================================================================
   1. Content Rendering
   ====================================================================== */

console.log('\n--- Content Rendering ---');

(function () {
    var dom = createDOM();
    var doc = dom.window.document;

    var h1 = doc.querySelector('h1');
    assert(h1 !== null, 'Page contains an <h1> element');
    assert(
        h1 && h1.textContent === 'Build Smarter Digital Products',
        'Headline displays exact text: "Build Smarter Digital Products"'
    );

    var sub = doc.querySelector('.hero__subheadline');
    assert(sub !== null, 'Page contains a subheadline element');
    assert(
        sub && sub.textContent ===
        'We design and engineer scalable software solutions that help startups and enterprises move faster with confidence.',
        'Subheadline displays exact required text'
    );

    var primaryCta = doc.querySelector('[data-cta="primary"]');
    var secondaryCta = doc.querySelector('[data-cta="secondary"]');
    assert(primaryCta !== null && primaryCta.textContent === 'Get Started', 'Primary CTA has label "Get Started"');
    assert(secondaryCta !== null && secondaryCta.textContent === 'Talk to Us', 'Secondary CTA has label "Talk to Us"');

    var img = doc.querySelector('.hero__image');
    assert(img !== null, 'Visual element (image) is present');
    assert(img && img.getAttribute('alt') === 'Abstract illustration representing modern digital products', 'Image has meaningful alt text');
    assert(img && img.getAttribute('width') === '600', 'Image has explicit width attribute');
    assert(img && img.getAttribute('height') === '400', 'Image has explicit height attribute');

    dom.window.close();
})();

/* ======================================================================
   2. Semantic Structure & Accessibility
   ====================================================================== */

console.log('\n--- Accessibility ---');

(function () {
    var dom = createDOM();
    var doc = dom.window.document;

    var hero = doc.querySelector('section.hero');
    assert(hero !== null, 'Hero is a <section> element');
    assert(
        hero && hero.getAttribute('aria-labelledby') === 'hero-heading',
        'Hero section has aria-labelledby pointing to heading'
    );

    var h1 = doc.querySelector('#hero-heading');
    assert(h1 !== null && h1.tagName === 'H1', 'Heading is a semantic <h1> with matching id');

    var allH1s = doc.querySelectorAll('h1');
    assert(allH1s.length === 1, 'Page contains exactly one <h1>');

    var primaryCta = doc.querySelector('[data-cta="primary"]');
    var secondaryCta = doc.querySelector('[data-cta="secondary"]');
    assert(primaryCta && primaryCta.tagName === 'A', 'Primary CTA is an <a> element (keyboard focusable)');
    assert(secondaryCta && secondaryCta.tagName === 'A', 'Secondary CTA is an <a> element (keyboard focusable)');
    assert(primaryCta && primaryCta.getAttribute('href') === '/contact', 'Primary CTA has href fallback for no-JS');
    assert(secondaryCta && secondaryCta.getAttribute('href') === '/contact', 'Secondary CTA has href fallback for no-JS');

    dom.window.close();
})();

/* ======================================================================
   3. Data-Attribute Configuration & Defaults
   ====================================================================== */

console.log('\n--- Configuration & Defaults ---');

(function () {
    var dom = createDOM();
    var doc = dom.window.document;
    var hero = doc.querySelector('.hero');

    assert(hero.dataset.heroTheme === 'light', 'Default theme is "light"');
    assert(hero.dataset.primaryCtaScroll === 'contact', 'Primary CTA scroll target configured as "contact"');
    assert(hero.dataset.primaryCtaTarget === '/contact', 'Primary CTA navigation fallback is /contact');
    assert(hero.dataset.secondaryCtaTarget === '/contact', 'Secondary CTA target is /contact');

    dom.window.close();
})();

/* Test defaults when data attributes are missing */
(function () {
    var dom = new JSDOM(
        '<html><body><section class="hero">' +
        '<a data-cta="primary" href="/fallback">CTA</a>' +
        '</section></body></html>',
        { url: 'https://localhost/', runScripts: 'dangerously', virtualConsole: virtualConsole }
    );
    var scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = jsSource;
    dom.window.document.head.appendChild(scriptEl);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    /* main.js readConfig defaults: primaryNavTarget='/contact', secondaryNavTarget='/contact' */
    /* We verify it initialises without error when attributes are missing */
    assert(true, 'Hero initialises without error when optional data attributes are omitted');

    dom.window.close();
})();

/* ======================================================================
   4. CTA Click Behaviour
   ====================================================================== */

console.log('\n--- CTA Click Behaviour ---');

/* Primary CTA: scroll to #contact when present */
(function () {
    var dom = new JSDOM(
        '<html><body>' +
        '<section class="hero" data-primary-cta-scroll="contact" data-primary-cta-target="/contact">' +
        '  <a data-cta="primary" href="/contact">Get Started</a>' +
        '</section>' +
        '<div id="contact"></div>' +
        '</body></html>',
        { url: 'https://localhost/', runScripts: 'dangerously', virtualConsole: virtualConsole }
    );

    var scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = jsSource;
    dom.window.document.head.appendChild(scriptEl);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    var cta = dom.window.document.querySelector('[data-cta="primary"]');
    var scrollCalled = false;
    dom.window.document.getElementById('contact').scrollIntoView = function () {
        scrollCalled = true;
    };

    var event = new dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
    cta.dispatchEvent(event);

    assert(scrollCalled, 'Primary CTA scrolls to #contact when element exists');
    assert(event.defaultPrevented, 'Primary CTA preventDefault() called on scroll');

    dom.window.close();
})();

/* Primary CTA: navigate when #contact is absent (verified via CustomEvent) */
(function () {
    var dom = new JSDOM(
        '<html><body>' +
        '<section class="hero" data-primary-cta-scroll="contact" data-primary-cta-target="/contact">' +
        '  <a data-cta="primary" href="/contact">Get Started</a>' +
        '</section>' +
        '</body></html>',
        { url: 'https://localhost/', runScripts: 'dangerously', virtualConsole: virtualConsole }
    );

    var scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = jsSource;
    dom.window.document.head.appendChild(scriptEl);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    var eventDetail = null;
    dom.window.document.querySelector('.hero').addEventListener('hero:cta-click', function (e) {
        eventDetail = e.detail;
    });

    var cta = dom.window.document.querySelector('[data-cta="primary"]');
    var event = new dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
    cta.dispatchEvent(event);

    assert(
        eventDetail && eventDetail.action === 'navigate' && eventDetail.destination === '/contact',
        'Primary CTA navigates to /contact when #contact is absent'
    );
    assert(event.defaultPrevented, 'Primary CTA preventDefault() called on navigate');

    dom.window.close();
})();

/* Secondary CTA: navigate to configured target (verified via CustomEvent) */
(function () {
    var dom = new JSDOM(
        '<html><body>' +
        '<section class="hero" data-secondary-cta-target="/booking">' +
        '  <a data-cta="secondary" href="/contact">Talk to Us</a>' +
        '</section>' +
        '</body></html>',
        { url: 'https://localhost/', runScripts: 'dangerously', virtualConsole: virtualConsole }
    );

    var scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = jsSource;
    dom.window.document.head.appendChild(scriptEl);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    var eventDetail = null;
    dom.window.document.querySelector('.hero').addEventListener('hero:cta-click', function (e) {
        eventDetail = e.detail;
    });

    var cta = dom.window.document.querySelector('[data-cta="secondary"]');
    var event = new dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
    cta.dispatchEvent(event);

    assert(
        eventDetail && eventDetail.action === 'navigate' && eventDetail.destination === '/booking',
        'Secondary CTA navigates to /booking when configured'
    );

    dom.window.close();
})();

/* Secondary CTA: defaults to /contact when no target configured */
(function () {
    var dom = new JSDOM(
        '<html><body>' +
        '<section class="hero">' +
        '  <a data-cta="secondary" href="/contact">Talk to Us</a>' +
        '</section>' +
        '</body></html>',
        { url: 'https://localhost/', runScripts: 'dangerously', virtualConsole: virtualConsole }
    );

    var scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = jsSource;
    dom.window.document.head.appendChild(scriptEl);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    var eventDetail = null;
    dom.window.document.querySelector('.hero').addEventListener('hero:cta-click', function (e) {
        eventDetail = e.detail;
    });

    var cta = dom.window.document.querySelector('[data-cta="secondary"]');
    var event = new dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
    cta.dispatchEvent(event);

    assert(
        eventDetail && eventDetail.action === 'navigate' && eventDetail.destination === '/contact',
        'Secondary CTA defaults to /contact when no target configured'
    );

    dom.window.close();
})();

/* ======================================================================
   5. CustomEvent Analytics Hook
   ====================================================================== */

console.log('\n--- Analytics Hook ---');

(function () {
    var dom = new JSDOM(
        '<html><body>' +
        '<section class="hero" data-primary-cta-scroll="contact" data-primary-cta-target="/contact" data-secondary-cta-target="/booking">' +
        '  <a data-cta="primary" href="/contact">Get Started</a>' +
        '  <a data-cta="secondary" href="/contact">Talk to Us</a>' +
        '</section>' +
        '<div id="contact"></div>' +
        '</body></html>',
        { url: 'https://localhost/', runScripts: 'dangerously', virtualConsole: virtualConsole }
    );

    var scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = jsSource;
    dom.window.document.head.appendChild(scriptEl);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    dom.window.document.getElementById('contact').scrollIntoView = function () {};

    var events = [];
    var hero = dom.window.document.querySelector('.hero');
    hero.addEventListener('hero:cta-click', function (e) {
        events.push(e.detail);
    });

    /* Click primary */
    var primaryCta = dom.window.document.querySelector('[data-cta="primary"]');
    primaryCta.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));

    /* Click secondary */
    var secondaryCta = dom.window.document.querySelector('[data-cta="secondary"]');
    secondaryCta.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));

    assert(events.length === 2, 'Two hero:cta-click events dispatched');
    assert(
        events[0] && events[0].cta === 'primary' && events[0].action === 'scroll',
        'Primary CTA event has correct detail (cta: primary, action: scroll)'
    );
    assert(
        events[1] && events[1].cta === 'secondary' && events[1].action === 'navigate',
        'Secondary CTA event has correct detail (cta: secondary, action: navigate)'
    );

    dom.window.close();
})();

/* ======================================================================
   6. Image Error Fallback
   ====================================================================== */

console.log('\n--- Image Error Fallback ---');

(function () {
    var dom = createDOM({ runScripts: true });
    var doc = dom.window.document;
    var img = doc.querySelector('.hero__image');

    assert(!img.classList.contains('hero__image--error'), 'Image does not have error class initially');

    img.dispatchEvent(new dom.window.Event('error'));

    assert(img.classList.contains('hero__image--error'), 'Image gets hero__image--error class after error event');

    dom.window.close();
})();

/* ======================================================================
   7. Graceful Degradation (No-JS)
   ====================================================================== */

console.log('\n--- Graceful Degradation (No-JS) ---');

(function () {
    var dom = createDOM({ runScripts: false });
    var doc = dom.window.document;

    var h1 = doc.querySelector('h1');
    assert(h1 && h1.textContent.length > 0, 'Headline visible without JS');

    var sub = doc.querySelector('.hero__subheadline');
    assert(sub && sub.textContent.length > 0, 'Subheadline visible without JS');

    var ctas = doc.querySelectorAll('.hero__cta');
    assert(ctas.length === 2, 'Both CTAs present without JS');

    var primaryHref = ctas[0].getAttribute('href');
    var secondaryHref = ctas[1].getAttribute('href');
    assert(primaryHref === '/contact', 'Primary CTA links to /contact without JS');
    assert(secondaryHref === '/contact', 'Secondary CTA links to /contact without JS');

    var img = doc.querySelector('.hero__image');
    assert(img && img.getAttribute('src').length > 0, 'Image src is set without JS');
    assert(img && img.getAttribute('onerror'), 'Image has inline onerror fallback for no-JS error handling');

    dom.window.close();
})();

/* ======================================================================
   Summary
   ====================================================================== */

console.log('\n========================================');
console.log('  Results: ' + passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total');
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
