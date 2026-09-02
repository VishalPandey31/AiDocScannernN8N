/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter Variable"', ...defaultTheme.fontFamily.sans],
                display: ['"Inter Variable"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                background: 'var(--background)',
                surface: 'var(--surface)',
                'surface-elevated': 'var(--surface-elevated)',
                'surface-muted': 'var(--surface-muted)',

                foreground: 'var(--foreground)',
                'foreground-muted': 'var(--foreground-muted)',
                'foreground-subtle': 'var(--foreground-subtle)',

                border: 'var(--border)',
                'border-light': 'var(--border-light)',

                primary: {
                    DEFAULT: 'var(--primary)',
                    hover: 'var(--primary-hover)',
                    subtle: 'var(--primary-subtle)',
                    foreground: 'var(--primary-foreground)',
                },
                success: {
                    DEFAULT: 'var(--success)',
                    subtle: 'var(--success-subtle)',
                    foreground: 'var(--success-foreground)',
                },
                warning: {
                    DEFAULT: 'var(--warning)',
                    subtle: 'var(--warning-subtle)',
                    foreground: 'var(--warning-foreground)',
                },
                danger: {
                    DEFAULT: 'var(--danger)',
                    subtle: 'var(--danger-subtle)',
                    foreground: 'var(--danger-foreground)',
                },
                info: {
                    DEFAULT: 'var(--info)',
                    subtle: 'var(--info-subtle)',
                    foreground: 'var(--info-foreground)',
                },
            },
            boxShadow: {
                'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
                'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'floating': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scan': 'scan 2s linear infinite',
                'in': 'enter 0.2s ease-out',
                'out': 'exit 0.15s ease-in',
            },
            keyframes: {
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                enter: {
                    '0%': { opacity: '0', transform: 'scale(0.98) translateY(4px)' },
                    '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
                },
                exit: {
                    '0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
                    '100%': { opacity: '0', transform: 'scale(0.98) translateY(4px)' },
                }
            },
            borderRadius: {
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '20px',
                '3xl': '24px',
            }
        },
    },
    plugins: [],
}
