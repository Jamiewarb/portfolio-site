import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../config/site';
import { ROUTES } from '../constants/routes';
import { getPublishedBlogPosts } from '../lib/blog';

export async function GET(context) {
  const posts = await getPublishedBlogPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      ...post.data,
      link: ROUTES.writingPost(post.id),
    })),
  });
}
