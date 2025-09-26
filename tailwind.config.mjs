/** @type {import('tailwindcss').Config} */

import colors from 'tailwindcss/colors'
import tailwindcssContainerQueries from '@tailwindcss/container-queries'
import tailwindcssForms from '@tailwindcss/forms'
import tailwindcssTypography from '@tailwindcss/typography'
import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.5rem' }],
      base: ['1rem', { lineHeight: '1.75rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '2rem' }],
      '2xl': ['1.5rem', { lineHeight: '2.25rem' }],
      '3xl': ['1.75rem', { lineHeight: '2.25rem' }],
      '4xl': ['2rem', { lineHeight: '2.5rem' }],
      '5xl': ['2.5rem', { lineHeight: '3rem' }],
      '6xl': ['3rem', { lineHeight: '3.5rem' }],
      '7xl': ['4rem', { lineHeight: '4.5rem' }],
    },
    extend: {
      screens: {
        '3xl': '1920px',
        '3xlplus': '1921px',
        hovers: { raw: '(hover: hover)' },
        hoversnot: { raw: '(hover: none)' },
      },
      colors: {
        ...colors,
        brandblue: {
          50: '#f5f7fa',
          100: '#e9eef5',
          200: '#cfdbe8',
          300: '#a4bdd5',
          400: '#7399bd',
          500: '#527da5',
          600: '#3f638a',
          700: '#345170',
          800: '#2e455e',
          900: '#2a3b4f',
          950: '#1c2735',
        },
        brandred: {
          50: '#fef2f2',
          100: '#fde6e6',
          200: '#fbd0d2',
          300: '#f8a9ae',
          400: '#f37983',
          500: '#e94557',
          600: '#d62843',
          700: '#b41c38',
          800: '#971a35',
          900: '#811a34',
          950: '#480917',
        },
        error: colors.red[600],
        'error-icon': colors.red[400],
      },
      listStyleImage: {
        checkmark: `url('data:image/svg+xml,%3Csvg xmlns="http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cpath fill="currentColor" d="M4.53 12.97a.75.75 0 0 0-1.06 1.06l4.5 4.5a.75.75 0 0 0 1.06 0l11-11a.75.75 0 0 0-1.06-1.06L8.5 16.94l-3.97-3.97Z"%2F%3E%3C%2Fsvg%3E')`,
      },
      borderRadius: {
        '4xl': '2.5rem',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        header: 'var(--header-height)',
        '-header': 'calc(var(--header-height) * -1)',
      },
      fontFamily: {
        hero: ['verveine', ...defaultTheme.fontFamily.sans],
        // sans: ["Mona Sans", ...defaultTheme.fontFamily.sans],
        // display: [
        //   ["Mona Sans", ...defaultTheme.fontFamily.sans],
        //   { fontVariationSettings: '"wdth" 125' },
        // ],
      },
      aspectRatio: {
        '1/1': '1/1',
        '16/9': '16/9',
        '4/3': '4/3',
        '3/2': '3/2',
      },
      zIndex: {
        header: 1000,
        overlays: 2000,
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            a: {
              fontWeight: 'normal',
            },
          },
        },
        warning: {
          css: {
            a: {
              '&:hover': {
                color: theme('colors.yellow[600]'),
              },
            },
            '--tw-prose-body': theme('colors.yellow[700]'),
            '--tw-prose-headings': theme('colors.yellow[800]'),
            '--tw-prose-lead': theme('colors.yellow[700]'),
            '--tw-prose-links': theme('colors.yellow[700]'),
            '--tw-prose-bold': theme('colors.yellow[700]'),
            '--tw-prose-counters': theme('colors.yellow[600]'),
            '--tw-prose-bullets': theme('colors.yellow[400]'),
            '--tw-prose-hr': theme('colors.yellow[300]'),
            '--tw-prose-quotes': theme('colors.yellow[900]'),
            '--tw-prose-quote-borders': theme('colors.yellow[300]'),
            '--tw-prose-captions': theme('colors.yellow[700]'),
            '--tw-prose-code': theme('colors.yellow[900]'),
            '--tw-prose-pre-code': theme('colors.yellow[100]'),
            '--tw-prose-pre-bg': theme('colors.yellow[900]'),
            '--tw-prose-th-borders': theme('colors.yellow[300]'),
            '--tw-prose-td-borders': theme('colors.yellow[200]'),
            '--tw-prose-invert-body': theme('colors.yellow[200]'),
            '--tw-prose-invert-headings': theme('colors.white'),
            '--tw-prose-invert-lead': theme('colors.yellow[300]'),
            '--tw-prose-invert-links': theme('colors.white'),
            '--tw-prose-invert-bold': theme('colors.white'),
            '--tw-prose-invert-counters': theme('colors.yellow[400]'),
            '--tw-prose-invert-bullets': theme('colors.yellow[600]'),
            '--tw-prose-invert-hr': theme('colors.yellow[700]'),
            '--tw-prose-invert-quotes': theme('colors.yellow[100]'),
            '--tw-prose-invert-quote-borders': theme('colors.yellow[700]'),
            '--tw-prose-invert-captions': theme('colors.yellow[400]'),
            '--tw-prose-invert-code': theme('colors.white'),
            '--tw-prose-invert-pre-code': theme('colors.yellow[300]'),
            '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
            '--tw-prose-invert-th-borders': theme('colors.yellow[600]'),
            '--tw-prose-invert-td-borders': theme('colors.yellow[700]'),
          },
        },
      }),
    },
  },
  plugins: [
    tailwindcssContainerQueries,
    tailwindcssForms,
    tailwindcssTypography,
    plugin(function ({ theme, addUtilities, addComponents, matchUtilities }) {
      addComponents({
        '.grid-stacked': {
          'grid-area': '1 / 1 / 2 / 2',
        },
        '.stack': {
          display: 'grid',
        },
        '.stack > *': {
          'grid-area': '1/1',
          width: '100%',
        },
        'ul.list-icon': {
          listStyle: 'none',
          paddingLeft: '0',
        },
        'ul.list-icon li': {
          position: 'relative',
          paddingLeft: '1.5em',
          marginBottom: '0.5em',
        },
        'ul.list-icon li::before': {
          content: "''",
          position: 'absolute',
          left: '0',
          top: '0.35em',
          width: '1em',
          height: '1em',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        },
        'ul.list-icon-checkmark li::before': {
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cpath fill="currentColor" d="M4.53 12.97a.75.75 0 0 0-1.06 1.06l4.5 4.5a.75.75 0 0 0 1.06 0l11-11a.75.75 0 0 0-1.06-1.06L8.5 16.94l-3.97-3.97Z"%2F%3E%3C%2Fsvg%3E')`,
        },
        'ul.list-test li': {
          color: 'red',
        },
        'ul.list-test li::marker': {
          content: `url('data:image/svg+xml,%3Csvg xmlns="http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" width="1em" height="1em" viewBox="0 0 16 16"%3E%3Cpath fill="currentColor" d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2Zm0 1a5 5 0 1 0 0 10A5 5 0 0 0 8 3Zm-.75 6.042l2.87-2.878a.5.5 0 0 1 .766.637l-.058.07l-3.224 3.232a.5.5 0 0 1-.638.059l-.07-.058l-1.75-1.75a.5.5 0 0 1 .638-.765l.07.057L7.25 9.042l2.87-2.878l-2.87 2.878Z"%2F%3E%3C%2Fsvg%3E')`,
        },
      })
    }),
  ],
}
