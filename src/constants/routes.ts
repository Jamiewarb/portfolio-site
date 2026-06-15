export const ROUTES = {
  home: '/',
  me: '/me/',
  writing: '/writing/',
  writingPost: (slug: string) => `/writing/${slug}/`,
  notes: '/notes/',
  projects: '/projects/',
  rss: '/rss.xml',
  mainContent: '#main-content',
  external: {
    newsletter: 'https://jamiewarb.substack.com/',
    github: 'https://github.com/jamiewarb',
    linkedin: 'https://linkedin.com/in/jamiewarb',
  },
} as const;
