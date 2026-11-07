const fs = require('fs');
const path = require('path');
const sharp = require('../node_modules/sharp');

const inputDir = path.resolve(__dirname, '../../maquettes/mobile');
const baseOutputDir = path.resolve(__dirname, '../../maquettes/ios_appstore');

const dirIphone61 = path.join(baseOutputDir, 'iphone_6_1_pouces');
const dirIphone67 = path.join(baseOutputDir, 'iphone_6_7_pouces');
const dirIpad = path.join(baseOutputDir, 'ipad_12_9_pouces');

[baseOutputDir, dirIphone61, dirIphone67, dirIpad].forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

const screens = [
  {
    input: 'Home.png',
    name: '01_Accueil_Recherche_Et_Detection.png',
    title: 'Détection d\'appels & Recherche de numéros',
    subtitle: 'Identifiez instantanément les appelants inconnus et protégez vos proches',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'Gestion.png',
    name: '02_Protection_Anti_Fraude_Et_Spam.png',
    title: 'Protection active contre arnaques & spams',
    subtitle: 'Filtrage intelligent et blocage automatique des fraudeurs récidivistes',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'Manage_My_contacts.png',
    name: '03_Gestion_Contacts_Et_Confiance.png',
    title: 'Analyse et sécurisation du carnet d\'adresses',
    subtitle: 'Évaluez la réputation de tous vos contacts en un coup d\'œil',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'Verification_Number.png',
    name: '04_Analyse_Detaillee_Numero.png',
    title: 'Score de fiabilité & Historique de réputation',
    subtitle: 'Accédez aux signalements détaillés et aux avis vérifiés de la communauté',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'profil n security page.png',
    name: '05_Securite_Et_Parametres.png',
    title: 'Paramètres de sécurité avancés',
    subtitle: 'Contrôlez vos règles de confidentialité, listes noires et alertes en direct',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'invite_friends.png',
    name: '06_Protection_Communaute_Kwismo.png',
    title: 'Réseau collaboratif Kwismo Sécurité',
    subtitle: 'Participez à la protection collective contre la cybercriminalité mobile',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'Welcome.png',
    name: '07_Bienvenue_Kwismo.png',
    title: 'Bienvenue sur Kwismo',
    subtitle: 'Votre bouclier intelligent contre les arnaques et la fraude téléphonique',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  }
];

// Clean Android status bar & nav bar
async function cleanAndroidBars(inputPath, topColor, bottomColor) {
  const coverTop = Buffer.from(`<svg width="412" height="40"><rect width="412" height="40" fill="${topColor}"/></svg>`);
  const coverBottom = Buffer.from(`<svg width="412" height="40"><rect width="412" height="40" fill="${bottomColor}"/></svg>`);

  return await sharp(inputPath)
    .composite([
      { input: coverTop, top: 0, left: 0 },
      { input: coverBottom, top: 917 - 40, left: 0 }
    ])
    .toBuffer();
}

// ----------------------------------------------------
// 1. iPhone 6.1" (1179 x 2556) - Apple requirement
// ----------------------------------------------------
const W_61 = 1179;
const H_61 = 2556;

