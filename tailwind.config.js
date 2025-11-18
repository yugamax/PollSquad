/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './Survey/**/*.{js,ts,jsx,tsx}',
    './public/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        'primary/50': '#3b82f650',
        'primary/90': '#3b82f690',
        secondary: '#9333ea',
        'secondary/50': '#9333ea50',
        'secondary/90': '#9333ea90',
        accent: '#f59e0b',
        'accent/50': '#f59e0b50',
        'accent/90': '#f59e0b90',
        danger: '#ef4444',
        'danger/50': '#ef444450',
        'danger/90': '#ef444490',
        success: '#10b981',
        'success/50': '#10b98150',
        'success/90': '#10b98190',
        warning: '#f97316',
        'warning/50': '#f9731650',
        'warning/90': '#f9731690',
        muted: '#374151',
        'muted/50': '#37415150',
        'muted/90': '#37415190',
        foreground: '#111827',
        'foreground/50': '#11182750',
        'foreground/90': '#11182790',
        background: '#ffffff',
        'background/50': '#ffffff50',
        'background/90': '#ffffff90',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      screens: {
        'xs': '475px',
        // ...existing screens...
      },
      // ...existing theme extensions...
    },
  },
  plugins: [],
}