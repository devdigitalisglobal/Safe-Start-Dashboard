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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

turndown.addRule('calloutWarning', {
  filter: (node) =>
    node.nodeName === 'BLOCKQUOTE' &&
    (node as HTMLElement).getAttribute('data-callout') === 'warning',
  replacement: (_content, node) => {
    const text = (node as HTMLElement).textContent?.trim() ?? '';
    return `>>! ${text}\n\n`;
  },
});

turndown.addRule('calloutTip', {
  filter: (node) =>
    node.nodeName === 'BLOCKQUOTE' &&
    (node as HTMLElement).getAttribute('data-callout') === 'tip',
  replacement: (_content, node) => {
    const text = (node as HTMLElement).textContent?.trim() ?? '';
    return `>> ${text}\n\n`;
  },
});

/** Markdown string → HTML for TipTap. */
export function markdownToHtml(markdown: string): string {
  const trimmed = markdown.trim();
  if (!trimmed) return '';

  const parts: string[] = [];
  const lines = trimmed.split('\n');
  let buffer: string[] = [];

  function flushBuffer() {
    if (buffer.length) {
      parts.push(marked.parse(buffer.join('\n'), { async: false }) as string);
      buffer = [];
    }
  }

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('>>! ')) {
      flushBuffer();
      parts.push(
        `<blockquote data-callout="warning"><p>${escapeHtml(t.slice(4))}</p></blockquote>`
      );
    } else if (t.startsWith('>> ')) {
      flushBuffer();
      parts.push(`<blockquote data-callout="tip"><p>${escapeHtml(t.slice(3))}</p></blockquote>`);
    } else {
      buffer.push(line);
    }
  }

  flushBuffer();
  return parts.join('');
}

/** TipTap HTML → markdown for API storage. */
export function htmlToMarkdown(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || trimmed === '<p></p>') return '';
  return turndown.turndown(trimmed).trim();
}
