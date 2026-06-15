// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://jamiewarburton.dev',

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Rammetto One',
      cssVariable: '--font-rammetto-one',
      fallbacks: ['sans-serif'],
    },
  ],
  integrations: [mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});