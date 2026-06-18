import { AUTHOR_PROFILE_PATH, SITE_AUTHOR, SITE_DESCRIPTION, SITE_TITLE } from '@/config/site';
import { ROUTES } from '@/constants/routes';

export function absoluteUrl(path: string, site: URL | string): string {
  return new URL(path, site).href;
}

export function pageTitle(title: string, siteTitle = SITE_TITLE): string {
  return `${title} | ${siteTitle}`;
}

export function authorPerson(site: URL | string, authorUrl?: string) {
  return {
    '@type': 'Person' as const,
    name: SITE_AUTHOR,
    url: authorUrl ?? absoluteUrl(AUTHOR_PROFILE_PATH, site),
  };
}

export function publisherOrganization(site: URL | string, logoUrl?: string) {
  return {
    '@type': 'Organization' as const,
    name: SITE_TITLE,
    url: absoluteUrl(ROUTES.home, site),
    ...(logoUrl && {
      logo: {
        '@type': 'ImageObject' as const,
        url: logoUrl,
      },
    }),
  };
}

export type BreadcrumbItem = { name: string; path?: string };

/** Google does not require a root/home ListItem — see BreadcrumbList guidelines. */
export function breadcrumbSchema(items: BreadcrumbItem[], site: URL | string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.path && { item: absoluteUrl(item.path, site) }),
    })),
  };
}

export function websiteSchema(site: URL | string, logoUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: absoluteUrl(ROUTES.home, site),
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    publisher: publisherOrganization(site, logoUrl),
  };
}

export function collectionPageSchema(
  site: URL | string,
  title: string,
  description: string,
  path: string = ROUTES.writing,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: absoluteUrl(path, site),
    name: title,
    description,
  };
}

export interface BlogPostingSchemaInput {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  imageUrl?: string;
  url: string;
  site: URL | string;
  authorName?: string;
  authorUrl?: string;
  logoUrl?: string;
}

export function blogPostingSchema(input: BlogPostingSchemaInput) {
  const {
    title,
    description,
    pubDate,
    updatedDate,
    imageUrl,
    url,
    site,
    authorName,
    authorUrl,
    logoUrl,
  } = input;

  const author =
    authorName && authorName !== SITE_AUTHOR
      ? { '@type': 'Person' as const, name: authorName, ...(authorUrl && { url: authorUrl }) }
      : authorPerson(site, authorUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    datePublished: pubDate.toISOString(),
    dateModified: (updatedDate ?? pubDate).toISOString(),
    author,
    publisher: publisherOrganization(site, logoUrl),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(imageUrl && { image: imageUrl }),
  };
}

export type JsonLdSchema = Record<string, unknown> | Record<string, unknown>[];

export function normalizeJsonLd(schemas: JsonLdSchema[]): JsonLdSchema {
  const flat = schemas.flat();
  return flat.length === 1 ? flat[0]! : flat;
}
