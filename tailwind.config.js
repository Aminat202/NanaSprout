/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'nana-green': '#00ff9d',
                'nana-green-dim': '#004d2f',
                'nana-purple': '#bd00ff',
                'nana-purple-dim': '#3a004d',
                'nana-red': '#ff3366',
                'glass-black': 'rgba(10, 10, 15, 0.7)',
                'glass-border': 'rgba(255, 255, 255, 0.1)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
