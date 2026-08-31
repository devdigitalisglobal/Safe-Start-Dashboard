'use client';

import { inlineMarkdownToHtml, parseMarkdownBlocks } from '@/lib/parseMarkdownBlocks';
import styles from './MobilePreview.module.css';

type Props = {
  markdown: string;
  label?: string;
  variant?: 'markdown' | 'outcomes';
};

export function MobilePreview({ markdown, label = 'App preview', variant = 'markdown' }: Props) {
  const trimmed = markdown.trim();

  if (variant === 'outcomes') {
    const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);

    return (
      <div className={styles.wrap}>
        <span className={styles.label}>{label}</span>
        <div className={styles.phone} aria-label={label}>
          {!lines.length ? (
            <p className={styles.empty}>Add one outcome per line to preview the module intro list.</p>
          ) : (
            lines.map((line, index) => (
              <div key={`outcome-${index}`} className={styles.outcomeRow}>
                <span className={styles.outcomeIcon} aria-hidden>
                  ✓
                </span>
                <span
                  className={styles.outcomeText}
                  dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(line) }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      <div className={styles.phone} aria-label={label}>
        {!trimmed ? (
          <p className={styles.empty}>Start typing to see how learners will see this.</p>
        ) : (
          parseMarkdownBlocks(trimmed).map((block, index) => {
            const key = `preview-${index}`;

            if (block.type === 'heading2') {
              return (
                <h2
                  key={key}
                  className={styles.heading2}
                  dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(block.text) }}
                />
              );
            }

            if (block.type === 'heading3') {
              return (
                <h3
                  key={key}
                  className={styles.heading3}
                  dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(block.text) }}
                />
              );
            }

            if (block.type === 'calloutTip') {
              return (
                <div key={key} className={styles.calloutTip}>
                  <span className={styles.calloutLabel}>Tip</span>
                  <div dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(block.text) }} />
                </div>
              );
            }

            if (block.type === 'calloutWarning') {
              return (
                <div key={key} className={styles.calloutWarning}>
                  <span className={styles.calloutLabel}>Warning</span>
                  <div dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(block.text) }} />
                </div>
              );
            }

            if (block.type === 'bullet') {
              return (
                <ul key={key} className={styles.list}>
                  {block.items.map((item, itemIndex) => (
                    <li
                      key={`${key}-${itemIndex}`}
                      dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(item) }}
                    />
                  ))}
                </ul>
              );
            }

            if (block.type === 'ordered') {
              return (
                <ol key={key} className={styles.list}>
                  {block.items.map((item, itemIndex) => (
                    <li
                      key={`${key}-${itemIndex}`}
                      dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(item) }}
                    />
                  ))}
                </ol>
              );
            }

            return (
              <p
                key={key}
                className={styles.paragraph}
                dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(block.text) }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
