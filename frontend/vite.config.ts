import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const ReactCompilerConfig = {
	target: "19",
	compilationMode: "annotation",
};

// https://vite.dev/config/
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
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			react: path.resolve(__dirname, "../node_modules/react"),
			"react-dom": path.resolve(__dirname, "../node_modules/react-dom"),
		},
	},
	server: {
		port: 5173,
		proxy: {
			"/api": {
				target: process.env.VITE_API_URL || "http://localhost:3000",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
});
