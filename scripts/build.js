import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

console.log('🔨 Début du processus de build...');

try {
  // Étape 0: Préparation
  console.log('🧹 Préparation...');
  execSync('node scripts/prebuild.js', { stdio: 'inherit' });
  
  // Étape 1: Compilation TypeScript
  console.log('📝 Compilation TypeScript...');
  execSync('tsc', { stdio: 'inherit' });
  
  // Vérifier que le dossier dist existe
  const distPath = join(__dirname, '..', 'dist');
  if (!existsSync(distPath)) {
    throw new Error('Le dossier dist n\'a pas été créé par TypeScript');
  }
  
  // Vérifier que server.js existe
  const serverPath = join(distPath, 'server.js');
  if (!existsSync(serverPath)) {
    throw new Error('Le fichier dist/server.js n\'a pas été créé');
  }
  
  // Étape 2: Ajouter les extensions
  console.log('🔧 Ajout des extensions .js aux imports...');
  execSync('node scripts/add-extensions.js', { stdio: 'inherit' });
  
  // Vérifier le contenu final de server.js
  const serverContent = readFileSync(serverPath, 'utf8');
  if (!serverContent.includes('import app from')) {
    throw new Error('Le fichier server.js ne contient pas les imports attendus');
  }
  
  console.log('✅ Build terminé avec succès !');
  console.log('📁 Fichiers générés dans:', distPath);
  
} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
}