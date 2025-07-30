import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

console.log('🧹 Préparation du build...');

try {
  // Vérifier que TypeScript est installé
  console.log('📦 Vérification des dépendances...');
  execSync('tsc --version', { stdio: 'inherit' });
  
  // Nettoyer le dossier dist s'il existe
  const distPath = join(__dirname, '..', 'dist');
  if (existsSync(distPath)) {
    console.log('🗑️  Nettoyage du dossier dist...');
    rmSync(distPath, { recursive: true, force: true });
  }
  
  console.log('✅ Préparation terminée !');
  
} catch (error) {
  console.error('❌ Erreur lors de la préparation:', error.message);
  process.exit(1);
}