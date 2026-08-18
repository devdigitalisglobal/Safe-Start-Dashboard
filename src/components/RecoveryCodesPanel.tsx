'use client';

import { useState } from 'react';
import styles from './MfaGate.module.css';

type Props = {
  codes: string[];
  title?: string;
  onConfirm: () => void;
};

export function RecoveryCodesPanel({
  codes,
  title = 'Save your recovery codes',
  onConfirm,
}: Props) {
  const [acknowledged, setAcknowledged] = useState(false);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
    } catch {
      // ignore
    }
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>
        Store these one-time codes somewhere safe. Each code can replace your authenticator if you
        lose your device. They will not be shown again.
      </p>

      <ul className={styles.codeList}>
        {codes.map((code) => (
          <li key={code}>
            <code>{code}</code>
          </li>
        ))}
      </ul>

      <button type="button" className={styles.copyButton} onClick={copyAll}>
        Copy all codes
      </button>

      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
        />
        I have saved these recovery codes
      </label>

      <button
        type="button"
        className={styles.button}
        disabled={!acknowledged}
        onClick={onConfirm}
      >
        Continue
      </button>
    </div>
  );
}
