import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

<<<<<<< HEAD
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
=======
const appName = 'PCU Lab System';
>>>>>>> 5b4bb045099bdd4aeb3c8a6bac36387521efdb63
const isDev = import.meta.env.DEV;
const lazyPages = import.meta.glob('./Pages/**/*.jsx');
const eagerPages = isDev ? import.meta.glob('./Pages/**/*.jsx', { eager: true }) : null;

createInertiaApp({
<<<<<<< HEAD
    title: (title) => `${title} - ${appName}`,
=======
    title: (title) => (title ? `${title} - ${appName}` : appName),
>>>>>>> 5b4bb045099bdd4aeb3c8a6bac36387521efdb63
    resolve: (name) => {
        const pagePath = `./Pages/${name}.jsx`;

        // In development (HMR), eager page loading avoids first-click compile lag.
        if (isDev && eagerPages?.[pagePath]) {
            return Promise.resolve(eagerPages[pagePath]);
        }

        return resolvePageComponent(pagePath, lazyPages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4663ac',
        showSpinner: false,
    },
});
