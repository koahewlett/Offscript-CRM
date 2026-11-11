import type { Config } from "tailwindcss";
export default {
 content: ["./src/**/*.{js,ts,jsx,tsx}"],
 theme: {extend: { colors: { background: "#0d0e10", panel:"#17191d", line:"#2d3036", muted:"#a7a9b1", accent:"#e4e5e8"}}},
 plugins:[]
} satisfies Config;
