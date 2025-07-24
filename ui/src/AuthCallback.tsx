import { useEffect } from 'react';

const AuthCallback = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('jwt', token);
      console.log('JWT token saved to localStorage');
    } else {
      console.warn('No token found in query string');
    }
  }, []);

  return <p>Signing in…</p>;
};

export default AuthCallback;
