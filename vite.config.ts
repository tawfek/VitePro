/// <reference types="vitest" />

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import eslintPlugin from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react'
// @ts-expect-error to use less-vars-to-js function
import lessToJS from 'less-vars-to-js'
import fs from 'node:fs'
import path, { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vitePluginImp from 'vite-plugin-imp'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const pathResolve = (pathString: string): string => resolve(dirname, pathString)

const themeVariables = lessToJS(
	fs.readFileSync(pathResolve('./src/styles/antd_customize.less'), 'utf8')
)
export default defineConfig(({ mode }) => ({
	test: {
		include: ['src/**/__tests__/*'],
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src/setupTests.ts',
		clearMocks: true,
		coverage: {
			enabled: true,
			'100': true,
			reporter: ['text', 'lcov'],
			reportsDirectory: 'coverage/jest'
		}
	},
	resolve: {
		'@': pathResolve('./src'),
		'~': pathResolve('./node_modules'),
		alias: [{ find: /^~/, replacement: '' }]
	},
	plugins: [
		tsconfigPaths(),
		react(),

		...(mode !== 'test'
			? [
					eslintPlugin(),
					VitePWA({
						registerType: 'autoUpdate',
						includeAssets: [
							'favicon.png',
							'robots.txt',
							'apple-touch-icon.png',
							'icons/*.svg',
							'fonts/*.woff2'
						],
						manifest: {
							theme_color: '#BD34FE',
							icons: [
								{
									src: '/android-chrome-192x192.png',
									sizes: '192x192',
									type: 'image/png',
									purpose: 'any maskable'
								},
								{
									src: '/android-chrome-512x512.png',
									sizes: '512x512',
									type: 'image/png'
								}
							]
						}
					})
			  ]
			: []),
		vitePluginImp({
			libList: [
				{
					libName: 'antd',
					style: (name: string): string => {
						if (name === 'col' || name === 'row') {
							return 'antd/lib/style'
						}
						return `antd/es/${name}/style`
					}
				}
			]
		})
	],
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
				modifyVars: themeVariables
			}
		}
	}
}))
