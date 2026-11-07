const fs = require('fs');
const path = require('path');
const sharp = require('../node_modules/sharp');

const outDir = path.resolve(__dirname, '../../maquettes/ios_appstore');
const homeScreenshot = path.resolve(__dirname, '../../maquettes/ios_appstore/01_Accueil_Recherche_Et_Detection.png');

async function generateArtwork() {
  console.log('--- Generating App Store Product Page Artworks (3840x1646 & 5244x2950) ---');

  // Load the home screenshot and resize it as a phone showcase
  // Phone dimensions inside 3840x1646: height ~ 1400px, width ~ 646px
  const phone3840 = await sharp(homeScreenshot)
    .resize(646, 1400, { fit: 'fill' })
    .toBuffer();

  // 1. Generate 3840 x 1646 (21:9 Header)
  const svg3840 = Buffer.from(`
<svg width="3840" height="1646" viewBox="0 0 3840 1646" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E1726" />
      <stop offset="50%" stop-color="#161E33" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#064E3B" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="3840" height="1646" fill="url(#bgGrad)" />
  <rect width="3840" height="1646" fill="url(#glow)" />

  <!-- Grid accent lines -->
  <circle cx="3000" cy="823" r="700" fill="none" stroke="#10B981" stroke-width="2" stroke-opacity="0.2" />
  <circle cx="3000" cy="823" r="500" fill="none" stroke="#10B981" stroke-width="2" stroke-opacity="0.15" />

  <!-- Branding Badge -->
  <rect x="240" y="380" width="320" height="60" rx="30" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="2" />
  <text x="400" y="422" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="700" fill="#10B981" text-anchor="middle" letter-spacing="3">SÉCURITÉ MOBILE</text>

  <!-- Big Title -->
  <text x="240" y="580" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="140" font-weight="900" fill="#FFFFFF" letter-spacing="-2">Kwismo</text>

  <!-- Subtitle -->
  <text x="240" y="720" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="52" font-weight="700" fill="#E2E8F0">Identification d'appels &amp; Détection anti-fraude</text>

  <!-- Description Bullets -->
  <g transform="translate(240, 840)">
    <!-- Bullet 1 -->
    <circle cx="20" cy="20" r="14" fill="#10B981" />
    <path d="M14 20L18 24L26 16" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <text x="55" y="28" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" font-size="34" font-weight="500" fill="#CBD5E1">Identifiez instantanément les numéros inconnus</text>

    <!-- Bullet 2 -->
    <circle cx="20" cy="90" r="14" fill="#10B981" />
    <path d="M14 90L18 94L26 86" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <text x="55" y="98" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" font-size="34" font-weight="500" fill="#CBD5E1">Score de confiance et protection contre les arnaques</text>

    <!-- Bullet 3 -->
    <circle cx="20" cy="160" r="14" fill="#10B981" />
    <path d="M14 160L18 164L26 156" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <text x="55" y="168" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" font-size="34" font-weight="500" fill="#CBD5E1">Signalement communautaire et carnet de confiance</text>
  </g>

  <!-- Phone Frame Shadow & Border -->
  <rect x="2740" y="113" width="666" height="1420" rx="60" fill="#000000" fill-opacity="0.6" filter="blur(30px)" />
  <rect x="2750" y="123" width="646" height="1400" rx="55" fill="none" stroke="#334155" stroke-width="6" />
</svg>
  `);

  const artwork3840Path = path.join(outDir, 'Kwismo_AppStore_Header_3840x1646.png');
  await sharp(svg3840)
    .composite([
      { input: phone3840, top: 123, left: 2750 }
    ])
    .flatten({ background: '#0E1726' }) // Ensure strictly NO alpha / transparency
    .png({ quality: 100 })
    .toFile(artwork3840Path);

  console.log('[OK] Generated:', artwork3840Path);

  // 2. Generate 5244 x 2950 (16:9 Universal Product Page Artwork)
  const phone5244 = await sharp(homeScreenshot)
    .resize(1150, 2490, { fit: 'fill' })
    .toBuffer();

  const svg5244 = Buffer.from(`
<svg width="5244" height="2950" viewBox="0 0 5244 2950" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E1726" />
      <stop offset="50%" stop-color="#161E33" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
    <radialGradient id="glow2" cx="75%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#064E3B" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="5244" height="2950" fill="url(#bgGrad2)" />
  <rect width="5244" height="2950" fill="url(#glow2)" />

  <!-- Circles -->
  <circle cx="3900" cy="1475" r="1100" fill="none" stroke="#10B981" stroke-width="3" stroke-opacity="0.2" />
  <circle cx="3900" cy="1475" r="800" fill="none" stroke="#10B981" stroke-width="2" stroke-opacity="0.15" />

  <!-- Badge -->
  <rect x="400" y="700" width="460" height="90" rx="45" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="3" />
  <text x="630" y="760" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" font-size="40" font-weight="700" fill="#10B981" text-anchor="middle" letter-spacing="4">SÉCURITÉ MOBILE</text>

  <!-- Big Title -->
  <text x="400" y="1020" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" font-size="230" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Kwismo</text>

  <!-- Subtitle -->
  <text x="400" y="1230" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" font-size="82" font-weight="700" fill="#E2E8F0">Identification d'appels &amp; Détection anti-fraude</text>

  <!-- Bullets -->
  <g transform="translate(400, 1420)">
    <circle cx="30" cy="30" r="22" fill="#10B981" />
    <path d="M22 30L27 35L38 24" stroke="#FFFFFF" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <text x="80" y="42" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" font-size="52" font-weight="500" fill="#CBD5E1">Identifiez instantanément les numéros inconnus</text>

    <circle cx="30" cy="140" r="22" fill="#10B981" />
    <path d="M22 140L27 145L38 134" stroke="#FFFFFF" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <text x="80" y="152" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" font-size="52" font-weight="500" fill="#CBD5E1">Score de confiance et protection contre les arnaques</text>

    <circle cx="30" cy="250" r="22" fill="#10B981" />
    <path d="M22 250L27 255L38 244" stroke="#FFFFFF" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <text x="80" y="262" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" font-size="52" font-weight="500" fill="#CBD5E1">Signalement communautaire et carnet de confiance</text>
  </g>
</svg>
  `);

  const artwork5244Path = path.join(outDir, 'Kwismo_AppStore_Artwork_5244x2950.png');
  await sharp(svg5244)
    .composite([
      { input: phone5244, top: 230, left: 3450 }
    ])
    .flatten({ background: '#0E1726' }) // Ensure strictly NO alpha / transparency
    .png({ quality: 100 })
    .toFile(artwork5244Path);

  console.log('[OK] Generated:', artwork5244Path);
}

generateArtwork().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

