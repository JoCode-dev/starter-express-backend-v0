import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

console.log("🚀 Démarrage de l'application...");

const distPath = join(__dirname, '..', 'dist');
const serverPath = join(distPath, 'server.js');

try {
  // Vérifier si le build existe
  if (!existsSync(serverPath)) {
    console.log('⚠️  Build non trouvé, reconstruction...');
    execSync('pnpm build', { stdio: 'inherit' });
  }

  // Vérifier le build
  console.log('🔍 Vérification du build...');
  execSync('node scripts/verify-build.js', { stdio: 'inherit' });

  // Démarrer le serveur
  console.log('🌐 Démarrage du serveur...');
  execSync('node dist/server.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erreur lors du démarrage:', error.message);
  process.exit(1);
}
