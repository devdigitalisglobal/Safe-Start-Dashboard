'use client';



import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import { isCmsRole, isDashboardRole, isPortalRole } from '@/lib/access';
import { getTokenAal, isPortalMfaRequired } from '@/lib/mfa';
import styles from './LoginForm.module.css';

type Props = {
  errorCode?: string | null;
};



export function LoginForm({ errorCode }: Props) {

  const router = useRouter();

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(() => {

    if (errorCode === 'access_denied') {

      return 'Your account does not have dashboard or CMS access.';

    }

    if (errorCode === 'api_unreachable') {

      return 'Signed in, but the API is unreachable. Start safe-start-api on port 3000, then try again.';

    }

    return null;

  });

  const [loading, setLoading] = useState(false);



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    setError(null);



    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({

      email,

      password,

    });



    if (signInError) {

      if (/email not confirmed|confirm your email/i.test(signInError.message)) {

        setError('Confirm your email first. Check your inbox for the Safe Start link, then try again.');

      } else {

        setError(signInError.message);

      }

      setLoading(false);

      return;

    }



    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {

      setError('NEXT_PUBLIC_API_URL is not configured in .env.local');

      setLoading(false);

      return;

    }



    const {

      data: { session },

    } = await supabase.auth.getSession();



    if (!session?.access_token) {

      setError('Sign-in succeeded but no session was returned. Try again.');

      setLoading(false);

      return;

    }



    try {

      const profileRes = await fetch(`${apiUrl}/users/me`, {

        headers: { Authorization: `Bearer ${session.access_token}` },

      });



      if (!profileRes.ok) {

        if (profileRes.status === 403 || profileRes.status === 401) {

          await supabase.auth.signOut();

          setError('Your account does not have access.');

          setLoading(false);

          return;

        }

        throw new Error(`API returned ${profileRes.status}`);

      }



      const profile = (await profileRes.json()) as { role?: string };

      const role = profile.role ?? '';



      const hasDashboard = isDashboardRole(role);
      const hasCms = isCmsRole(role);



      if (!hasDashboard && !hasCms) {

        await supabase.auth.signOut();

        setError('Your account does not have dashboard or CMS access.');

        setLoading(false);

        return;

      }



      if (
        isPortalMfaRequired() &&
        isPortalRole(role) &&
        getTokenAal(session.access_token) !== 'aal2'
      ) {
        router.push('/account/mfa');
        router.refresh();
        return;
      }



      router.push(hasDashboard ? '/' : '/admin/modules');

      router.refresh();

    } catch {

      setError(

        'Signed in, but could not reach the API. Make sure safe-start-api is running (npm run dev) on port 3000.'

      );

      setLoading(false);

      return;

    }

  }



  return (

    <form className={styles.form} onSubmit={handleSubmit}>

      <label className={styles.label}>

        Email

        <input

          className={styles.input}

          type="email"

          autoComplete="email"

          required

          value={email}

          onChange={(e) => setEmail(e.target.value)}

        />

      </label>



      <label className={styles.label}>

        Password

        <input

          className={styles.input}

          type="password"

          autoComplete="current-password"

          required

          value={password}

          onChange={(e) => setPassword(e.target.value)}

        />

      </label>



      {error ? (

        <p className={styles.error} role="alert">

          {error}

        </p>

      ) : null}



      <button className={styles.button} type="submit" disabled={loading}>

        {loading ? 'Signing in…' : 'Sign in'}

      </button>

    </form>

  );

}

