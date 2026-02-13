# Landing Page Project

## Overview
Static marketing landing page built with vanilla HTML, CSS, and JavaScript (no frameworks).

## Project Structure
- `index.html` — Main landing page with hero section
- `style.css` — Mobile-first responsive styles with light/dark theme via CSS custom properties
- `main.js` — CTA scroll/navigation behaviour via data-attribute configuration

## Conventions
- **CSS naming**: BEM methodology (`hero__content`, `hero__cta--primary`)
- **HTML**: Semantic elements with ARIA where needed; single `<h1>` per page
- **CTAs**: Implemented as `<a>` elements for graceful degradation without JS
- **Accessibility**: WCAG 2.1 AA compliance target; visible focus outlines on all interactive elements
- **Performance**: Explicit image dimensions to prevent CLS; no blocking third-party scripts

## Git
- **Main branch**: `main`
- **Feature branch**: `feature/2-landing-page`
- Commit messages: imperative mood, descriptive summary + body

## Key Decisions
- Vanilla HTML/CSS/JS stack (no build tools or frameworks)
- Mobile-first responsive approach
- Data attributes for component configuration (reusability without JS frameworks)
- `/contact` as universal safe fallback for all CTA hrefs