function createIphone61TopSvg() {
  const iconColor = '#FFFFFF';
  return Buffer.from(`
<svg width="${W_61}" height="190" viewBox="0 0 ${W_61} 190" xmlns="http://www.w3.org/2000/svg">
  <!-- Dynamic Island -->
  <rect x="419.5" y="32" width="340" height="88" rx="44" ry="44" fill="#000000" />
  <circle cx="712" cy="76" r="15" fill="#111827" />
  <circle cx="712" cy="76" r="7.5" fill="#1E293B" />
  <circle cx="465" cy="76" r="11" fill="#0F172A" />

  <!-- Time 9:41 -->
  <text x="135" y="92" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" font-size="41" font-weight="600" fill="${iconColor}" text-anchor="middle">9:41</text>

  <!-- Cellular Signal -->
  <g transform="translate(950, 64)">
    <rect x="0" y="22" width="5.5" height="11" rx="1.8" fill="${iconColor}" />
    <rect x="10" y="16" width="5.5" height="17" rx="1.8" fill="${iconColor}" />
    <rect x="20" y="9" width="5.5" height="24" rx="1.8" fill="${iconColor}" />
    <rect x="30" y="0" width="5.5" height="33" rx="1.8" fill="${iconColor}" />
  </g>

  <!-- Wi-Fi Icon -->
  <g transform="translate(1005, 64)">
    <path d="M16.5 6.8C11.5 6.8 6.9 8.9 3.5 12.2L1.4 10.1C5.3 6.2 10.6 3.7 16.5 3.7C22.4 3.7 27.7 6.2 31.6 10.1L29.5 12.2C26.1 8.9 21.5 6.8 16.5 6.8ZM16.5 13.8C13.2 13.8 10.3 15.2 8.1 17.4L6 15.3C8.7 12.5 12.4 10.8 16.5 10.8C20.6 10.8 24.3 12.5 27 15.3L24.9 17.4C22.7 15.2 19.8 13.8 16.5 13.8ZM16.5 20.6C15 20.6 13.6 21.3 12.6 22.3L16.5 26.2L20.4 22.3C19.4 21.3 18 20.6 16.5 20.6Z" fill="${iconColor}" />
  </g>

  <!-- Battery Icon -->
  <g transform="translate(1060, 67)">
    <rect x="0" y="0" width="62" height="29" rx="7.5" fill="none" stroke="${iconColor}" stroke-width="3.2" />
    <rect x="4.5" y="4.5" width="53" height="20" rx="3.5" fill="${iconColor}" />
    <path d="M66 9C67.5 9 68.5 10.5 68.5 12V17C68.5 18.5 67.5 20 66 20V9Z" fill="${iconColor}" />
  </g>
</svg>
  `);
}

function createIphone61BottomSvg() {
  return Buffer.from(`
<svg width="${W_61}" height="75" viewBox="0 0 ${W_61} 75" xmlns="http://www.w3.org/2000/svg">
  <rect x="399.5" y="38" width="380" height="14" rx="7" fill="#000000" fill-opacity="0.85" />
</svg>
  `);
}

async function generateIphone61(cleanedBuffer, outputPath) {
  const resized = await sharp(cleanedBuffer)
    .resize(W_61, H_61, { fit: 'fill', kernel: 'lanczos3' })
    .toBuffer();

  const topSvg = createIphone61TopSvg();
  const bottomSvg = createIphone61BottomSvg();

  await sharp(resized)
    .composite([
      { input: topSvg, top: 0, left: 0 },
      { input: bottomSvg, top: H_61 - 75, left: 0 }
    ])
    .removeAlpha()
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);
}

// ----------------------------------------------------
// 2. iPhone 6.7" (1290 x 2796) - Apple requirement
// ----------------------------------------------------
const W_67 = 1290;
const H_67 = 2796;

function createIphone67TopSvg() {
  const iconColor = '#FFFFFF';
  return Buffer.from(`
<svg width="${W_67}" height="200" viewBox="0 0 ${W_67} 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="460" y="35" width="370" height="95" rx="47.5" ry="47.5" fill="#000000" />
  <circle cx="780" cy="82.5" r="16" fill="#111827" />
  <circle cx="780" cy="82.5" r="8" fill="#1E293B" />
  <circle cx="510" cy="82.5" r="12" fill="#0F172A" />

  <text x="145" y="98" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" font-size="44" font-weight="600" fill="${iconColor}" text-anchor="middle">9:41</text>

  <g transform="translate(1040, 68)">
    <rect x="0" y="24" width="6" height="12" rx="2" fill="${iconColor}" />
    <rect x="11" y="18" width="6" height="18" rx="2" fill="${iconColor}" />
    <rect x="22" y="10" width="6" height="26" rx="2" fill="${iconColor}" />
    <rect x="33" y="0" width="6" height="36" rx="2" fill="${iconColor}" />
  </g>

  <g transform="translate(1100, 68)">
    <path d="M18 7.5C12.5 7.5 7.5 9.7 3.8 13.3L1.5 11C5.8 6.7 11.6 4 18 4C24.4 4 30.2 6.7 34.5 11L32.2 13.3C28.5 9.7 23.5 7.5 18 7.5ZM18 15C14.4 15 11.2 16.5 8.8 18.9L6.5 16.6C9.5 13.6 13.5 11.8 18 11.8C22.5 11.8 26.5 13.6 29.5 16.6L27.2 18.9C24.8 16.5 21.6 15 18 15ZM18 22.5C16.3 22.5 14.8 23.2 13.7 24.3L18 28.6L22.3 24.3C21.2 23.2 19.7 22.5 18 22.5Z" fill="${iconColor}" />
  </g>

  <g transform="translate(1160, 71)">
    <rect x="0" y="0" width="68" height="32" rx="8" fill="none" stroke="${iconColor}" stroke-width="3.5" />
    <rect x="5" y="5" width="58" height="22" rx="4" fill="${iconColor}" />
    <path d="M72 10C73.5 10 74.5 11.5 74.5 13V19C74.5 20.5 73.5 22 72 22V10Z" fill="${iconColor}" />
  </g>
</svg>
  `);
}

