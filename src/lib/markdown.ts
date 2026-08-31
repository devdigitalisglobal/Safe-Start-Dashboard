import { marked } from 'marked';
import TurndownService from 'turndown';

marked.setOptions({
  gfm: true,
  breaks: true,
});

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**',
});

/** Markdown string → HTML for TipTap. */
export function markdownToHtml(markdown: string): string {
  const trimmed = markdown.trim();
  if (!trimmed) return '';
  return marked.parse(trimmed, { async: false }) as string;
}

/** TipTap HTML → markdown for API storage. */
export function htmlToMarkdown(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || trimmed === '<p></p>') return '';
  return turndown.turndown(trimmed).trim();
}
