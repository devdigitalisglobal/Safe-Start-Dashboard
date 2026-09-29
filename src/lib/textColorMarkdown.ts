/** Learner brand accent — matches app theme primaryBright. */
export const CMS_TEXT_COLOR_BLUE = '#268CF5';

const BLUE_OPEN = '{blue}';
const BLUE_CLOSE = '{/blue}';

/** Expand stored markdown color tags to HTML spans for TipTap / marked. */
export function expandTextColorTags(markdown: string): string {
  return markdown.replace(/\{blue\}([\s\S]*?)\{\/blue\}/g, (_, inner: string) => {
    return `<span data-text-color="blue">${inner}</span>`;
  });
}

export function wrapBlueText(innerMarkdown: string): string {
  return `${BLUE_OPEN}${innerMarkdown}${BLUE_CLOSE}`;
}

/**
 * TipTap + turndown often emit `**{blue}…{/blue}**` when bold wraps coloured text.
 * Parsers expect `{blue}**…**{/blue}` so bold renders inside the span.
 */
export function normalizeBoldWrappingBlue(markdown: string): string {
  return markdown.replace(/\*\*(\{blue\}[\s\S]*?\{\/blue\})\*\*/g, (_, blueBlock: string) => {
    const inner = blueBlock.slice(BLUE_OPEN.length, -BLUE_CLOSE.length);
    const trimmed = inner.trim();
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
      return blueBlock;
    }
    return `${BLUE_OPEN}**${inner}**${BLUE_CLOSE}`;
  });
}