function createIphone67BottomSvg() {
  return Buffer.from(`
<svg width="${W_67}" height="80" viewBox="0 0 ${W_67} 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="435" y="42" width="420" height="15" rx="7.5" fill="#000000" fill-opacity="0.85" />
</svg>
  `);
}

async function generateIphone67(cleanedBuffer, outputPath) {
  const resized = await sharp(cleanedBuffer)
    .resize(W_67, H_67, { fit: 'fill', kernel: 'lanczos3' })
    .toBuffer();

  const topSvg = createIphone67TopSvg();
  const bottomSvg = createIphone67BottomSvg();

  await sharp(resized)
    .composite([
      { input: topSvg, top: 0, left: 0 },
      { input: bottomSvg, top: H_67 - 80, left: 0 }
    ])
    .removeAlpha()
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);
}

// ----------------------------------------------------
// 3. iPad Pro 12.9" (2048 x 2732) - Apple requirement
// ----------------------------------------------------
const W_IPAD = 2048;
const H_IPAD = 2732;

// The framed phone mockup on iPad canvas
const MOCKUP_W = 1020;
const MOCKUP_H = 2211; // 1020 * (2556 / 1179)
const MOCKUP_X = Math.round((W_IPAD - MOCKUP_W) / 2);
const MOCKUP_Y = 380;

