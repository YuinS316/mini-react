import { defineConfig } from "vite";
import path from "node:path";

function _resolve(dir: string) {
	return path.resolve(__dirname, dir);
}

export default defineConfig({
	test: {},
	esbuild: {
		jsxInject: `import React from '@mini-react/react'`
	},
	server: {
		port: 8000
	},
	resolve: {
		alias: {
			"@": _resolve("src"),
			hostConfig: _resolve("../react-dom/src/hostConfig.ts"),
			"react-dom": _resolve("../react-dom")
		}
	}
});
