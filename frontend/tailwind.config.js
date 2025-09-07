/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'data-flow': 'data-flow 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          'from': {
            'box-shadow': '0 0 20px rgba(59, 130, 246, 0.5)'
          },
          'to': {
            'box-shadow': '0 0 30px rgba(59, 130, 246, 0.8)'
          }
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-20px)'
          }
        },
        'orbit': {
          '0%': {
            transform: 'rotate(0deg) translateX(100px) rotate(0deg)'
          },
          '100%': {
            transform: 'rotate(360deg) translateX(100px) rotate(-360deg)'
          }
        },
        'data-flow': {
          '0%, 100%': {
            strokeDashoffset: '100'
          },
          '50%': {
            strokeDashoffset: '0'
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};