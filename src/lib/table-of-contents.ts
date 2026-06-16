import type { MarkdownHeading } from 'astro';

type TocNode = {
	slug: string;
	text: string;
	depth: number;
	children: TocNode[];
	isOrphanGroup?: boolean;
};

function escapeHtml(text: string): string {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

function buildTocTree(headings: MarkdownHeading[], maxDepth: number): TocNode[] {
	const filtered = headings.filter((heading) => heading.depth <= maxDepth);
	const root: TocNode[] = [];
	const stack: { depth: number; children: TocNode[] }[] = [{ depth: 0, children: root }];

	for (const heading of filtered) {
		const node: TocNode = {
			slug: heading.slug,
			text: heading.text,
			depth: heading.depth,
			children: [],
		};

		while (stack.length > 1 && stack[stack.length - 1].depth >= heading.depth) {
			stack.pop();
		}

		stack[stack.length - 1].children.push(node);
		stack.push({ depth: heading.depth, children: node.children });
	}

	return wrapOrphanHeadings(root);
}

function wrapOrphanHeadings(nodes: TocNode[]): TocNode[] {
	const orphans: TocNode[] = [];
	const rest: TocNode[] = [];

	for (const node of nodes) {
		if (node.depth > 2 && rest.length === 0) {
			orphans.push(node);
			continue;
		}

		rest.push(node);
	}

	if (orphans.length === 0) {
		return nodes;
	}

	return [
		{
			slug: '',
			text: '',
			depth: 0,
			children: orphans,
			isOrphanGroup: true,
		},
		...rest,
	];
}

function renderTocNodes(nodes: TocNode[]): string {
	const items = nodes.map((node) => renderTocNode(node)).join('\n');
	return `<ul>\n${items}\n</ul>`;
}

function renderTocNode(node: TocNode): string {
	if (node.isOrphanGroup) {
		return `<li>\n${renderTocNodes(node.children)}\n</li>`;
	}

	const childrenHtml = node.children.length ? `\n${renderTocNodes(node.children)}` : '';
	const link = `<a href="#${node.slug}">${escapeHtml(node.text)}</a>`;

	if (node.depth > 2 && node.children.length === 0) {
		return `<li>${link}</li>`;
	}

	return `<li>\n<p>${link}</p>${childrenHtml}\n</li>`;
}

export function buildTableOfContentsHtml(
	headings: MarkdownHeading[],
	maxDepth = 3,
): string {
	const tree = buildTocTree(headings, maxDepth);
	if (tree.length === 0) {
		return '';
	}

	return renderTocNodes(tree);
}

export function hasTableOfContents(headings: MarkdownHeading[], maxDepth = 3): boolean {
	return headings.some((heading) => heading.depth <= maxDepth);
}
