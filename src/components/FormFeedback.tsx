import styles from './FormFeedback.module.css';

type MessageProps = {
  children: React.ReactNode;
};

export function FormMessage({ children }: MessageProps) {
  return (
    <p className={styles.message} role="status">
      {children}
    </p>
  );
}

export function FormError({ children }: MessageProps) {
  return (
    <p className={styles.error} role="alert">
      {children}
    </p>
  );
}

export function FormHint({ children }: MessageProps) {
  return <p className={styles.hint}>{children}</p>;
}
