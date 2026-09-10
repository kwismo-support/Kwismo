const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('[Optimize-Assets] module sharp non trouvé, saut de l\'optimisation.');
  process.exit(0);
}

const TARGET_DIRS = [
  path.join(__dirname, '../assets'),
  path.join(__dirname, '../src'),
  path.join(__dirname, '../app'),
];

const MAX_DIMENSION = 1080;
const MAX_SIZE_BYTES = 150 * 1024; // Seuil à partir duquel la compression s'active (150 KB)

function findImages(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (file === 'node_modules' || file === '.git' || file === '.expo' || file.endsWith('.tmp')) return;
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = findImages(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function optimizeImages() {
  console.log('⚡ [Auto-Optimize] Scan et compression automatique des ressources du mobile...');
  let totalSavedBytes = 0;
  let optimizedCount = 0;

  const imagePaths = [];
  TARGET_DIRS.forEach((dir) => findImages(dir, imagePaths));

  for (const filePath of imagePaths) {
    try {
      const stat = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();

      if (stat.size > MAX_SIZE_BYTES) {
        const tempPath = filePath + '.tmp';
        const image = sharp(filePath, { limitInputPixels: false });
        const metadata = await image.metadata();

        if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION || stat.size > MAX_SIZE_BYTES) {
          let pipeline = image.resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
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

          if (newStat.size < stat.size) {
            const saved = stat.size - newStat.size;
            totalSavedBytes += saved;
            optimizedCount++;
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);
            console.log(`  ✓ Optimisé : ${path.basename(filePath)} (${(stat.size / 1024).toFixed(1)} KB ➔ ${(newStat.size / 1024).toFixed(1)} KB)`);
          } else {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          }
        }
      }
    } catch (err) {
      console.warn(`  ⚠️ Ignoré ${path.basename(filePath)}: ${err.message}`);
    }
  }

  if (optimizedCount > 0) {
    console.log(`✅ [Auto-Optimize] ${optimizedCount} fichier(s) optimisé(s) | ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB économisé(s).`);
  } else {
    console.log('✅ [Auto-Optimize] Tous les visuels sont déjà parfaitement optimisés (< 150 KB).');
  }
}

optimizeImages().catch((err) => {
  console.error('⚠️ [Auto-Optimize] Erreur durant l\'optimisation:', err);
});
