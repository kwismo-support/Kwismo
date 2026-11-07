const fs = require('fs');
const path = require('path');
const sharp = require('../node_modules/sharp');

const inputDir = path.resolve(__dirname, '../../maquettes/mobile');
const outputDir = path.resolve(__dirname, '../../maquettes/ios_appstore');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// List of screens to convert into official App Store screenshots
const screens = [
  {
    input: 'Home.png',
    output: '01_Accueil_Recherche_Et_Detection.png',
    title: 'Détection d\'appels et recherche de numéros',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'Gestion.png',
    output: '02_Protection_Anti_Fraude_Et_Spam.png',
    title: 'Protection contre les arnaques et spams',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'Manage_My_contacts.png',
    output: '03_Gestion_Contacts_Et_Confiance.png',
    title: 'Analyse et sécurisation de vos contacts',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'Verification_Number.png',
    output: '04_Analyse_Detaillee_Numero.png',
    title: 'Score de fiabilité et réputation',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'profil n security page.png',
    output: '05_Securite_Et_Parametres.png',
    title: 'Paramètres de sécurité avancés',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'invite_friends.png',
    output: '06_Protection_Communaute_Kwismo.png',
    title: 'Protection collaborative et alertes',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  },
  {
    input: 'Welcome.png',
    output: '07_Bienvenue_Kwismo.png',
    title: 'Bienvenue sur Kwismo',
    topColor: '#37B282',
    bottomColor: '#FAFAFA'
  }
];

// Target iPhone 6.7" Super Retina XDR resolution (standard App Store format)
const TARGET_WIDTH = 1290;
const TARGET_HEIGHT = 2796;

function createIosTopSvg(isDark = false) {
  const iconColor = isDark ? '#1F2937' : '#FFFFFF';
  return Buffer.from(`
<svg width="${TARGET_WIDTH}" height="200" viewBox="0 0 ${TARGET_WIDTH} 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Dynamic Island -->
  <rect x="460" y="35" width="370" height="95" rx="47.5" ry="47.5" fill="#000000" />
  <circle cx="780" cy="82.5" r="16" fill="#111827" />
  <circle cx="780" cy="82.5" r="8" fill="#1E293B" />
  <circle cx="510" cy="82.5" r="12" fill="#0F172A" />

  <!-- Time 9:41 -->
  <text x="145" y="98" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="44" font-weight="600" fill="${iconColor}" text-anchor="middle">9:41</text>

  <!-- Cellular Signal (4 bars) -->
  <g transform="translate(1040, 68)">
    <rect x="0" y="24" width="6" height="12" rx="2" fill="${iconColor}" />
    <rect x="11" y="18" width="6" height="18" rx="2" fill="${iconColor}" />
    <rect x="22" y="10" width="6" height="26" rx="2" fill="${iconColor}" />
    <rect x="33" y="0" width="6" height="36" rx="2" fill="${iconColor}" />
  </g>

  <!-- Wi-Fi Icon -->
  <g transform="translate(1100, 68)">
    <path d="M18 7.5C12.5 7.5 7.5 9.7 3.8 13.3L1.5 11C5.8 6.7 11.6 4 18 4C24.4 4 30.2 6.7 34.5 11L32.2 13.3C28.5 9.7 23.5 7.5 18 7.5ZM18 15C14.4 15 11.2 16.5 8.8 18.9L6.5 16.6C9.5 13.6 13.5 11.8 18 11.8C22.5 11.8 26.5 13.6 29.5 16.6L27.2 18.9C24.8 16.5 21.6 15 18 15ZM18 22.5C16.3 22.5 14.8 23.2 13.7 24.3L18 28.6L22.3 24.3C21.2 23.2 19.7 22.5 18 22.5Z" fill="${iconColor}" />
  </g>

  <!-- Battery Icon (100%) -->
  <g transform="translate(1160, 71)">
    <rect x="0" y="0" width="68" height="32" rx="8" fill="none" stroke="${iconColor}" stroke-width="3.5" />
    <rect x="5" y="5" width="58" height="22" rx="4" fill="${iconColor}" />
    <path d="M72 10C73.5 10 74.5 11.5 74.5 13V19C74.5 20.5 73.5 22 72 22V10Z" fill="${iconColor}" />
  </g>
</svg>
  `);
}

function createIosBottomSvg(isLightBottom = true) {
  const barColor = isLightBottom ? '#000000' : '#FFFFFF';
  return Buffer.from(`
<svg width="${TARGET_WIDTH}" height="80" viewBox="0 0 ${TARGET_WIDTH} 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="435" y="42" width="420" height="15" rx="7.5" fill="${barColor}" fill-opacity="0.85" />
</svg>
  `);
}

async function convertScreen(screen) {
  const inputPath = path.join(inputDir, screen.input);
  const outputPath = path.join(outputDir, screen.output);

  if (!fs.existsSync(inputPath)) {
    console.warn(`File not found: ${inputPath}`);
    return;
  }

  // Cover the Android status bar (0..35) with the top background color
  // and the Android bottom bar (880..917) with the bottom background color
  const coverTop = Buffer.from(`<svg width="412" height="40"><rect width="412" height="40" fill="${screen.topColor}"/></svg>`);
  const coverBottom = Buffer.from(`<svg width="412" height="40"><rect width="412" height="40" fill="${screen.bottomColor}"/></svg>`);

  const cleaned = await sharp(inputPath)
    .composite([
      { input: coverTop, top: 0, left: 0 },
      { input: coverBottom, top: 917 - 40, left: 0 }
    ])
    .toBuffer();

  // Resize precisely to 1290 x 2796 using lanczos3 filter
  const resized = await sharp(cleaned)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'fill', kernel: 'lanczos3' })
    .toBuffer();

  // Overlay iOS Status Bar & Home Indicator
  const iosTop = createIosTopSvg(false);
  const iosBottom = createIosBottomSvg(true);

  await sharp(resized)
    .composite([
      { input: iosTop, top: 0, left: 0 },
      { input: iosBottom, top: TARGET_HEIGHT - 80, left: 0 }
    ])
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  console.log(`[OK] Generated: ${screen.output} (${meta.width}x${meta.height})`);
}

async function main() {
  console.log('--- Generating iOS App Store Screenshots (1290 x 2796) ---');
  for (const s of screens) {
    await convertScreen(s);
  }
  console.log('--- All screenshots generated successfully in maquettes/ios_appstore ---');
}

main().catch(err => {
  console.error('Error generating screenshots:', err);
  process.exit(1);
});

