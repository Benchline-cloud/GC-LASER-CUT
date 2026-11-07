// GC Laser Cut static site generator.
// Run:  node src/build.js      (from the repository root)
// Reads src/home.html, src/content.json, src/stripe-links.json, src/site.json
// Writes every page into the repository root, ready for GitHub Pages.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SITE = JSON.parse(fs.readFileSync(path.join(__dirname, 'site.json'), 'utf8'));
const C = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json'), 'utf8'));
const STRIPE = JSON.parse(fs.readFileSync(path.join(__dirname, 'stripe-links.json'), 'utf8'));
const HOME_SRC = fs.readFileSync(path.join(__dirname, 'home.html'), 'utf8');
const BASE = SITE.url.replace(/\/$/, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = n => '$' + (Number(n) % 1 ? Number(n).toFixed(2) : Number(n).toFixed(0));
const write = (rel, html) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
const localise = html => html
  .replace(/https?:\/\/gclasercut\.com\/custom-qr-codes\/?/g, '/product/custom-code-logo/')
  .replace(/https?:\/\/gclasercut\.com\/?(?=["#])/g, '/')
  .replace(/https?:\/\/gclasercut\.com\//g, '/')
  .replace(/href="\/#/g, 'href="/#');

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
      <li><a href="/shop/">Shop</a></li>
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
        <li><a href="/pricing/">Pricing</a></li><li><a href="/blog/">Blog and guides</a></li><li><a href="/contact-us/">Contact</a></li>
      </ul></div>
      <div><h3>Shop</h3><ul>
        <li><a href="/shop/">All products</a></li>
        ${SITE.categories.map(c => `<li><a href="/product-category/${c.slug}/">${esc(c.name)}</a></li>`).join('')}
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,400..900;1,62..125,400..900&display=swap">
<link rel="stylesheet" href="/assets/site.css">
${(schema || []).map(s => '<script type="application/ld+json">' + JSON.stringify(s) + '</script>').join('\n')}
${tracking}
</head>
<body>
${header}
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
  write('index.html', layout({ title: 'Laser Cutting Coomera, Gold Coast | GC Laser Cut', desc: 'GC Laser Cut in Coomera QLD. 130 W CO2 laser cutting and engraving for MDF, acrylic, vinyl, leather, thin polycarbonate and timber. No metal. Quotes within 24 hours.', path: '/', body, schema: [business, faq] }));
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
    ? ['g-clock', 'g-mandala', 'g-guitar', 'g-boho-mirror'].map(g => `<a class="work" href="/shop/"><img src="/assets/${g}.jpg" alt="" loading="lazy"></a>`).join('')
    : ['g-led', 'g-qr', 'g-lamp', 's-led'].map(g => `<a class="work" href="/shop/"><img src="/assets/${g}.jpg" alt="" loading="lazy"></a>`).join('');
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
  write('services/index.html', layout({ title: 'Laser Cutting and Engraving Services | GC Laser Cut Coomera', desc: 'Laser cutting, engraving, stencils, layered artwork, 3D and LED signage, and file help from GC Laser Cut in Coomera. Timber, MDF, acrylic, vinyl, leather and thin polycarbonate. No metal.', path: '/services/', body: pageShell('Services', 'Cutting, engraving, stencils, layered artwork, signage and file help, all from one Coomera workshop.', inner + cta(), [['Home', '/'], ['Services', '/services/']]), schema: [crumbs([['Home', '/'], ['Services', '/services/']])] }));
}

// Pricing
{
  const pricing = HOME_SRC.match(/<h2>Pricing<\/h2>[\s\S]*?<p class="note">[\s\S]*?<\/p>/)[0].replace(/<h2>Pricing<\/h2>/, '');
  const inner = pricing + `<h2>How a quote is worked out</h2>
  <p>Every quote is machine time plus material plus any setup. Machine time is what the laser actually spends cutting or engraving your file, so a simple outline in 3 mm MDF is quick and cheap, while a dense engraving or thick acrylic takes longer. We nest parts tightly to keep sheet waste down, and we tell you before starting if a change to the design would make it cheaper.</p>
  <p>Material is quoted separately at cost, or bring your own sheet as long as it is laser-safe. There is no minimum quantity. Shipping is at cost and confirmed in the quote.</p>`;
  write('pricing/index.html', layout({ title: 'Laser Cutting Prices | GC Laser Cut Coomera', desc: 'Laser cutting from $65 per hour of machine time plus $20 setup for a new design. 10% off jobs over 10 hours. Example prices for stencils, signs, dog tags and mandalas.', path: '/pricing/', body: pageShell('Pricing', 'Simple hourly pricing, a one-off setup fee, and real examples from the shop.', inner + cta('Want a fixed price?', 'Send the file and the material and we will quote it within 24 hours.'), [['Home', '/'], ['Pricing', '/pricing/']]), schema: [crumbs([['Home', '/'], ['Pricing', '/pricing/']])] }));
}

// Contact
{
  const form = HOME_SRC.match(/<form id="quoteForm"[\s\S]*?<\/form>/)[0];
  const details = HOME_SRC.match(/<ul class="cdetails">[\s\S]*?<\/ul>/)[0].replace(/<button class="copy"[^>]*>Copy<\/button>/g, '');
  const inner = `<div class="contact-grid"><div>${details}<p class="areas">Pick-up from the Coomera workshop by appointment, or we post anywhere in Australia. Serving ${SITE.areas.slice(0, 10).join(', ')} and the wider Gold Coast.</p></div>${form}</div>`;
  write('contact-us/index.html', layout({ title: 'Contact GC Laser Cut | Get a Laser Cutting Quote', desc: 'Request a laser cutting or engraving quote from GC Laser Cut, Coomera QLD. Phone 0456 267 249 or email gclasercutting@gmail.com. Quotes within 24 hours.', path: '/contact-us/', body: `<section class="page contact"><div class="wrap">${breadcrumbHtml([['Home', '/'], ['Contact', '/contact-us/']])}<h1>Get a quote</h1><p class="lede">Tell us the material, thickness and what you need. We reply within 24 hours.</p>${inner}</div></section>`, schema: [business, crumbs([['Home', '/'], ['Contact', '/contact-us/']])] }));
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
function postCard(p) {
  return `<a class="guide" href="/${p.slug}/"><img src="${p.cover || '/assets/hero.jpg'}" alt="" width="720" height="450" loading="lazy"><div class="body"><time datetime="${p.date}">${fmtDate(p.date)}</time><strong>${esc(p.title)}</strong><span>${esc(p.desc.slice(0, 140))}${p.desc.length > 140 ? '…' : ''}</span></div></a>`;
}
function fmtDate(d) { const [y, m, dd] = d.split('-'); return `${Number(dd)} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Number(m) - 1]} ${y}`; }
write('blog/index.html', layout({ title: 'Laser Cutting Guides and Blog | GC Laser Cut', desc: 'Guides on laser cutting acrylic, polycarbonate, vinyl, timber and stencils, plus gift ideas, from the GC Laser Cut workshop in Coomera.', path: '/blog/', body: `<section class="page"><div class="wrap">${breadcrumbHtml([['Home', '/'], ['Blog', '/blog/']])}<h1>Guides from the workshop</h1><p class="lede">What we have learned cutting these materials every day, written up for customers and makers.</p><div class="guide-grid" style="margin-top:2rem">${posts.map(postCard).join('')}</div></div></section>`, schema: [crumbs([['Home', '/'], ['Blog', '/blog/']])] }));
for (const p of posts) {
  let html = localise(p.html);
  html = html.replace(/^[\s\S]*?\d{1,2} \w+ \d{4}\s*/, ''); // strip breadcrumb, duplicated title, byline, date
  html = html.replace(/<h2>Post navigation<\/h2>[\s\S]*$/, '').replace(/<h2>Similar Posts<\/h2>[\s\S]*$/, '');
  const related = posts.filter(x => x.slug !== p.slug).sort(() => 0.5).slice(0, 3);
  const body = `<article class="page"><div class="wrap narrow">${breadcrumbHtml([['Home', '/'], ['Blog', '/blog/'], [shortTitle(p.title), '/' + p.slug + '/']])}<h1>${esc(p.title)}</h1><p class="meta">By GC Laser Cut, Coomera · <time datetime="${p.date}">${fmtDate(p.date)}</time></p>${p.cover ? `<img class="cover" src="${p.cover}" alt="" width="1200" height="750">` : ''}${noMetal}<div class="prose">${html}</div>${cta()}<h2 class="related-h">More guides</h2><div class="guide-grid three">${related.map(postCard).join('')}</div></div></article>`;
  const article = { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, datePublished: p.date, dateModified: p.date, image: p.cover ? BASE + p.cover : undefined, author: { '@type': 'Organization', name: 'GC Laser Cut' }, publisher: { '@type': 'Organization', name: 'GC Laser Cut', logo: { '@type': 'ImageObject', url: BASE + '/assets/logo.png' } }, mainEntityOfPage: BASE + '/' + p.slug + '/' };
  write(p.slug + '/index.html', layout({ title: p.title + ' | GC Laser Cut', desc: p.desc, path: '/' + p.slug + '/', body, image: p.cover, schema: [article, crumbs([['Home', '/'], ['Blog', '/blog/'], [shortTitle(p.title), '/' + p.slug + '/']])] }));
}
// redirect for the removed metal post
write('iron-laser-cutting-designs/index.html', `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/#materials"><link rel="canonical" href="${BASE}/#materials"><meta name="robots" content="noindex"><title>Redirecting</title><p>This post has been removed. GC Laser Cut does not cut metal. <a href="/#materials">See the materials we cut</a>.</p>`);

// ---------- shop ----------
const products = C.products.map(pr => {
  const tile = SITE.productTiles[pr.slug] || {};
  const prices = pr.variations.filter(v => v.price).map(v => Number(v.price));
  const min = prices.length ? Math.min(...prices) : Number((pr.prices[pr.prices.length - 1] || '0').replace(/[^0-9.]/g, ''));
  const max = prices.length ? Math.max(...prices) : min;
  const regular = pr.prices.length === 2 ? Number(pr.prices[0].replace(/[^0-9.]/g, '')) : null;
  pr.cats = pr.cats.filter(c => SITE.categories.some(k => k.slug === c.slug));
  return { ...pr, name: tile.name || pr.title.split(/[,|-]/)[0].trim(), blurb: tile.blurb || '', images: pr.images.length ? pr.images : (tile.fallback ? [tile.fallback] : []), min, max, regular: regular && regular > min ? regular : null };
});
const priceLabel = p => p.min === p.max ? money(p.min) : `${money(p.min)} to ${money(p.max)}`;
function productTile(p) {
  return `<a class="prod" href="/product/${p.slug}/"><img src="${p.images[0] || '/assets/hero.jpg'}" alt="" width="700" height="700" loading="lazy"><strong>${esc(p.name)}</strong><span>${esc(p.blurb)}${p.blurb ? '. ' : ''}${priceLabel(p)}</span></a>`;
}
write('shop/index.html', layout({ title: 'Shop Laser-Cut Mandalas, Mirrors, Signs and Gifts | GC Laser Cut', desc: 'Buy laser-cut layered mandalas, mirrors, clocks, LED signs, lamps, stencils, wedding invitations, photo frames and engraved dog tags, made in Coomera and posted Australia-wide.', path: '/shop/', body: `<section class="page"><div class="wrap">${breadcrumbHtml([['Home', '/'], ['Shop', '/shop/']])}<h1>Shop</h1><p class="lede">Made in the Coomera workshop and posted anywhere in Australia. Pay by card through Stripe, or ask us for a custom version of any piece.</p><p class="catlinks">${SITE.categories.map(c => `<a href="/product-category/${c.slug}/">${esc(c.name)}</a>`).join(' ')}</p><div class="prod-grid" style="margin-top:1.5rem">${products.map(productTile).join('')}</div></div></section>`, schema: [crumbs([['Home', '/'], ['Shop', '/shop/']])] }));
for (const c of SITE.categories) {
  const list = products.filter(p => p.cats.some(x => x.slug === c.slug));
  write(`product-category/${c.slug}/index.html`, layout({ title: `${c.name} | GC Laser Cut Shop`, desc: c.desc, path: `/product-category/${c.slug}/`, body: `<section class="page"><div class="wrap">${breadcrumbHtml([['Home', '/'], ['Shop', '/shop/'], [c.name, `/product-category/${c.slug}/`]])}<h1>${esc(c.name)}</h1><p class="lede">${esc(c.desc)}</p><div class="prod-grid" style="margin-top:2rem">${list.map(productTile).join('')}</div>${list.length ? '' : '<p class="note">Nothing listed here yet. <a href="/contact-us/">Ask us for a custom piece</a>.</p>'}</div></section>`, schema: [crumbs([['Home', '/'], ['Shop', '/shop/'], [c.name, `/product-category/${c.slug}/`]])] }));
}
function optionLabel(attr, v) {
  const o = SITE.optionLabels[attr] || {}; return o[v] || v.replace(/-/g, ' ').replace(/^\w/, ch => ch.toUpperCase());
}
for (const p of products) {
  const links = STRIPE[p.slug] || {};
  const attr = p.attrs[0];
  const variants = attr ? p.variations.filter(v => v.attrs[attr.name]).map(v => ({ key: v.attrs[attr.name], label: optionLabel(attr.name, v.attrs[attr.name]), price: v.price, dims: (v.dims || '').replace(/&times;/g, '×'), link: links[v.attrs[attr.name]] || '' })) : [];
  const defaultLink = typeof links === 'string' ? links : (links.default || '');
  const anyLink = defaultLink || variants.some(v => v.link);
  const orderHref = `/contact-us/?product=${encodeURIComponent(p.name)}`;
  const buy = `<div class="buy" data-default="${esc(defaultLink)}" data-order="${esc(orderHref)}">
    ${variants.length ? `<label for="variant">${esc(attr.name.replace(/^attribute_(pa_)?/, '').replace(/^\w/, c => c.toUpperCase()))}</label>
    <select id="variant">${variants.map(v => `<option value="${esc(v.key)}" data-price="${v.price}" data-link="${esc(v.link)}">${esc(v.label)}${v.dims && v.dims !== 'N/A' ? ' · ' + esc(v.dims) : ''} · ${money(v.price)}</option>`).join('')}</select>` : ''}
    <div class="price-line"><span class="price" id="price">${money(variants.length ? variants[0].price : p.min)}</span>${p.regular ? `<s>${money(p.regular)}</s>` : ''}<small>AUD, includes GST. Shipping calculated at checkout.</small></div>
    <a class="btn primary" id="buyBtn" href="${esc(anyLink ? (variants.length && variants[0].link ? variants[0].link : defaultLink) : orderHref)}">${anyLink ? 'Buy now with card' : 'Order this'}</a>
    <a class="btn" href="${orderHref}">Ask about a custom version</a>
    ${anyLink ? '<p class="formnote">Secure checkout by Stripe. Apple Pay, Google Pay and all major cards.</p>' : '<p class="formnote">Card checkout is being set up. Order by message and we will send a payment link.</p>'}
  </div>`;
  const gallery = `<div class="gallery"><img id="mainImg" src="${p.images[0] || '/assets/hero.jpg'}" alt="${esc(p.name)}" width="1000" height="1000">${p.images.length > 1 ? `<div class="thumbs">${p.images.map((im, i) => `<button type="button" class="${i ? '' : 'on'}" data-src="${im}" aria-label="Photo ${i + 1}"><img src="${im}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}</div>`;
  const desc = localise(p.long).replace(/^\s*<h2>Description<\/h2>/, '');
  const short = localise(p.short);
  const schema = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.desc || p.name, image: p.images.map(i => BASE + i), sku: p.sku || undefined, brand: { '@type': 'Brand', name: 'GC Laser Cut' }, offers: p.min === p.max ? { '@type': 'Offer', priceCurrency: 'AUD', price: p.min, availability: 'https://schema.org/InStock', url: BASE + '/product/' + p.slug + '/' } : { '@type': 'AggregateOffer', priceCurrency: 'AUD', lowPrice: p.min, highPrice: p.max, offerCount: variants.length || 1, availability: 'https://schema.org/InStock', url: BASE + '/product/' + p.slug + '/' } };
  const crumbList = [['Home', '/'], ['Shop', '/shop/'], ...(p.cats[0] ? [[p.cats[0].name, `/product-category/${p.cats[0].slug}/`]] : []), [p.name, `/product/${p.slug}/`]];
  const more = products.filter(x => x.slug !== p.slug && x.cats.some(c => p.cats.some(d => d.slug === c.slug))).slice(0, 4);
  const body = `<section class="page product"><div class="wrap">${breadcrumbHtml(crumbList)}<div class="product-grid">${gallery}<div class="product-info"><h1>${esc(p.name)}</h1><p class="subtitle">${esc(p.title)}</p>${short}${buy}<ul class="facts"><li>Made to order in Coomera, QLD</li><li>Posted Australia-wide, or collect by appointment</li><li>${p.cats.map(c => `<a href="/product-category/${c.slug}/">${esc(c.name)}</a>`).join(', ')}</li></ul></div></div><div class="prose product-desc">${desc}</div>${more.length ? `<h2 class="related-h">More in ${esc(p.cats[0].name)}</h2><div class="prod-grid">${more.map(productTile).join('')}</div>` : ''}</div></section>`;
  write(`product/${p.slug}/index.html`, layout({ title: `${p.name} | GC Laser Cut`, desc: p.desc || p.title, path: `/product/${p.slug}/`, body, image: p.images[0], schema: [schema, crumbs(crumbList)] }));
}

// ---------- misc ----------
write('404.html', layout({ title: 'Page not found | GC Laser Cut', desc: 'That page does not exist.', path: '/404.html', noindex: true, body: `<section class="page"><div class="wrap narrow"><h1>That page is not here.</h1><p class="lede">It may have moved when we rebuilt the site. Try one of these.</p><ul class="biglinks"><li><a href="/">Home</a></li><li><a href="/#materials">Materials we cut</a></li><li><a href="/shop/">Shop</a></li><li><a href="/blog/">Guides</a></li><li><a href="/contact-us/">Get a quote</a></li></ul></div></section>` }));
const urls = ['/', '/about/', '/services/', '/pricing/', '/3d-signs/', '/layered-artwork/', '/contact-us/', '/privacy-policy/', '/terms-and-conditions/', '/blog/', '/shop/', ...posts.map(p => '/' + p.slug + '/'), ...SITE.categories.map(c => `/product-category/${c.slug}/`), ...products.map(p => `/product/${p.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${BASE}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
write('CNAME', SITE.domain + '\n');
write('.nojekyll', '');
console.log('built', urls.length, 'pages');
