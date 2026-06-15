import { type CollectionEntry, getCollection } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export function articleDate(post: BlogPost): Date {
	return post.data.updatedDate ?? post.data.pubDate;
}

export function sortByArticleDate(
	posts: BlogPost[],
	order: 'desc' | 'asc' = 'desc',
): BlogPost[] {
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

export async function getBlogPosts(options: GetBlogPostsOptions = {}): Promise<BlogPost[]> {
	const { limit, sort = 'desc' } = options;

	let posts = sortByArticleDate(await getCollection('blog'), sort);

	if (limit !== undefined) {
		posts = posts.slice(0, limit);
	}

	return posts;
}

/** Published blog posts sorted by article date (newest first). */
export function getPublishedBlogPosts(
	options: GetBlogPostsOptions = {},
): Promise<BlogPost[]> {
	return getBlogPosts(options);
}
