import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sage:  '#71A88A',
        'sage-dim': 'rgba(113,168,138,0.15)',
        blue:  '#7E9ECC',
        clay:  '#CB8D82',
        gold:  '#D4A843',
        'conn-yellow': '#D4A843',
        'conn-green':  '#6AAA64',
        'conn-blue':   '#5B90BF',
        'conn-purple': '#9B59B6',
      },
      fontFamily: {
        display: ['Impact', 'Arial Narrow', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
