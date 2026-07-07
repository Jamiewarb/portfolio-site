export const ROUTES = {
  home: '/',
  me: '/me/',
  userManual: '/me/user-manual/',
  writing: '/writing/',
  topics: '/topics/',
  topic: (slug: string) => `/topics/${slug}/`,
  writingPost: (slug: string) => `/writing/${slug}/`,
  notes: '/notes/',
  notesPost: (slug: string) => `/notes/${slug}/`,
  projects: '/projects/',
  endorsements: '/me/endorsements/',
  rss: '/rss.xml',

  mainContent: 'main-content',

  external: {
    newsletter: 'https://jamiewarb.substack.com/',
    github: 'https://github.com/jamiewarb',
    linkedin: 'https://linkedin.com/in/jamiewarb',
  },
} as const;
