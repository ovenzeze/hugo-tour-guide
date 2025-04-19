/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'

export default {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./assets/**/*.css",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        typography,
    ],
}