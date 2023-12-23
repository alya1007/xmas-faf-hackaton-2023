/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: " #5c5a72",
				secondary: "#474a59",
				tertiary: "#aeaeaf",
				card: "#f5f5f5",
			},
		},
	},
	plugins: [],
};
