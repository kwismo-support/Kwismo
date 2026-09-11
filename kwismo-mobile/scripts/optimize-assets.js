const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('[Auto-Optimize] Module sharp non disponible. Saut de la compression d\'images.');
  process.exit(0);
}

function findProjectRoot(startDir) {
  let currentDir = startDir;
  while (currentDir && currentDir !== path.parse(currentDir).root) {
    if (
      fs.existsSync(path.join(currentDir, 'app.config.js')) ||
      fs.existsSync(path.join(currentDir, 'app.json')) ||
      fs.existsSync(path.join(currentDir, 'eas.json'))
    ) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  try {
    const items = fs.readdirSync(startDir);
    for (const item of items) {
      const subPath = path.join(startDir, item);
      if (fs.statSync(subPath).isDirectory() && !['node_modules', '.git', '.expo'].includes(item)) {
        if (
          fs.existsSync(path.join(subPath, 'app.config.js')) ||
          fs.existsSync(path.join(subPath, 'app.json')) ||
          fs.existsSync(path.join(subPath, 'eas.json'))
        ) {
          return subPath;
        }
      }
    }
  } catch (e) {
    /* ignore */
  }

  return startDir;
}

const projectRoot = findProjectRoot(__dirname);
console.log(`[Auto-Optimize] Racine projet détectée : ${projectRoot}`);

const MAX_IMAGE_DIMENSION = 1080;
const IMAGE_SIZE_THRESHOLD = 150 * 1024;
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.expo',
  'dist',
  'build',
  'web-build',
  '.next',
]);

const HEAVY_FILE_EXTENSIONS = new Set(['.mp4', '.mov', '.avi', '.zip', '.pdf', '.psd', '.ai']);

function scanDirectory(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;

  let items = [];
  try {
    items = fs.readdirSync(dirPath);
  } catch (err) {
    return fileList;
  }

  for (const item of items) {
    if (IGNORED_DIRS.has(item) || item.endsWith('.tmp')) continue;

    const fullPath = path.join(dirPath, item);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDirectory(fullPath, fileList);
      } else {
        fileList.push({ path: fullPath, size: stat.size });
      }
    } catch (err) {
      // Ignorer les erreurs d'accès aux fichiers système verrouillés
    }
  }

  return fileList;
}

async function runOptimization() {
  console.log('[Auto-Optimize] Analyse dynamique globale de TOUS les fichiers depuis la racine...');

  const allFiles = scanDirectory(projectRoot);
  let totalSavedBytes = 0;
  let optimizedCount = 0;
  let heavyWarningsCount = 0;

  for (const fileObj of allFiles) {
    const filePath = fileObj.path;
    const size = fileObj.size;
    const ext = path.extname(filePath).toLowerCase();
    const relativePath = path.relative(projectRoot, filePath);

    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext) && size > IMAGE_SIZE_THRESHOLD) {
      const tempPath = filePath + '.tmp';
      try {
        const image = sharp(filePath, { limitInputPixels: false });
        const metadata = await image.metadata();

        if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION || size > IMAGE_SIZE_THRESHOLD) {
          let pipeline = image.resize({
            width: MAX_IMAGE_DIMENSION,
            height: MAX_IMAGE_DIMENSION,
            fit: 'inside',
            withoutEnlargement: true,
          });

          if (ext === '.png') {
            pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
          } else if (ext === '.jpg' || ext === '.jpeg') {
            pipeline = pipeline.jpeg({ quality: 80, progressive: true });
          } else if (ext === '.webp') {
            pipeline = pipeline.webp({ quality: 80 });
          }

          await pipeline.toFile(tempPath);
          const newStat = fs.statSync(tempPath);

          if (newStat.size < size) {
            const saved = size - newStat.size;
            totalSavedBytes += saved;
            optimizedCount++;
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);
            console.log(`Image optimisée : ${relativePath} (${(size / 1024).toFixed(1)} KB ➔ ${(newStat.size / 1024).toFixed(1)} KB)`);
          } else {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          }
        }
      } catch (err) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        console.warn(`Non modifiée ${relativePath}: ${err.message}`);
      }
    }
    else if (HEAVY_FILE_EXTENSIONS.has(ext) || (size > 500 * 1024 && !['.json', '.ts', '.tsx', '.js', '.map'].includes(ext))) {
      if (size > 500 * 1024) {
        heavyWarningsCount++;
        console.warn(`[Attention Fichier Lourd] ${relativePath} (${(size / 1024 / 1024).toFixed(2)} MB)`);
      }
    }
  }

  console.log('\n[Auto-Optimize] Bilan de l\'analyse :');
  if (optimizedCount > 0) {
    console.log(`${optimizedCount} image(s) compressée(s) | ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB économisé(s).`);
  } else {
    console.log('Tous les visuels du projet sont déjà parfaitement optimisés (< 150 KB).');
  }

  if (heavyWarningsCount > 0) {
    console.warn(`${heavyWarningsCount} fichier(s) vidéo/media lourd(s) détecté(s). Pensez à les héberger à distance.`);
  }
}

runOptimization().catch((err) => {
  console.error('[Auto-Optimize] Erreur lors de l\'exécution:', err);
});
