# GC Laser Cut website

Static site for gclasercut.com, hosted on GitHub Pages. No WordPress, no database, no plugins.

Everything in this repository root is the published site. The `src/` folder holds the sources and the generator that writes it.

## Folder map

| Path | What it is |
|---|---|
| `index.html`, `about/`, `services/`, `pricing/`, `3d-signs/`, `layered-artwork/`, `contact-us/`, `privacy-policy/`, `terms-and-conditions/` | Site pages, at the same addresses the old site used |
| `blog/` and one folder per post, e.g. `acrylic-sheets-for-laser-cutting/` | The 12 guides, at their original addresses |
| `shop/`, `product/<slug>/`, `product-category/<slug>/` | Redirects from the old shop addresses to the work gallery |
| `assets/` | Logo, photos, `site.css`, `site.js` |
| `404.html`, `sitemap.xml`, `robots.txt`, `CNAME`, `.nojekyll` | Hosting files |
| `src/build.js` | Generator. Run it after any change in `src/` |
| `src/home.html` | Home page source |
| `src/content.json` | Text of every post and page (product entries are kept only to generate redirects) |
| `src/site.json` | Contact details, categories, FAQ, tracking IDs, social links |
| `src/pages.css` | Styles for inner pages (home page styles live in `src/home.html`) |

## One-time setup

### 1. Create the GitHub repository

1. Sign in to GitHub and create a new **public** repository called `gclasercut` (any name works).
2. On this computer, in this folder:

```bash
git remote add origin https://github.com/YOUR-USERNAME/gclasercut.git
git push -u origin main
```

### 2. Turn on GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
3. After a minute the site is live at `https://YOUR-USERNAME.github.io/gclasercut/`.

Note: until the custom domain is connected, image and link paths that start with `/` will not resolve on the `github.io` address because the site sits in a sub-folder. Test on the custom domain, or temporarily name the repository `YOUR-USERNAME.github.io` so it serves from the root.

### 3. Connect gclasercut.com

1. In **Settings → Pages → Custom domain**, enter `gclasercut.com` and save. The `CNAME` file in this repo already matches.
2. At Hostinger (where the domain's DNS is managed), open the DNS zone for gclasercut.com and set:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | YOUR-USERNAME.github.io |

Delete any existing A or AAAA record for `@` that points at the old Hostinger server. Leave the MX records alone if you use Titan email.

3. Back in GitHub Pages, wait for the DNS check to pass, then tick **Enforce HTTPS**.

Propagation usually takes under an hour. The old WordPress site keeps serving until the DNS change lands, so there is no gap.

### 4. Quote form

The form posts to Formspree (form `mrppvkjp`, account gclasercutting@gmail.com). If you ever need to change it:

1. Create a free account at formspree.io and a new form pointed at gclasercutting@gmail.com.
2. Copy the endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. Paste it into `FORM_ENDPOINT` at the top of `assets/site.js`.
4. Commit and push.

### 5. Tracking and social links (optional)

In `src/site.json` fill in `gtmId` (Google Tag Manager, `GTM-XXXXXXX`), `fbPixelId`, and `social` as a list like `[{"name":"Instagram","url":"https://instagram.com/..."}]`. Rebuild and push.

## Editing the site

- **Prices, titles, descriptions**: edit `src/content.json` or `src/site.json`, then run `node src/build.js`.
- **Home page text**: edit `src/home.html`, then build.
- **A new guide**: add an entry to `posts` in `src/content.json` with `slug`, `title`, `date` (YYYY-MM-DD), `desc`, `cover` (path under `/assets/posts/`) and `html`, then build.
- **Publish**: `git add -A && git commit -m "Update" && git push`. GitHub Pages redeploys in about a minute.

Building needs Node.js 18 or newer, nothing else.

## Launch checklist

1. Push the repo and enable Pages.
2. Set up Formspree and send a test quote.
3. Export a backup of WordPress (Tools → Export) and the WooCommerce orders.
4. Change the DNS records. Confirm https://gclasercut.com loads the new site.
5. In Google Search Console, submit `https://gclasercut.com/sitemap.xml`.
6. After 30 days, cancel Hostinger hosting (keep the domain and email), Elementor Pro, WooCommerce Payments and every payment gateway account you no longer need.
