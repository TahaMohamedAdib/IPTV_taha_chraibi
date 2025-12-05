const initNavigationIndicator = () => {
    const navList = document.getElementById('primary-menu');
    if (!navList) return;

    const navLinks = Array.from(navList.querySelectorAll('li:not(.nav-cta) > a'));
    if (!navLinks.length) return;

    const indicator = document.createElement('span');
    indicator.className = 'nav-link-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    navList.appendChild(indicator);

    const normalizePath = (path) => {
        if (!path) return '/';
        let normalized = path.toLowerCase();
        if (normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1) || '/';
        }
        return normalized;
    };

    const resolveLinkPath = (link) => normalizePath(new URL(link.href, window.location.origin).pathname);
    const currentPath = normalizePath(window.location.pathname);

    const getMatchingLink = () => {
        let match = navLinks.find(link => resolveLinkPath(link) === currentPath);

        if (!match && currentPath === '/') {
            match = navLinks.find(link => /index\.html$/i.test(link.getAttribute('href')));
        }

        return match;
    };

    let activeLink = getMatchingLink() || navList.querySelector('a.active') || navLinks[0];

    const setIndicatorPosition = (target, instant = false) => {
        if (!target || window.innerWidth <= 900) {
            indicator.style.opacity = 0;
            return;
        }

        const targetRect = target.getBoundingClientRect();
        const listRect = navList.getBoundingClientRect();

        if (instant) {
            indicator.classList.add('no-transition');
        }

        indicator.style.opacity = 1;
        indicator.style.width = `${targetRect.width}px`;
        indicator.style.height = `${targetRect.height}px`;
        indicator.style.transform = `translate3d(${targetRect.left - listRect.left}px, ${targetRect.top - listRect.top}px, 0)`;

        if (instant) {
            requestAnimationFrame(() => indicator.classList.remove('no-transition'));
        }
    };

    const updateActiveLink = (target, instant = false) => {
        if (!target) return;
        navLinks.forEach(link => link.classList.remove('active'));
        target.classList.add('active');
        activeLink = target;
        setIndicatorPosition(target, instant);
    };

    updateActiveLink(activeLink, true);

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => setIndicatorPosition(link));
        link.addEventListener('focus', () => setIndicatorPosition(link));
        link.addEventListener('click', () => updateActiveLink(link));
    });

    navList.addEventListener('mouseleave', () => setIndicatorPosition(activeLink));
    window.addEventListener('resize', () => setIndicatorPosition(activeLink, true));

    const mq = window.matchMedia('(max-width: 900px)');
    const mqListener = (event) => {
        if (event.matches) {
            indicator.style.opacity = 0;
        } else {
            updateActiveLink(activeLink, true);
        }
    };

    if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', mqListener);
    } else if (typeof mq.addListener === 'function') {
        mq.addListener(mqListener);
    }

    window.addEventListener('pageshow', () => updateActiveLink(getMatchingLink() || activeLink, true));
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigationIndicator);
} else {
    initNavigationIndicator();
}

