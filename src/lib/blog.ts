import { type CollectionEntry, getCollection, render } from 'astro:content';
import { ROUTES } from '@/constants/routes';

export type BlogPost = CollectionEntry<'blog'>;
export type NotePost = CollectionEntry<'notes'>;
export type ContentPost = BlogPost | NotePost;

export function contentRoute(post: ContentPost): string {
  return post.collection === 'blog'
    ? ROUTES.writingPost(post.id)
    : ROUTES.notesPost(post.id);
}

export type BlogPostWithReadingTime = {
  post: ContentPost;
  minutesRead: string;
};

export function articleDate(post: ContentPost): Date {
  return post.data.updatedAt ?? post.data.publishedAt;
}

export function sortByArticleDate<T extends ContentPost>(
  posts: T[],
  order: 'desc' | 'asc' = 'desc',
): T[] {
  return [...posts].sort((a, b) => {
    const diff = articleDate(b).valueOf() - articleDate(a).valueOf();
    return order === 'desc' ? diff : -diff;
  });
}

export type GetBlogPostsOptions = {
  /** Maximum number of posts to return. */
  limit?: number;
  /** Sort order by article date. Defaults to descending (newest first). */
  sort?: 'desc' | 'asc';
};

export type TopicTag = {
  name: string;
  count: number;
};

export type TopicTagGroup = {
  letter: string;
  tags: TopicTag[];
};

export type PostsByYear = {
  year: number;
  posts: ContentPost[];
};

export type TopicWithPosts = {
  name: string;
  slug: string;
  posts: ContentPost[];
};

export async function getBlogPosts(options: GetBlogPostsOptions = {}): Promise<BlogPost[]> {
  const { limit, sort = 'desc' } = options;

  let posts = sortByArticleDate(await getCollection('blog'), sort);

  if (limit !== undefined) {
    posts = posts.slice(0, limit);
  }

  return posts;
}

/** Published blog posts sorted by article date (newest first). */
export function getPublishedBlogPosts(options: GetBlogPostsOptions = {}): Promise<BlogPost[]> {
  return getBlogPosts(options);
}

export async function getPostsWithReadingTime(
  posts: ContentPost[],
): Promise<BlogPostWithReadingTime[]> {
  return Promise.all(
    posts.map(async (post) => {
      const { remarkPluginFrontmatter } = await render(post);
      return {
        post,
        minutesRead: remarkPluginFrontmatter.minutesRead,
      };
    }),
  );
}

export function tagToSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

function normalizeTagKey(tag: string): string {
  return tag.trim().toLowerCase();
}

function topicSectionFromTag(tag: string): string {
  const firstChar = tag.charAt(0).toUpperCase();
  return /^[A-Z]$/.test(firstChar) ? firstChar : '#';
}

export async function getPublishedContentPosts(
  options: GetBlogPostsOptions = {},
): Promise<ContentPost[]> {
  const { limit, sort = 'desc' } = options;

  const [blogPosts, notePosts] = await Promise.all([
    getCollection('blog'),
    getCollection('notes'),
  ]);

  let posts = sortByArticleDate([...blogPosts, ...notePosts], sort);

  if (limit !== undefined) {
    posts = posts.slice(0, limit);
  }

  return posts;
}

export function buildTopicTagGroups(posts: ContentPost[]): TopicTagGroup[] {
  const tagsByName = new Map<string, TopicTag>();

  for (const post of posts) {
    for (const rawTag of post.data.tags ?? []) {
      const normalizedTag = rawTag.trim();
      if (!normalizedTag) {
        continue;
      }

      const key = normalizedTag.toLowerCase();
      const existingTag = tagsByName.get(key);
      if (existingTag) {
        existingTag.count += 1;
        continue;
      }

      tagsByName.set(key, { name: normalizedTag, count: 1 });
    }
  }

  const sortedTags = Array.from(tagsByName.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
  const groupedTags = new Map<string, TopicTag[]>();

  for (const tag of sortedTags) {
    const section = topicSectionFromTag(tag.name);
    const sectionTags = groupedTags.get(section) ?? [];
    sectionTags.push(tag);
    groupedTags.set(section, sectionTags);
  }

  return Array.from(groupedTags.entries())
    .sort(([a], [b]) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    })
    .map(([letter, tags]) => ({ letter, tags }));
}

export async function getTopicTagGroups(): Promise<TopicTagGroup[]> {
  return buildTopicTagGroups(await getPublishedContentPosts());
}

export function groupPostsByYear(posts: ContentPost[]): PostsByYear[] {
  const postsByYear = new Map<number, ContentPost[]>();

  for (const post of sortByArticleDate(posts)) {
    const year = articleDate(post).getFullYear();
    const yearPosts = postsByYear.get(year) ?? [];
    yearPosts.push(post);
    postsByYear.set(year, yearPosts);
  }

  return Array.from(postsByYear.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, yearPosts]) => ({ year, posts: yearPosts }));
}

export function getPostsForTag(posts: ContentPost[], tagName: string): ContentPost[] {
  const tagKey = normalizeTagKey(tagName);

  return sortByArticleDate(
    posts.filter((post) =>
      (post.data.tags ?? []).some((tag) => normalizeTagKey(tag) === tagKey),
    ),
  );
}

export function getAllTopics(posts: ContentPost[]): TopicWithPosts[] {
  const topics = new Map<string, TopicWithPosts>();

  for (const post of posts) {
    for (const rawTag of post.data.tags ?? []) {
      const normalizedTag = rawTag.trim();
      if (!normalizedTag) {
        continue;
      }

      const key = normalizeTagKey(normalizedTag);
      const existingTopic = topics.get(key);
      if (existingTopic) {
        continue;
      }

      topics.set(key, {
        name: normalizedTag,
        slug: tagToSlug(normalizedTag),
        posts: getPostsForTag(posts, normalizedTag),
      });
    }
  }

  return Array.from(topics.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
}

export async function getAllTopicsWithPosts(): Promise<TopicWithPosts[]> {
  return getAllTopics(await getPublishedContentPosts());
}

export function getTopicBySlug(posts: ContentPost[], slug: string): TopicWithPosts | undefined {
  return getAllTopics(posts).find((topic) => topic.slug === slug);
}

export async function getTopicBySlugFromPosts(
  slug: string,
): Promise<TopicWithPosts | undefined> {
  return getTopicBySlug(await getPublishedContentPosts(), slug);
}
