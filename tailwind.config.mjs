/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            screens: {
                dpr: { 'raw': '(min-resolution: 192dpi)' },
                hsm: { 'raw': '(min-height: 640px)' },
                hmd: { 'raw': '(min-height: 768px)' },
                hlg: { 'raw': '(min-height: 1024px)' }
            },
            colors: {
                'lilac': {
                    '100': '#f0ebf8',
                    '200': '#e3ddeb',
                    '300': '#A790E7',
                    '400': '#8568D5',
                    '500': '#6848C1',
                    '600': '#4D2BAC',
                    '700': '#392377',
                    '800': '#2e1e58',
                    '900': '#251b42',
                    '950': '#1c1630',
                },
                'whitesmoke': '#F5F5F5',
            },
        },
    },
    plugins: [],
    darkMode: 'class',
}
