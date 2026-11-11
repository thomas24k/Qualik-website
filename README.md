# QualiK website

Static site: `index.html` (QualiK, industry), `field.html` (QualiK Field), `privacy.html`. No build step — plain HTML, one stylesheet (`css/site.css`), one script (`js/site.js`). Chosen over Next.js to keep the site light and dependency-free.

- **Run locally:** `python3 -m http.server 4173`, then open http://localhost:4173
- **Deploy:** Vercel serves the folder as-is (`vercel.json` enables clean URLs: `/field`, `/privacy`).
- **Forms:** put your endpoints (e.g. Formspree) in `js/config.js`. The hidden `product` field tells QualiK and QualiK Field leads apart.
- **Copy:** edit the HTML directly. **Photos:** replace files in `assets/` and update the credits in the footer.
- **To replace before launch:** `[Name]`, founder portrait, privacy/terms text, domain in canonical/OG tags, sample data in the demos.
