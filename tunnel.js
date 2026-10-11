import localtunnel from 'localtunnel';
import fs from 'fs';

async function startTunnel() {
  try {
    console.log('Opening public tunnel on port 5173...');
    const tunnel = await localtunnel({ port: 5173 });
    console.log('PUBLIC_URL:' + tunnel.url);
    fs.writeFileSync('public_url.txt', tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel closed.');
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to start localtunnel:', err);
  }
}

startTunnel();
