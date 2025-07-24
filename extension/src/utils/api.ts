export async function login(email: string, password: string) {
  const res = await fetch('http://localhost:3001/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: { email, password } }),
  });
  const data = await res.json();
  if (res.ok && res.headers.get('Authorization')) {
    const jwt = res.headers.get('Authorization').replace('Bearer ', '');
    await browser.storage.local.set({ jwt });
    return jwt;
  }
  throw new Error(data.status?.message || 'Login failed');
}

export async function getMySounds() {
  const { jwt } = await browser.storage.local.get('jwt');
  if (!jwt) throw new Error('Not logged in');
  const res = await fetch('http://localhost:3001/my_sounds', {
    headers: { Authorization: `Bearer ${jwt}` }
  });
  if (!res.ok) throw new Error('Failed to fetch sounds');
  return res.json();
}

export async function openGoogleAuth() {
  const popup = window.open('http://localhost:3001/users/auth/google_oauth2', 'oauthPopup', 'width=500,height=600');

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;

    const { token, user } = event.data;
    console.log('Token received!', token);
    localStorage.setItem('jwt', token);
    // Continue with authenticated requests
  });
}

// export async function signInWithGoogle() {
//   const form = document.createElement('form');
//   form.method = 'POST';
//   form.action = 'http://localhost:3001/users/auth/google_oauth2';

//   document.body.appendChild(form);
//   form.submit();
// }

