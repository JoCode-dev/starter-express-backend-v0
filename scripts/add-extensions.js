import { readdir, readFile, writeFile, stat, access } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

async function addExtensionsToImports(dir) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stats = await stat(filePath);
    
    if (stats.isDirectory()) {
      await addExtensionsToImports(filePath);
    } else if (extname(file) === '.js') {
      let content = await readFile(filePath, 'utf8');
      
      // Trouver tous les imports
      const importRegex = /import\s+(.+?)\s+from\s+['"]([^'"]*?)['"]/g;
      let match;
      let newContent = content;
      
      while ((match = importRegex.exec(content)) !== null) {
        const [fullMatch, imports, path] = match;
        
        // Ignorer les imports de modules externes
        if (path.startsWith('.') && !path.endsWith('.js') && !path.endsWith('.json')) {
          // Vérifier si c'est un import de dossier
          const fullPath = join(dir, path);
          let newPath = path;
          
          try {
            await access(fullPath);
            const pathStats = await stat(fullPath);
            if (pathStats.isDirectory()) {
              newPath = `${path}/index.js`;
            } else {
              newPath = `${path}.js`;
            }
          } catch (error) {
            // Le chemin n'existe pas, on ajoute juste .js
            newPath = `${path}.js`;
          }
          
          newContent = newContent.replace(fullMatch, `import ${imports} from '${newPath}'`);
        }
      }
      
      await writeFile(filePath, newContent, 'utf8');
      console.log(`✅ Extensions ajoutées à: ${filePath}`);
    }
  }
}

// Démarrer depuis le dossier dist
const distPath = join(__dirname, '..', 'dist');
console.log('🔧 Ajout des extensions .js aux imports...');
await addExtensionsToImports(distPath);
console.log('✅ Toutes les extensions ont été ajoutées !');