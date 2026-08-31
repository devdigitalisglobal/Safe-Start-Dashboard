/** Shared block parser for CMS mobile preview (mirrors learner app MarkdownContent). */

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

/** Inline **bold**, *italic*, [links](url). Returns HTML string. */
export function inlineMarkdownToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .replace(/(\*\*[^*]+\*\*)/g, (_, token: string) => `<strong>${token.slice(2, -2)}</strong>`)
    .replace(/(\*[^*]+\*)/g, (_, token: string) => `<em>${token.slice(1, -1)}</em>`)
    .replace(
      /(\[[^\]]+\]\([^)]+\))/g,
      (token) => {
        const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
        if (!match) return token;
        return `<a href="${match[2]}" target="_blank" rel="noopener noreferrer">${match[1]}</a>`;
      }
    )
    .replace(/(https?:\/\/[^\s)]+)/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}
