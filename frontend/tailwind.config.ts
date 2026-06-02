import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'system-ui', '-apple-system', 'Segoe UI', 'Roboto',
          'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

export default config