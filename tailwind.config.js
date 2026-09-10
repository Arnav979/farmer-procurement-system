/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep field green: the only dark surface in the product.
        brand: {
          50: '#EEF5F0',
          100: '#D7E8DD',
          200: '#AFD1BC',
          300: '#7FB396',
          400: '#4E9573',
          500: '#2E7D53',
          600: '#1F6642',
          700: '#175034',
          800: '#123D28',
          900: '#0D2C1D',
        },
        // Grain amber: attention, in-progress, focus ring.
        grain: {
          50: '#FDF7E8',
          100: '#F8E9C2',
          200: '#EFD48C',
          500: '#B47B10',
          600: '#8E5F07',
          700: '#6B4705',
        },
        // Steel blue: "now serving", informational notices.
        steel: {
          50: '#EDF3FA',
          100: '#D3E3F5',
          500: '#1B5E9E',
          600: '#154B7E',
        },
        danger: {
          50: '#FCEDEC',
          100: '#F7D6D3',
          500: '#B3261E',
          600: '#8F1E17',
        },
        paper: '#F4F6F3',
        line: '#D9DED8',
        ink: '#16241C',
        muted: '#586660',
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        token: ['3.25rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '4px',
        lg: '6px',
      },
      maxWidth: {
        content: '1100px',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.82)' },
        },
      },
      animation: {
        // The only ambient motion in the app: the "now serving" indicator.
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
