/** @type {import("prettier").Config} */
export default {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'preserve',
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  endOfLine: 'lf',
  singleAttributePerLine: false,

  // Plugins
  plugins: [
    'prettier-plugin-astro',
    'prettier-plugin-tailwindcss',
    'prettier-plugin-organize-imports',
  ],
  tailwindAttributes: ['class', 'className'],
  tailwindFunctions: ['clsx'],
  // Skip destructive code actions like removing unused imports
  // https://www.npmjs.com/package/prettier-plugin-organize-imports#skip-destructive-code-actions
  organizeImportsSkipDestructiveCodeActions: true,

  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
}
