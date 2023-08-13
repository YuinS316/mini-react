import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
	json: {
		namedExports: true
		// stringify: true
	},
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: [
				// resolve(__dirname, "packages/a/index.ts"),
				// resolve(__dirname, "packages/b/index.ts")
			],
			fileName: (format) => `${format}/[name].js`
		},
		sourcemap: true,
		emptyOutDir: true
	}
});
