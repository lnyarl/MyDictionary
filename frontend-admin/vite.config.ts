import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const ReactCompilerConfig = {
	target: "19",
	compilationMode: "annotation",
};

export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
				babelrc: false,
				configFile: false,
			},
			include: ["**/*.tsx", "**/*.ts"],
			exclude: [/node_modules/],
		}),
		tailwindcss()
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@shared": path.resolve(__dirname, "../shared/src"),
			react: path.resolve(__dirname, "../node_modules/react"),
			"react-dom": path.resolve(__dirname, "../node_modules/react-dom"),
		},
	},
	server: {
		port: 5174,
		proxy: {
			"/api": {
				target: "http://localhost:3001",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
});
