// GC Laser Cut static site generator.
// Run:  node src/build.js      (from the repository root)
// Reads src/home.html, src/content.json, src/site.json
// Writes every page into the repository root, ready for GitHub Pages.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'docs'); // GitHub Pages publishes from /docs; src/ and README stay private to the repo
const SITE = JSON.parse(fs.readFileSync(path.join(__dirname, 'site.json'), 'utf8'));
const C = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json'), 'utf8'));
const HOME_SRC = fs.readFileSync(path.join(__dirname, 'home.html'), 'utf8');
const BASE = SITE.url.replace(/\/$/, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = n => '$' + (Number(n) % 1 ? Number(n).toFixed(2) : Number(n).toFixed(0));
const write = (rel, html) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
const localise = html => html
  .replace(/https?:\/\/gclasercut\.com\/custom-qr-codes\/?/g, '/#work')
  .replace(/https?:\/\/gclasercut\.com\/(product|product-category|shop)\/[^"]*/g, '/#work')
  .replace(/https?:\/\/gclasercut\.com\/?(?=["#])/g, '/')
  .replace(/https?:\/\/gclasercut\.com\//g, '/')
  .replace(/href="\/#/g, 'href="/#');

// ---------- assets ----------
fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
fs.cpSync(path.join(__dirname, '..', 'assets'), path.join(ROOT, 'assets'), { recursive: true });
// ---------- shared chrome ----------
const css = HOME_SRC.match(/<style>([\s\S]*?)<\/style>/)[1];
const extraCss = fs.readFileSync(path.join(__dirname, 'pages.css'), 'utf8');
write('assets/site.css', css + '\n' + extraCss);

const header = `<header>
  <div class="wrap">
    <a class="logo" href="/" aria-label="GC Laser Cut home"><img src="/assets/logo.png" alt="GC Laser Cut" width="500" height="336"></a>
    <button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="mainNav">Menu</button>
    <nav id="mainNav" aria-label="Main"><ul>
      <li><a href="/#work">Our work</a></li>
      <li><a href="/#materials">Materials</a></li>
      <li><a href="/services/">Services</a></li>
      <li><a href="/pricing/">Pricing</a></li>
      <li><a href="/blog/">Guides</a></li>
      <li><a href="/about/">About</a></li>
      <li><a href="/contact-us/">Contact</a></li>
    </ul></nav>
    <a class="btn primary head-cta" href="/contact-us/">Get a quote</a>
  </div>
</header>`;

const footer = `<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <img src="/assets/logo.png" alt="GC Laser Cut" width="500" height="336">
        <p>Laser cutting and engraving in Coomera, Gold Coast. MDF, acrylic, vinyl, leather, thin polycarbonate and timber. No metal.</p>
        <p style="margin-top:.6rem">${SITE.phoneDisplay}<br>${SITE.email}</p>
        ${SITE.social.length ? '<p style="margin-top:.6rem">' + SITE.social.map(s => `<a href="${s.url}">${esc(s.name)}</a>`).join(' &nbsp;·&nbsp; ') + '</p>' : ''}
      </div>
      <div><h3>Site</h3><ul>
        <li><a href="/">Home</a></li><li><a href="/about/">About</a></li><li><a href="/services/">Services</a></li>
        <li><a href="/3d-signs/">3D Signs</a></li><li><a href="/layered-artwork/">Layered Artwork</a></li>
        <li><a href="/pricing/">Pricing</a></li><li><a href="/blog/">Blog and guides</a></li><li><a href="/contact-us/">Contact</a></li><li><a href="/whats-new/">What's new</a></li>
      </ul></div>
      <div><h3>Materials</h3><ul>
        <li><a href="/#materials">MDF, 3 to 12 mm</a></li><li><a href="/#materials">Acrylic, 2 to 10 mm</a></li><li><a href="/#materials">Vinyl, PVC-free</a></li>
        <li><a href="/#materials">Leather, 1 to 5 mm</a></li><li><a href="/#materials">Thin polycarbonate, 1 to 3 mm</a></li><li><a href="/#materials">Timber, 3 to 18 mm</a></li>
        <li><a href="/#no-metals">No metal</a></li>
      </ul></div>
      <div><h3>Guides</h3><ul>
        ${C.posts.slice(0, 7).map(p => `<li><a href="/${p.slug}/">${esc(shortTitle(p.title))}</a></li>`).join('')}
      </ul></div>
    </div>
    <div class="legal">
      <span>© ${new Date().getFullYear()} GC Laser Cut, Coomera QLD 4209</span>
      <span><a href="/privacy-policy/">Privacy Policy</a> &nbsp;·&nbsp; <a href="/terms-and-conditions/">Terms and Conditions</a></span>
    </div>
  </div>
</footer>`;

function shortTitle(t) { return t.replace(/:.*$/, '').replace(/ - .*$/, '').replace(/\?$/, '?'); }

const tracking = (SITE.gtmId ? `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${SITE.gtmId}');</script>` : '') +
  (SITE.fbPixelId ? `\n<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${SITE.fbPixelId}');fbq('track','PageView');</script>` : '');

const csp = [
  "default-src 'self'",
  "script-src 'self'" + (SITE.gtmId ? " 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com" : '') + (SITE.fbPixelId ? " 'unsafe-inline' https://connect.facebook.net" : ''),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:" + (SITE.gtmId ? ' https://www.google-analytics.com https://www.googletagmanager.com' : '') + (SITE.fbPixelId ? ' https://www.facebook.com' : ''),
  "connect-src 'self' https://formspree.io" + (SITE.gtmId ? ' https://www.google-analytics.com https://www.googletagmanager.com' : '') + (SITE.fbPixelId ? ' https://www.facebook.com' : ''),
  "form-action 'self' https://formspree.io",
  "base-uri 'self'", "object-src 'none'", "frame-src 'none'", "upgrade-insecure-requests"
].join('; ');
const banner = `<div class="notice" id="siteNotice" hidden><div class="wrap"><p><strong>Same GC Laser Cut, new website.</strong> We rebuilt gclasercut.com in November 2026. Same workshop, phone and email. <a href="/whats-new/">See what changed</a></p><button type="button" id="noticeClose" aria-label="Dismiss">Got it</button></div></div>`;
function layout({ title, desc, path: p, body, image, schema, noindex }) {
  const url = BASE + p;
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="icon" href="/assets/logo.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GC Laser Cut">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASE}${image || '/assets/g-clock.jpg'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,400..900;1,62..125,400..900&display=swap">
<link rel="stylesheet" href="/assets/site.css">
${(schema || []).map(s => '<script type="application/ld+json">' + JSON.stringify(s) + '</script>').join('\n')}
${tracking}
</head>
<body>
${header}
${banner}
<main id="top">
${body}
</main>
${footer}
<script src="/assets/site.js"></script>
</body>
</html>
`;
}

const business = {
  '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': BASE + '/#business', name: 'GC Laser Cut', url: BASE + '/',
  telephone: SITE.phoneE164, email: SITE.email, image: BASE + '/assets/logo.png', priceRange: '$$',
  address: { '@type': 'PostalAddress', addressLocality: 'Coomera', addressRegion: 'QLD', postalCode: '4209', addressCountry: 'AU' },
  areaServed: SITE.areas, openingHours: 'Mo-Fr 09:00-17:00',
  description: 'CO2 laser cutting and engraving for MDF, acrylic, vinyl, leather, thin polycarbonate and timber. No metal.',
  sameAs: SITE.social.map(s => s.url)
};
const crumbs = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: BASE + it[1] })) });
const breadcrumbHtml = items => `<nav class="crumbs" aria-label="Breadcrumb">${items.map((it, i) => i === items.length - 1 ? `<span>${esc(it[0])}</span>` : `<a href="${it[1]}">${esc(it[0])}</a>`).join(' <span aria-hidden="true">/</span> ')}</nav>`;
const cta = (h = 'Need this cut?', p = 'Send us a file or a sketch. Quotes within 24 hours, and we tell you up front if a material or thickness will not work.') =>
  `<aside class="cta"><div><h2>${h}</h2><p>${p}</p></div><a class="btn primary" href="/contact-us/">Get a quote</a></aside>`;
const noMetal = `<p class="aside">GC Laser Cut cuts timber, MDF, acrylic, PVC-free vinyl, leather and thin polycarbonate on a 130 W CO2 laser. We do not cut metal of any kind.</p>`;

// ---------- home ----------
{
  let body = HOME_SRC.replace(/^[\s\S]*?<\/style>\s*/, '').replace(/<header>[\s\S]*?<\/header>\s*/, '').replace(/<footer>[\s\S]*?<\/footer>\s*/, '').replace(/<script>[\s\S]*<\/script>\s*$/, '');
  body = body.replace(/<main id="top">\s*/, '').replace(/<\/main>\s*$/, '');
  body = localise(body).replace(/src="assets\//g, 'src="/assets/');
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: SITE.faq.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) };
  write('index.html', layout({ title: 'Laser Cutting Coomera, Gold Coast | GC Laser Cut', desc: 'GC Laser Cut, Coomera. 130 W CO2 laser cutting and engraving for MDF, acrylic, vinyl, leather, thin polycarbonate and timber. No metal. Quotes in 24 hours.', path: '/', body, schema: [business, faq] }));
}

// ---------- simple pages ----------
function pageShell(title, lede, inner, crumbList) {
  return `<section class="page"><div class="wrap narrow">${breadcrumbHtml(crumbList)}<h1>${esc(title)}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}<div class="prose">${inner}</div></div></section>`;
}
const fix = (html, pairs) => { let h = localise(html); for (const [a, b] of pairs) h = h.replace(a, b); return h; };

// About
{
  const src = C.pages.find(p => p.slug === 'about').html;
  let inner = fix(src, [[/^\s*<h2>About GC Laser Cut<\/h2>/, ''], [/<a href="\/contact-us\/">\s*Contact Us\s*<\/a>/, ''], [/<h3>Our Story<\/h3>\s*/, '<h3>Our Story</h3><p>GC Laser Cut started in Coomera in 2023 with one 130 W CO2 laser and a simple rule: do the materials that machine cuts best, and do them properly. That means timber, MDF, acrylic, PVC-free vinyl, leather and thin polycarbonate, and nothing else. We do not cut metal.</p>']]);
  inner = inner.replace(/myriad of applications\./, 'myriad of applications in timber, MDF, acrylic, vinyl, leather and thin polycarbonate.');
  write('about/index.html', layout({ title: 'About GC Laser Cut | Laser Cutting in Coomera', desc: 'GC Laser Cut is a Coomera workshop cutting and engraving timber, MDF, acrylic, vinyl, leather and thin polycarbonate on a 130 W CO2 laser. No metal.', path: '/about/', body: pageShell('About GC Laser Cut', 'A small workshop on the northern Gold Coast, built around one laser and the materials it cuts best.', inner + cta('Want to work with us?', 'Tell us what you are making and we will tell you how we would cut it.'), [['Home', '/'], ['About', '/about/']]), schema: [business, crumbs([['Home', '/'], ['About', '/about/']])] }));
}

// 3D signs, layered artwork
for (const [slug, title, desc, pairs, lede] of [
  ['3d-signs', '3D Signs and Laser-Cut Signage in Queensland', 'Dimensional 3D signs and laser-cut signage in acrylic, MDF and timber by GC Laser Cut, Coomera, Gold Coast. LED-lit options for shopfronts, cafes and events.',
    [[/^\s*<h2>3D Signs<\/h2>\s*<h2><strong>[^<]*<\/strong><\/h2>/, ''], [/From acrylics and metals to wood/, 'From clear and coloured acrylic to MDF and timber'], [/materials are chosen/, 'materials are chosen for how well they cut on a CO2 laser, as well as']],
    'Raised lettering, layered logos and LED-lit acrylic for shopfronts, counters and events.'],
  ['layered-artwork', 'Layered Artwork in Queensland', 'Multi-layer laser-cut artwork in timber, MDF and acrylic by GC Laser Cut, Coomera. Mandalas, mirrors, clocks and custom pieces up to 80 cm.',
    [[/^\s*<h2>Layered Artwork in QLD<\/h2>\s*<h2><strong>[^<]*<\/strong><\/h2>/, ''], [/From wood and acrylic to metal/, 'From plywood and MDF to acrylic and mirror']],
    'Depth and shadow from stacked laser-cut layers. Mandalas, mirrors, clocks and one-off commissions.']
]) {
  const src = C.pages.find(p => p.slug === slug).html;
  const inner = fix(src, pairs);
  const gallery = slug === 'layered-artwork'
    ? [['g-clock', 'Layered laser-cut clock'], ['g-mandala', 'Layered laser-cut mandala'], ['g-guitar', 'Layered laser-cut guitar artwork'], ['g-boho-mirror', 'Layered laser-cut boho mirror']].map(([g, alt]) => `<a class="work" href="/#work"><img src="/assets/${g}.jpg" alt="${alt}" loading="lazy"></a>`).join('')
    : [['g-led', 'Round LED-lit Collingwood Football Club sign in a black timber frame'], ['g-qr', 'Acrylic QR code sign lit from a timber base'], ['g-lamp', 'Round engraved acrylic calligraphy lamp on a timber base, lit'], ['s-led', 'LED-lit engraved acrylic sign in a timber frame']].map(([g, alt]) => `<a class="work" href="/#work"><img src="/assets/${g}.jpg" alt="${alt}" loading="lazy"></a>`).join('');
  write(slug + '/index.html', layout({ title: title + ' | GC Laser Cut', desc, path: '/' + slug + '/', body: pageShell(title, lede, `<div class="work-grid four">${gallery}</div>` + inner + cta(), [['Home', '/'], ['Services', '/services/'], [title, '/' + slug + '/']]), schema: [crumbs([['Home', '/'], ['Services', '/services/'], [title, '/' + slug + '/']])] }));
}

// Services
{
  const svc = HOME_SRC.match(/<div class="svc-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/)[0].replace(/\s*<\/div>\s*<\/section>$/, '');
  const inner = `<div class="svc-wrap">${localise(svc).replace(/src="assets\//g, 'src="/assets/')}</div>
  <h2>How we work</h2>
  <p>Send a DXF, SVG, AI or PDF drawn at 1:1 in millimetres, or a sketch and the sizes you need. We check the file for kerf, tabs and nesting, quote within 24 hours, and cut once you approve. Most jobs are ready in 3 to 5 working days. Collect from Coomera or we post anywhere in Australia.</p>
  <h2>What we do not do</h2>
  <p>We do not cut metal of any kind: no steel, stainless, aluminium, brass or copper. We also do not cut PVC, chlorinated vinyl, fibreglass, ABS or polycarbonate over 3 mm, because they are unsafe to laser or damage the machine. For those jobs we will happily point you to a local metal cutter or router shop.</p>
  <p>See <a href="/pricing/">pricing</a>, the <a href="/#materials">materials and thicknesses we cut</a>, and the <a href="/#faq">questions we get asked most</a>.</p>`;
  write('services/index.html', layout({ title: 'Laser Cutting and Engraving Services | GC Laser Cut Coomera', desc: 'Laser cutting, engraving, stencils, layered artwork, 3D and LED signage and file help from GC Laser Cut, Coomera. Timber, MDF, acrylic, vinyl and leather.', path: '/services/', body: pageShell('Laser cutting and engraving services in Coomera', 'Cutting, engraving, stencils, layered artwork, signage and file help, all from one Coomera workshop.', inner + cta(), [['Home', '/'], ['Services', '/services/']]), schema: [crumbs([['Home', '/'], ['Services', '/services/']])] }));
}

// Pricing
{
  const pricing = HOME_SRC.match(/<h2>Pricing<\/h2>[\s\S]*?<p class="note">[\s\S]*?<\/p>/)[0].replace(/<h2>Pricing<\/h2>/, '');
  const inner = pricing.replace(/<h3>Examples from recent custom jobs<\/h3>/, '<h3>Examples from recent custom jobs</h3><p class="note" style="margin-top:.4rem">We do not sell ready-made products. Every price below was a one-off or small-batch custom job, shown so you can judge what a similar piece might cost.</p>') + `<h2>How a quote is worked out</h2>
  <p>Every quote is machine time plus material plus any setup. Machine time is what the laser actually spends cutting or engraving your file, so a simple outline in 3 mm MDF is quick and cheap, while a dense engraving or thick acrylic takes longer. We nest parts tightly to keep sheet waste down, and we tell you before starting if a change to the design would make it cheaper.</p>
  <p>Material is quoted separately at cost, or bring your own sheet as long as it is laser-safe. There is no minimum quantity. Shipping is at cost and confirmed in the quote.</p>`;
  write('pricing/index.html', layout({ title: 'Laser Cutting Prices | GC Laser Cut Coomera', desc: 'Laser cutting from $65 per hour of machine time plus $20 setup for a new design. 10% off jobs over 10 hours. Example prices for stencils, signs and dog tags.', path: '/pricing/', body: pageShell('Laser cutting prices', 'Simple hourly pricing, a one-off setup fee, and real examples from the shop.', inner + cta('Want a fixed price?', 'Send the file and the material and we will quote it within 24 hours.'), [['Home', '/'], ['Pricing', '/pricing/']]), schema: [crumbs([['Home', '/'], ['Pricing', '/pricing/']])] }));
}

// Contact
{
  const form = HOME_SRC.match(/<form id="quoteForm"[\s\S]*?<\/form>/)[0];
  const details = HOME_SRC.match(/<ul class="cdetails">[\s\S]*?<\/ul>/)[0].replace(/<button class="copy"[^>]*>Copy<\/button>/g, '');
  const inner = `<div class="contact-grid"><div>${details}<p class="areas">Pick-up from the Coomera workshop by appointment, or we post anywhere in Australia. Serving ${SITE.areas.slice(0, 10).join(', ')} and the wider Gold Coast.</p></div>${form}</div>`;
  write('contact-us/index.html', layout({ title: 'Contact GC Laser Cut | Get a Laser Cutting Quote', desc: 'Request a laser cutting or engraving quote from GC Laser Cut, Coomera QLD. Phone 0456 267 249 or email gclasercutting@gmail.com. Quotes within 24 hours.', path: '/contact-us/', body: `<section class="page contact"><div class="wrap">${breadcrumbHtml([['Home', '/'], ['Contact', '/contact-us/']])}<h1>Get a laser cutting quote</h1><p class="lede">Tell us the material, thickness and what you need. We reply within 24 hours.</p>${inner}</div></section>`, schema: [business, crumbs([['Home', '/'], ['Contact', '/contact-us/']])] }));
  write('contact/index.html', `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/contact-us/"><link rel="canonical" href="${BASE}/contact-us/"><title>Redirecting</title><a href="/contact-us/">Contact us</a>`);
}

// Privacy, terms
for (const [slug, title] of [['privacy-policy', 'Privacy Policy'], ['terms-and-conditions', 'Terms and Conditions']]) {
  const src = C.pages.find(p => p.slug === slug).html;
  const inner = localise(src).replace(/^\s*<h2>[^<]*<\/h2>\s*<h2><strong>[^<]*<\/strong><\/h2>/, '');
  write(slug + '/index.html', layout({ title: title + ' | GC Laser Cut', desc: title + ' for the GC Laser Cut website and services.', path: '/' + slug + '/', body: pageShell(title, '', inner, [['Home', '/'], [title, '/' + slug + '/']]) }));
}

// ---------- blog ----------
const posts = [...C.posts].sort((a, b) => b.date.localeCompare(a.date));
const coverAlt = p => esc(p.seoTitle || p.title); // alt text for a post's cover image
function postCard(p) {
  return `<a class="guide" href="/${p.slug}/"><img src="${p.cover || '/assets/hero.jpg'}" alt="${coverAlt(p)}" width="720" height="450" loading="lazy"><div class="body"><time datetime="${p.date}">${fmtDate(p.date)}</time><strong>${esc(p.title)}</strong><span>${esc(p.desc.slice(0, 140))}${p.desc.length > 140 ? '…' : ''}</span></div></a>`;
}
function fmtDate(d) { const [y, m, dd] = d.split('-'); return `${Number(dd)} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Number(m) - 1]} ${y}`; }
write('blog/index.html', layout({ title: 'Laser Cutting Guides and Blog | GC Laser Cut', desc: 'Guides on laser cutting acrylic, polycarbonate, vinyl, timber and stencils, plus gift ideas, from the GC Laser Cut workshop in Coomera.', path: '/blog/', body: `<section class="page"><div class="wrap">${breadcrumbHtml([['Home', '/'], ['Blog', '/blog/']])}<h1>Guides from the workshop</h1><p class="lede">What we have learned cutting these materials every day, written up for customers and makers.</p><div class="guide-grid" style="margin-top:2rem">${posts.map(postCard).join('')}</div></div></section>`, schema: [crumbs([['Home', '/'], ['Blog', '/blog/']])] }));
for (const p of posts) {
  let html = localise(p.html);
  html = html.replace(/^[\s\S]*?\d{1,2} \w+ \d{4}\s*/, ''); // strip breadcrumb, duplicated title, byline, date
  html = html.replace(/<h2>Post navigation<\/h2>[\s\S]*$/, '').replace(/<h2>Similar Posts<\/h2>[\s\S]*$/, '');
  const related = posts.filter(x => x.slug !== p.slug).sort(() => 0.5).slice(0, 3);
  const body = `<article class="page"><div class="wrap narrow">${breadcrumbHtml([['Home', '/'], ['Blog', '/blog/'], [shortTitle(p.title), '/' + p.slug + '/']])}<h1>${esc(p.title)}</h1><p class="meta">By GC Laser Cut, Coomera · <time datetime="${p.date}">${fmtDate(p.date)}</time></p>${p.cover ? `<img class="cover" src="${p.cover}" alt="${coverAlt(p)}" width="1200" height="750">` : ''}${noMetal}<div class="prose">${html}</div>${cta()}<h2 class="related-h">More guides</h2><div class="guide-grid three">${related.map(postCard).join('')}</div></div></article>`;
  const article = { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, datePublished: p.date, dateModified: p.date, image: p.cover ? BASE + p.cover : undefined, author: { '@type': 'Organization', name: 'GC Laser Cut' }, publisher: { '@type': 'Organization', name: 'GC Laser Cut', logo: { '@type': 'ImageObject', url: BASE + '/assets/logo.png' } }, mainEntityOfPage: BASE + '/' + p.slug + '/' };
  write(p.slug + '/index.html', layout({ title: (p.seoTitle || p.title) + ' | GC Laser Cut', desc: p.desc, path: '/' + p.slug + '/', body, image: p.cover, schema: [article, crumbs([['Home', '/'], ['Blog', '/blog/'], [shortTitle(p.title), '/' + p.slug + '/']])] }));
}
// redirect for the removed metal post
write('iron-laser-cutting-designs/index.html', `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/#materials"><link rel="canonical" href="${BASE}/#materials"><meta name="robots" content="noindex"><title>Redirecting</title><p>This post has been removed. GC Laser Cut does not cut metal. <a href="/#materials">See the materials we cut</a>.</p>`);

// ---------- old shop addresses redirect to the work gallery ----------
const redirect = (rel, to) => write(rel, `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${BASE}${to}"><meta name="robots" content="noindex"><title>Redirecting</title><p>This is still GC Laser Cut. The online shop has closed and everything is now made to order. <a href="${to}">See what changed</a>.</p>`);
for (const rel of ['shop', 'basket', 'checkout']) redirect(rel + '/index.html', '/whats-new/');
redirect('my-account/index.html', '/whats-new/');
for (const pr of C.products) redirect(`product/${pr.slug}/index.html`, '/whats-new/');
for (const slug of ['3d-mandala', 'mirrors', 'weddings', 'photo-frame', 'stencil', 'led-lamps', 'tags', 'dog-tag', 'business-products', 'uncategorised']) redirect(`product-category/${slug}/index.html`, '/whats-new/');

// ---------- what's new ----------
{
  const inner = `
  <p>If you have used us before, this site will look different from the one you remember. It is still GC Laser Cut, the same workshop in Coomera, the same 130 W CO2 laser, the same phone number and email. We rebuilt the website in November 2026 and this page explains what changed.</p>
  <h2>What is the same</h2>
  <ul>
    <li>Same business, same people, same workshop in Coomera QLD 4209.</li>
    <li>Same phone, ${SITE.phoneDisplay}, and same email, ${SITE.email}.</li>
    <li>Same materials: MDF, acrylic, vinyl, leather, thin polycarbonate and timber. Still no metal.</li>
    <li>Same pricing: $65 an hour of machine time, $20 setup for a new design.</li>
    <li>Every guide from the old blog is still here at the same web address.</li>
  </ul>
  <h2>What changed</h2>
  <ul>
    <li><strong>No online shop.</strong> We no longer sell ready-made products through the site. Everything is made to order. Browse <a href="/#work">our recent work</a>, then <a href="/contact-us/">ask for a quote</a> and we will make yours.</li>
    <li><strong>A clearer materials list.</strong> Thicknesses for every material and a plain statement that we do not cut metal, so nobody wastes an email.</li>
    <li><strong>A new quote form</strong> that confirms on the page and reaches us within seconds.</li>
    <li><strong>Faster and safer.</strong> The old site ran on WordPress with a dozen plugins. This one is plain pages served from GitHub, so it loads in under a second and has nothing to hack.</li>
    <li><strong>A new look.</strong> Dark workshop theme, our real work in the gallery, and a small laser that scores patterns into the background while you read.</li>
  </ul>
  <h2>Had an order or account on the old site?</h2>
  <p>Old product pages, the basket and the account area now redirect here. If you had an order in progress or need a copy of a past invoice, email ${SITE.email} with your name and roughly when you ordered, and we will dig it out of the old records.</p>
  <h2>Something missing?</h2>
  <p>If you came looking for a page or product that is not here, <a href="/contact-us/">tell us</a>. Most of the old content was folded into the pages above, and we can point you to it.</p>`;
  write('whats-new/index.html', layout({ title: "What's new on the GC Laser Cut website", desc: 'Same Coomera laser cutting workshop, new website. What stayed the same, what changed, and what to do if you had an order on the old site.', path: '/whats-new/', body: pageShell("Same workshop, new website", 'What changed on gclasercut.com in November 2026, and what did not.', inner + cta('Need something cut?', 'Send a file or a photo of something similar and we will quote it within 24 hours.'), [['Home', '/'], ["What's new", '/whats-new/']]), schema: [crumbs([['Home', '/'], ["What's new", '/whats-new/']])] }));
}

// ---------- misc ----------
write('404.html', layout({ title: 'Page not found | GC Laser Cut', desc: 'That page does not exist.', path: '/404.html', noindex: true, body: `<section class="page"><div class="wrap narrow"><h1>That page is not here.</h1><p class="lede">It may have moved when we rebuilt the site. Try one of these.</p><ul class="biglinks"><li><a href="/">Home</a></li><li><a href="/#materials">Materials we cut</a></li><li><a href="/#work">Our work</a></li><li><a href="/blog/">Guides</a></li><li><a href="/contact-us/">Get a quote</a></li></ul></div></section>` }));
const urls = ['/', '/whats-new/', '/about/', '/services/', '/pricing/', '/3d-signs/', '/layered-artwork/', '/contact-us/', '/privacy-policy/', '/terms-and-conditions/', '/blog/', ...posts.map(p => '/' + p.slug + '/')];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${BASE}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
write('CNAME', SITE.domain + '\n');
write('.nojekyll', '');
console.log('built', urls.length, 'pages');
