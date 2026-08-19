'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SignOutButton } from '@/components/SignOutButton';
import { isCmsRole, isDashboardRole, isStaffRole, isSuperAdminRole } from '@/lib/access';
import { roleLabel } from '@/lib/roles';
import type { UserProfile } from '@/lib/types/dashboard';
import styles from './PortalChrome.module.css';

type NavItem = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

type Props = {
  profile: UserProfile;
  children: React.ReactNode;
};

function buildNav(profile: UserProfile) {
  const sections: { title: string; items: NavItem[] }[] = [];

  if (isDashboardRole(profile.role)) {
    sections.push({
      title: 'Reports',
      items: [
        {
          href: '/',
          label: 'Overview',
          isActive: (pathname) => pathname === '/',
        },
      ],
    });
  }

  if (isCmsRole(profile.role)) {
    const contentItems: NavItem[] = [
      {
        href: '/admin/modules',
        label: profile.role === 'reviewer' ? 'Modules to review' : 'Modules',
        isActive: (pathname) => pathname.startsWith('/admin/modules'),
      },
    ];

    if (isStaffRole(profile.role)) {
      contentItems.push({
        href: '/admin/assessments',
        label: 'Assessments',
        isActive: (pathname) => pathname.startsWith('/admin/assessments'),
      });
    }

    sections.push({
      title: profile.role === 'reviewer' ? 'Review' : 'Content',
      items: contentItems,
    });
  }

  if (isStaffRole(profile.role)) {
    const organisationItems: NavItem[] = [
      {
        href: '/admin/schools',
        label: 'Schools',
        isActive: (pathname) => pathname.startsWith('/admin/schools'),
      },
      {
        href: '/admin/partners',
        label: 'Partners',
        isActive: (pathname) =>
          pathname.startsWith('/admin/partners') || pathname.startsWith('/admin/branding'),
      },
    ];

    if (isSuperAdminRole(profile.role)) {
      organisationItems.push({
        href: '/admin/users',
        label: 'Team',
        isActive: (pathname) => pathname.startsWith('/admin/users'),
      });
    }

    sections.push({
      title: 'Organisation',
      items: organisationItems,
    });

    sections.push({
      title: 'Library',
      items: [
        {
          href: '/admin/media',
          label: 'Media',
          isActive: (pathname) => pathname.startsWith('/admin/media'),
        },
        {
          href: '/admin/resources',
          label: 'Learner resources',
          isActive: (pathname) => pathname.startsWith('/admin/resources'),
        },
      ],
    });

    sections.push({
      title: 'System',
      items: [
        {
          href: '/admin/audit',
          label: 'Audit log',
          isActive: (pathname) => pathname.startsWith('/admin/audit'),
        },
      ],
    });
  }

  return sections;
}

export function PortalChrome({ profile, children }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const sections = buildNav(profile);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className={styles.root}>
      {menuOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation menu"
          onClick={closeMenu}
        />
      ) : null}

      <aside
        id="portal-sidebar"
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.brand}>
          <p className={styles.brandEyebrow}>Safe Start</p>
          <p className={styles.brandTitle}>Staff Portal</p>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          {sections.map((section) => (
            <div key={section.title} className={styles.section}>
              <p className={styles.sectionTitle}>{section.title}</p>
              <ul className={styles.sectionList}>
                {section.items.map((item) => {
                  const active = item.isActive(pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        prefetch={item.href === '/' ? false : undefined}
                        className={active ? styles.linkActive : styles.link}
                        aria-current={active ? 'page' : undefined}
                        onClick={closeMenu}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.user}>
          <p className={styles.userName}>{profile.fullName}</p>
          <p className={styles.userMeta}>
            {roleLabel(profile.role)}
            {profile.school?.name ? ` · ${profile.school.name}` : ''}
          </p>
          <Link href="/account/security" className={styles.accountLink} onClick={closeMenu}>
            Account security
          </Link>
          <SignOutButton />
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.mobileBar}>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="portal-sidebar"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
          <p className={styles.mobileTitle}>Safe Start Staff Portal</p>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
