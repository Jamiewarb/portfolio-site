// @ts-check

import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import { remarkExternalLinks } from './remark-external-links.mjs';
import { remarkReadingTime } from './remark-reading-time.mjs';

const site = 'https://jamiewarburton.dev';

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  adapter: netlify(),

  redirects: {
    '/endorsements': '/me/endorsements',
    '/writing/how-i-built-the-theme-toggle-page-transition':
      '/writing/building-a-cool-circular-reveal-for-light-dark-mode',
  },

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
      remarkPlugins: [remarkReadingTime, [remarkExternalLinks, { site }]],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
