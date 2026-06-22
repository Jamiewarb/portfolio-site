// @ts-check

import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import { remarkReadingTime } from './remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://jamiewarburton.dev',
  output: 'static',
  adapter: netlify(),

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
  integrations: [mdx(), sitemap(), react()],

  markdown: {
    processor: unified({
      remarkPlugins: [remarkReadingTime],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
