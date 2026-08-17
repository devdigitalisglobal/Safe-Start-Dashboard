import styles from './Section.module.css';

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function Section({ title, description, children }: Props) {
  return (
    <section className={styles.section} aria-labelledby={title.replace(/\s+/g, '-')}>
      <div className={styles.header}>
        <h2 id={title.replace(/\s+/g, '-')} className={styles.title}>
          {title}
        </h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
