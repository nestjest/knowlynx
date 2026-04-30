import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsParser from '@typescript-eslint/parser';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'better-tailwindcss': betterTailwindcss,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      'better-tailwindcss/enforce-shorthand-classes': 'warn',
      'better-tailwindcss/no-duplicate-classes': 'warn',
      'better-tailwindcss/no-conflicting-classes': 'warn',
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: path.resolve(__dirname, 'src/app/styles/tailwind.css'),
      },
    },
  },
];
