/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 自定義色彩系統
      colors: {
        'primary': {
          'orange': '#FF6B35',
          'blue': '#4A90E2',
          'green': '#52C41A',
        },
        'accent': {
          'yellow': '#FFD93D',
          'purple': '#6C5CE7',
          'red': '#FF4757',
        },
        'neutral': {
          900: '#1A1A2E',
          700: '#373A47',
          500: '#6B7280',
          300: '#D1D5DB',
          100: '#F3F4F6',
          50: '#FAFBFC',
        }
      },

      // 自定義字體
      fontFamily: {
        'sans': ['Noto Sans TC', 'Microsoft JhengHei', 'sans-serif'],
        'display': ['Bebas Neue', 'Impact', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
      },

      // 自定義間距
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
      },

      // 自定義動畫
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-soft': 'bounce 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
      },

      // 自定義關鍵影格
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },

      // 漸層背景
      backgroundImage: {
        'gradient-sunset': 'linear-gradient(135deg, #FF6B35 0%, #FFD93D 100%)',
        'gradient-sky': 'linear-gradient(135deg, #4A90E2 0%, #52C41A 100%)',
        'gradient-speed': 'linear-gradient(90deg, #6C5CE7 0%, #4A90E2 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, #4A90E2 0%, #1A1A2E 100%)',
      },

      // 陰影效果
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.16)',
        'xl': '0 12px 32px rgba(0, 0, 0, 0.20)',
        'glow-orange': '0 4px 20px rgba(255, 107, 53, 0.4)',
        'glow-blue': '0 4px 20px rgba(74, 144, 226, 0.4)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },

      // 邊框圓角
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },

      // 過渡時間
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },

      // Z-index 層級
      zIndex: {
        '60': 60,
        '70': 70,
        '80': 80,
        '90': 90,
        '100': 100,
      },

      // 網格模板
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(250px, 1fr))',
      },

      // 背景圖片位置
      backgroundPosition: {
        'center-top': 'center top',
        'center-bottom': 'center bottom',
      },

      // 最小/最大尺寸
      minHeight: {
        'screen-1/2': '50vh',
        'screen-3/4': '75vh',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [
    // 自定義工具類
    function({ addUtilities, addComponents, theme }) {
      // 文字漸層
      addUtilities({
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #FF6B35 0%, #FFD93D 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-blue': {
          'background': 'linear-gradient(135deg, #4A90E2 0%, #52C41A 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      });

      // 玻璃擬態效果
      addComponents({
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.3)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
      });

      // 按鈕樣式
      addComponents({
        '.btn-base': {
          'padding': '0.75rem 2rem',
          'border-radius': '0.5rem',
          'font-weight': '600',
          'transition': 'all 0.3s ease',
          'cursor': 'pointer',
          'display': 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'gap': '0.5rem',
          'white-space': 'nowrap',
        },
        '.btn-primary': {
          'background': 'linear-gradient(135deg, #FF6B35 0%, #FFD93D 100%)',
          'color': 'white',
          'box-shadow': '0 4px 12px rgba(255, 107, 53, 0.3)',
          '&:hover': {
            'transform': 'translateY(-2px)',
            'box-shadow': '0 6px 20px rgba(255, 107, 53, 0.4)',
          },
          '&:active': {
            'transform': 'translateY(0)',
          },
        },
        '.btn-secondary': {
          'background': 'white',
          'color': '#4A90E2',
          'border': '2px solid #4A90E2',
          '&:hover': {
            'background': '#4A90E2',
            'color': 'white',
          },
        },
      });

      // 卡片樣式
      addComponents({
        '.card': {
          'background': 'white',
          'border-radius': '12px',
          'padding': '1.5rem',
          'box-shadow': '0 4px 16px rgba(0, 0, 0, 0.08)',
          'transition': 'all 0.3s ease',
          '&:hover': {
            'transform': 'translateY(-4px)',
            'box-shadow': '0 8px 24px rgba(0, 0, 0, 0.12)',
          },
        },
        '.card-border': {
          'background': 'white',
          'border-radius': '12px',
          'padding': '1.5rem',
          'border': '2px solid #E5E7EB',
          'transition': 'all 0.3s ease',
          '&:hover': {
            'border-color': '#4A90E2',
            'box-shadow': '0 4px 16px rgba(74, 144, 226, 0.1)',
          },
        },
      });
    },
  ],
}