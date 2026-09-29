import { normalizeBoldWrappingBlue } from './textColorMarkdown';

/** Shared block parser for CMS mobile preview (mirrors learner app MarkdownContent). */

const QUICK_TIP_PARAGRAPH = /^\*\*quick tip:?\*\*:?\s*(.*)$/i;

export function splitQuickTipParagraph(text: string): { body: string } | null {
  const match = QUICK_TIP_PARAGRAPH.exec(text.trim());
  if (!match) return null;
  return { body: match[1] };
}

export type PreviewBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading2'; text: string }
  | { type: 'heading3'; text: string }
  | { type: 'bullet'; items: string[] }
  | { type: 'ordered'; items: string[] }
  | { type: 'calloutTip'; text: string }
  | { type: 'calloutWarning'; text: string };

export function parseMarkdownBlocks(content: string): PreviewBlock[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: PreviewBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const trimmed = lines[index].trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'heading3', text: trimmed.slice(4).trim() });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading2', text: trimmed.slice(3).trim() });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('>>! ')) {
      blocks.push({ type: 'calloutWarning', text: trimmed.slice(4).trim() });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('>> ')) {
      blocks.push({ type: 'calloutTip', text: trimmed.slice(3).trim() });
      index += 1;
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^-\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^-\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'bullet', items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ordered', items });
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (
        !next ||
        next.startsWith('## ') ||
        next.startsWith('### ') ||
        next.startsWith('>> ') ||
        next.startsWith('>>! ') ||
        /^-\s+/.test(next) ||
        /^\d+\.\s+/.test(next)
      ) {
        break;
      }
      paragraphLines.push(next);
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
  }

  return blocks;
}

const BLUE_TAG = /\{blue\}([\s\S]*?)\{\/blue\}/g;

function inlineMarkdownToHtmlInner(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .replace(/(\*\*[\s\S]+?\*\*)/g, (_, token: string) => `<strong>${token.slice(2, -2)}</strong>`)
    .replace(/(\*[^*]+\*)/g, (_, token: string) => `<em>${token.slice(1, -1)}</em>`)
    .replace(
      /(\[[^\]]+\]\([^)]+\))/g,
      (token) => {
        const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
        if (!match) return token;
        return `<a href="${match[2]}" target="_blank" rel="noopener noreferrer">${match[1]}</a>`;
      }
    )
    .replace(
      /(https?:\/\/[^\s)]+)/g,
      (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
}

/** Inline **bold**, *italic*, [links](url), `{blue}…{/blue}`. Returns HTML string. */
export function inlineMarkdownToHtml(text: string): string {
  text = normalizeBoldWrappingBlue(text);

  if (!text.includes('{blue}')) {
    return inlineMarkdownToHtmlInner(text);
  }

  BLUE_TAG.lastIndex = 0;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = BLUE_TAG.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result += inlineMarkdownToHtmlInner(text.slice(lastIndex, match.index));
    }
    result += `<span class="textColorBlue">${inlineMarkdownToHtmlInner(match[1])}</span>`;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    result += inlineMarkdownToHtmlInner(text.slice(lastIndex));
  }

  return result;
}
