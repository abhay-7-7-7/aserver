/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          canvas: "#F4EFE6",
          white: "#FFFFFF",
          cream: "#FFFDF9",
          black: "#000000",
          yellow: "#FFE600",
          yellowDark: "#FACC15",
          cyan: "#00E5FF",
          blue: "#2563EB",
          green: "#00FF66",
          greenDark: "#16A34A",
          pink: "#FF3399",
          purple: "#A855F7",
          orange: "#FF6600",
          red: "#FF3333",
          gray: "#E5E5E5",
          muted: "#666666",
        },
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px #000000',
        'brutal': '4px 4px 0px #000000',
        'brutal-md': '6px 6px 0px #000000',
        'brutal-lg': '8px 8px 0px #000000',
        'brutal-xl': '12px 12px 0px #000000',
        'brutal-press': '1px 1px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['"Space Grotesk"', 'Impact', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'wave-slow': 'wave 3s ease-in-out infinite alternate',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        wave: {
          '0%': { transform: 'translateX(-5%) rotate(0deg)' },
          '100%': { transform: 'translateX(5%) rotate(1deg)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
