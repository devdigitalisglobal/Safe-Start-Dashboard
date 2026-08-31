'use client';

import { useEffect, useRef, useState } from 'react';
import { MobilePreview } from '@/components/MobilePreview';
import styles from './OutcomesEditor.module.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
};

function parseOutcomes(value: string): string[] {
  if (!value.trim()) return [''];
  return value.split('\n');
}

type OutcomeRowProps = {
  value: string;
  index: number;
  readOnly: boolean;
  canRemove: boolean;
  onChange: (text: string) => void;
  onRemove: () => void;
};

function OutcomeRow({ value, index, readOnly, canRemove, onChange, onRemove }: OutcomeRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function wrapSelection(prefix: string, suffix: string) {
    const el = inputRef.current;
    if (!el || readOnly) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end) || 'text';
    const next = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + prefix.length + selected.length + suffix.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div className={styles.row}>
      <span className={styles.index} aria-hidden>
        {index + 1}
      </span>
      {!readOnly ? (
        <div className={styles.miniToolbar} role="toolbar" aria-label={`Format outcome ${index + 1}`}>
          <button
            type="button"
            className={styles.miniButton}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => wrapSelection('**', '**')}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            className={styles.miniButton}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => wrapSelection('*', '*')}
            title="Italic"
          >
            I
          </button>
        </div>
      ) : null}
      <input
        ref={inputRef}
        className={styles.input}
        value={value}
        readOnly={readOnly}
        placeholder="What learners will achieve"
        onChange={(event) => onChange(event.target.value)}
        aria-label={`Outcome ${index + 1}`}
      />
      {!readOnly && canRemove ? (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`Remove outcome ${index + 1}`}
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}

export function OutcomesEditor({ value, onChange, readOnly = false }: Props) {
  const [items, setItems] = useState(() => parseOutcomes(value));

  useEffect(() => {
    setItems(parseOutcomes(value));
  }, [value]);

  function emit(nextItems: string[]) {
    const rows = nextItems.length > 0 ? nextItems : [''];
    setItems(rows);
    onChange(rows.join('\n'));
  }

  function updateItem(index: number, text: string) {
    const next = [...items];
    next[index] = text;
    emit(next);
  }

  function addItem() {
    emit([...items, '']);
  }

  function removeItem(index: number) {
    const next = items.filter((_, i) => i !== index);
    emit(next.length > 0 ? next : ['']);
  }

  const previewMarkdown = items.map((item) => item.trim()).filter(Boolean).join('\n');

  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        {items.map((item, index) => (
          <OutcomeRow
            key={`outcome-row-${index}`}
            value={item}
            index={index}
            readOnly={readOnly}
            canRemove={items.length > 1}
            onChange={(text) => updateItem(index, text)}
            onRemove={() => removeItem(index)}
          />
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
