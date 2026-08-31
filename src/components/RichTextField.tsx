'use client';

import { RichTextEditor } from '@/components/RichTextEditor';
import { MobilePreview } from '@/components/MobilePreview';
import styles from './RichTextField.module.css';

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: number;
  previewLabel?: string;
  showPreview?: boolean;
  toolbar?: 'full' | 'inline';
};

export function RichTextField({
  value,
  onChange,
  placeholder,
  readOnly = false,
  minHeight = 200,
  previewLabel,
  showPreview = true,
  toolbar = 'full',
}: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.editorCol}>
        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          minHeight={minHeight}
          toolbar={toolbar}
        />
      </div>
      {showPreview && !readOnly ? (
        <MobilePreview markdown={value} label={previewLabel ?? 'App preview'} />
      ) : null}
    </div>
  );
}
