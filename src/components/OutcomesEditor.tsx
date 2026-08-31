'use client';

import { RichTextEditor } from '@/components/RichTextEditor';
import { MobilePreview } from '@/components/MobilePreview';
import styles from './OutcomesEditor.module.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
};

function parseOutcomes(value: string): string[] {
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : [''];
}

export function OutcomesEditor({ value, onChange, readOnly = false }: Props) {
  const items = parseOutcomes(value);

  function emit(nextItems: string[]) {
    const cleaned = nextItems.map((item) => item.replace(/\n+/g, ' ').trim()).filter(Boolean);
    onChange(cleaned.join('\n'));
  }

  function updateItem(index: number, text: string) {
    const next = [...items];
    next[index] = text.replace(/\n+/g, ' ').trim();
    emit(next);
  }

  function addItem() {
    emit([...items.filter(Boolean), '']);
  }

  function removeItem(index: number) {
    const next = items.filter((_, i) => i !== index);
    emit(next.length > 0 ? next : ['']);
  }

  const previewMarkdown = items.filter(Boolean).join('\n');

  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        {items.map((item, index) => (
          <div key={`outcome-${index}`} className={styles.row}>
            <span className={styles.index} aria-hidden>
              {index + 1}
            </span>
            <div className={styles.editor}>
              <RichTextEditor
                value={item}
                onChange={(text) => updateItem(index, text)}
                readOnly={readOnly}
                minHeight={48}
                toolbar="inline"
                placeholder="What learners will achieve"
                singleLine
              />
            </div>
            {!readOnly && items.length > 1 ? (
              <button
                type="button"
                className={styles.remove}
                onClick={() => removeItem(index)}
                aria-label={`Remove outcome ${index + 1}`}
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {!readOnly ? (
        <button type="button" className={styles.add} onClick={addItem}>
          Add outcome
        </button>
      ) : null}

      {!readOnly ? (
        <MobilePreview markdown={previewMarkdown} variant="outcomes" label="Outcomes preview" />
      ) : null}
    </div>
  );
}
