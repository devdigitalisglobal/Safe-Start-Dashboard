import styles from './account.module.css';

export default function AccountLayout({ children }: LayoutProps<'/account'>) {
  return <div className={styles.page}>{children}</div>;
}
