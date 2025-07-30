import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

console.log('🔍 Vérification du build...');

const distPath = join(__dirname, '..', 'dist');
const serverPath = join(distPath, 'server.js');

try {
  // Vérifier que le dossier dist existe
  if (!existsSync(distPath)) {
    throw new Error('Le dossier dist n\'existe pas. Le build a échoué.');
  }

  // Vérifier que server.js existe
  if (!existsSync(serverPath)) {
    throw new Error('Le fichier dist/server.js n\'existe pas. Le build a échoué.');
  }

  // Vérifier le contenu de server.js
  const serverContent = readFileSync(serverPath, 'utf8');
  if (!serverContent.includes('import app from')) {
    throw new Error('Le fichier server.js ne contient pas les imports attendus.');
  }

  console.log('✅ Build vérifié avec succès !');
  console.log('📁 Dossier dist:', distPath);
  console.log('🚀 Serveur prêt à démarrer');
  
} catch (error) {
  console.error('❌ Erreur de vérification:', error.message);
  console.error('🔧 Essayez de relancer le build avec: pnpm build');
  process.exit(1);
}