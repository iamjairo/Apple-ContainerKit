import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter(),
        alias: {
            '$/*': './path/to/lib/*'
        },
        prerender: {
            handleUnseenRoutes: ({ routes }) => {
                console.warn(`Route not found during prerendering: ${routes.join(',')}`);
                return;
            }
        }
    },
    compilerOptions: {
        experimental: {
            async: true
        }
    }
};

export default config;