function createIpadLayoutSvg(screen) {
  // Escape XML characters
  const cleanTitle = screen.title.replace(/&/g, '&amp;').replace(/'/g, '&apos;');
  const cleanSubtitle = screen.subtitle.replace(/&/g, '&amp;').replace(/'/g, '&apos;');

  return Buffer.from(`
<svg width="${W_IPAD}" height="${H_IPAD}" viewBox="0 0 ${W_IPAD} ${H_IPAD}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="50%" stop-color="#161E33" />
      <stop offset="100%" stop-color="#090E1A" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#10B981" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="25" stdDeviation="35" flood-color="#000000" flood-opacity="0.65" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="${W_IPAD}" height="${H_IPAD}" fill="url(#bgGrad)" />
  <rect width="${W_IPAD}" height="${H_IPAD}" fill="url(#glow)" />

  <!-- iPad Status Bar -->
  <text x="80" y="55" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" font-size="34" font-weight="600" fill="#E2E8F0">9:41</text>
  <text x="175" y="55" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" font-size="30" font-weight="500" fill="#94A3B8">Mer. 6 nov.</text>
  
  <!-- iPad Status Icons (Right) -->
  <g transform="translate(1820, 32)">
    <!-- Wi-Fi -->
    <path d="M16 6C11 6 6.5 8 3 11L1 9C5 5 10 2.5 16 2.5C22 2.5 27 5 31 9L29 11C25.5 8 21 6 16 6ZM16 13C13 13 10 14.2 8 16.2L6 14.2C8.5 11.7 12 10.2 16 10.2C20 10.2 23.5 11.7 26 14.2L24 16.2C22 14.2 19 13 16 13ZM16 19.5C14.5 19.5 13.2 20.2 12.2 21.2L16 25L19.8 21.2C18.8 20.2 17.5 19.5 16 19.5Z" fill="#E2E8F0" />
    <!-- Battery -->
    <g transform="translate(60, 2)">
      <rect x="0" y="0" width="58" height="26" rx="6" fill="none" stroke="#E2E8F0" stroke-width="2.8" />
      <rect x="4" y="4" width="48" height="18" rx="3" fill="#34D399" />
      <path d="M62 8C63.5 8 64.5 9.5 64.5 11V15C64.5 16.5 63.5 18 62 18V8Z" fill="#E2E8F0" />
    </g>
  </g>

  <!-- Typography Marketing Header -->
  <text x="1024" y="165" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" font-size="62" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.5">${cleanTitle}</text>
  <text x="1024" y="235" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" font-size="34" font-weight="500" fill="#38BDF8" text-anchor="middle">${cleanSubtitle}</text>

  <!-- Phone Device Frame Outline & Shadow -->
  <rect x="${MOCKUP_X - 10}" y="${MOCKUP_Y - 10}" width="${MOCKUP_W + 20}" height="${MOCKUP_H + 20}" rx="64" ry="64" fill="#000000" stroke="#334155" stroke-width="6" filter="url(#shadow)" />

  <!-- iPad Home Indicator -->
  <rect x="824" y="${H_IPAD - 35}" width="400" height="10" rx="5" fill="#E2E8F0" fill-opacity="0.6" />
</svg>
  `);
}

async function generateIpad(phoneScreenshotPath, screen, outputPath) {
  // Load the generated iPhone 6.1" screenshot and scale it for the mockup frame
  const phoneScaled = await sharp(phoneScreenshotPath)
    .resize(MOCKUP_W, MOCKUP_H, { fit: 'fill', kernel: 'lanczos3' })
    // Rounded corners for the screen inside the phone frame
    .composite([
      {
        input: Buffer.from(`
          <svg width="${MOCKUP_W}" height="${MOCKUP_H}">
            <rect width="${MOCKUP_W}" height="${MOCKUP_H}" rx="54" ry="54" fill="#fff" />
          </svg>
        `),
        blend: 'dest-in'
      }
    ])
    .png()
    .toBuffer();

  const ipadLayoutSvg = createIpadLayoutSvg(screen);

  await sharp(ipadLayoutSvg)
    .composite([
      { input: phoneScaled, top: MOCKUP_Y, left: MOCKUP_X }
    ])
    .removeAlpha()
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);
}

// ----------------------------------------------------
// Main Execution
// ----------------------------------------------------
async function main() {
  console.log('=== Génération des captures App Store conformes Apple ===');
  console.log('1. iPhone 6.1" / 6.3" (1179 x 2556 px)');
  console.log('2. iPhone 6.7" / 6.9" (1290 x 2796 px)');
  console.log('3. iPad Pro 12.9" / 13" (2048 x 2732 px)');
  console.log('========================================================\n');

  for (const s of screens) {
    const inputPath = path.join(inputDir, s.input);
    if (!fs.existsSync(inputPath)) {
      console.warn(`[SKIP] Introuvable: ${inputPath}`);
      continue;
    }

    const cleanedBuffer = await cleanAndroidBars(inputPath, s.topColor, s.bottomColor);

    // 1. iPhone 6.1"
    const path61 = path.join(dirIphone61, s.name);
    await generateIphone61(cleanedBuffer, path61);
    const m61 = await sharp(path61).metadata();

    // Also mirror to root of ios_appstore for direct convenience
    const pathRoot = path.join(baseOutputDir, s.name);
    fs.copyFileSync(path61, pathRoot);

    // 2. iPhone 6.7"
    const path67 = path.join(dirIphone67, s.name);
    await generateIphone67(cleanedBuffer, path67);
    const m67 = await sharp(path67).metadata();

    // 3. iPad 12.9"
    const pathIpad = path.join(dirIpad, s.name);
    await generateIpad(path61, s, pathIpad);
    const mIpad = await sharp(pathIpad).metadata();

    console.log(`[SUCCÈS] ${s.name}:`);
    console.log(`  - iPhone 6.1" : ${m61.width} x ${m61.height} px (hasAlpha: ${m61.hasAlpha})`);
    console.log(`  - iPhone 6.7" : ${m67.width} x ${m67.height} px (hasAlpha: ${m67.hasAlpha})`);
    console.log(`  - iPad 12.9"  : ${mIpad.width} x ${mIpad.height} px (hasAlpha: ${mIpad.hasAlpha})\n`);
  }

  console.log('=== Toutes les captures ont été générées avec succès ! ===');
}

main().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});

