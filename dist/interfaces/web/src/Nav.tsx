import { useLocation, Link } from 'wouter';
import styles from './Nav.module.css';

export default function Nav() {
  const [location] = useLocation();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.link} data-active={location === '/' || undefined}>
        Todos
      </Link>
      <Link href="/chat" className={styles.link} data-active={location === '/chat' || undefined}>
        Chat
      </Link>
    </nav>
  );
}
