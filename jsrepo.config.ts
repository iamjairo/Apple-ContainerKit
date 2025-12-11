import { defineConfig } from 'jsrepo';

export default defineConfig({
    registries: [],
    paths: {
		lib: './src/lib',
		ui: './src/lib/components/ui',
		hook: './src/lib/hooks'
	},
});