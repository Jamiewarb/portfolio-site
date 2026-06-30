import { getCollection } from 'astro:content';
import { type GetBlogPostsOptions, sortByArticleDate, type NotePost } from './blog';

export type { NotePost };

export async function getPublishedNotes(options: GetBlogPostsOptions = {}): Promise<NotePost[]> {
  const { limit, sort = 'desc' } = options;

  let posts = sortByArticleDate(await getCollection('notes'), sort) as NotePost[];

  if (limit !== undefined) {
    posts = posts.slice(0, limit);
  }

  return posts;
}
