// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import { remarkReadingTime } from './remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://jamiewarburton.dev',

  prefetch: {
    prefetchAll: true,
  },

  experimental: { clientPrerender: true },

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Rammetto One',
      cssVariable: '--font-rammetto-one',
      fallbacks: ['sans-serif'],
    },
  ],
  integrations: [mdx(), sitemap()],

  markdown: {
    processor: unified({
      remarkPlugins: [remarkReadingTime],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
