# hack-mack

Simple static Astro website.

```sh
npm install
npm run dev
```

`npm test` builds the site and checks the output. `npm run build` produces `dist/` for static hosting.

Logos are loaded directly from `logos/`. The homepage contains all contact emails from the supplied documents. The original PDFs are not published.

Before publishing, replace the clearly marked placeholders for the ZVR number, authorized board members, hosting provider and log-retention period in `src/pages/index.astro`. Confirm the association name and address against the final register entry. Legal content follows the [WKO guidance for association websites](https://www.wko.at/internetrecht/das-korrekte-website-impressum-fuer-vereine).
