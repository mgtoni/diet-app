const { execSync } = require('child_process');

if (process.env.VERCEL) {
  console.log('Vercel environment detected. Installing Linux native bindings for Tailwind v4 to bypass NPM bug...');
  try {
    execSync('npm install --no-save --force @tailwindcss/oxide-linux-x64-gnu lightningcss-linux-x64-gnu', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to install native bindings', error);
  }
}
