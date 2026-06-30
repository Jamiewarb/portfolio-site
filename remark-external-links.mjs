/**
 * Opens off-site links from Markdown/MDX in a new tab.
 */
export function remarkExternalLinks({ site }) {
  const siteOrigin = new URL(site).origin;

  return function (tree) {
    visit(tree, (node) => {
      if (node.type !== 'link' || !isExternalLink(node.url, siteOrigin)) {
        return;
      }

      node.data ??= {};
      node.data.hProperties ??= {};
      node.data.hProperties.target = '_blank';
      node.data.hProperties.rel = 'noopener noreferrer';
    });
  };
}

function isExternalLink(href, siteOrigin) {
  if (!href || href.startsWith('#')) {
    return false;
  }

  if (href.startsWith('/') && !href.startsWith('//')) {
    return false;
  }

  if (href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }

  try {
    return new URL(href, siteOrigin).origin !== siteOrigin;
  } catch {
    return false;
  }
}

function visit(node, callback) {
  callback(node);

  if (!Array.isArray(node.children)) {
    return;
  }

  for (const child of node.children) {
    visit(child, callback);
  }
}
