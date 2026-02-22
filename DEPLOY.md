# 🚀 BudgetSnap — Deployment-Anleitung

Zwei Wege, deine App live zu bringen. **Vercel ist schneller** (5 Min),
GitHub Pages braucht etwas mehr Setup (15 Min).

---

## Weg 1: Vercel (empfohlen ⭐)

### Warum Vercel?
- 1-Klick-Deploy, automatische Builds
- Kostenloses HTTPS + Custom Domain möglich
- Perfekt für React/Vite-Projekte

### Schritte

**1. Repository auf GitHub erstellen**

```bash
# Im Terminal (Mac/Linux) oder Git Bash (Windows):
cd budgetsnap-app
git init
git add .
git commit -m "Initial: BudgetSnap v3"

# Auf github.com → New Repository → "budgetsnap" → Create
git remote add origin https://github.com/DEIN-USERNAME/budgetsnap.git
git branch -M main
git push -u origin main
```

**2. Vercel verbinden**

1. Gehe zu [vercel.com/dashboard](https://vercel.com/dashboard)
2. Klicke **"Add New → Project"**
3. Wähle dein GitHub-Repo **"budgetsnap"**
4. Framework: **Vite** (wird automatisch erkannt)
5. Klicke **"Deploy"**
6. ✅ Fertig! Du bekommst eine URL wie `budgetsnap-xyz.vercel.app`

**3. Auf iPhone nutzen**

1. Öffne die Vercel-URL in **Safari** auf deinem iPhone
2. Tippe auf das **Teilen-Symbol** (□↑)
3. Wähle **„Zum Home-Bildschirm"**
4. ✅ Die App erscheint als Icon — wie eine native App!

---

## Weg 2: GitHub Pages

### Schritte

**1. Vite für GitHub Pages konfigurieren**

In `vite.config.js` den `base`-Pfad auf dein Repo setzen:

```js
export default defineConfig({
  plugins: [react()],
  base: '/budgetsnap/',  // ← Dein Repo-Name
})
```

**2. GitHub Actions Workflow erstellen**

Erstelle die Datei `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install & Build
        run: |
          npm install
          npm run build

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

**3. GitHub Pages aktivieren**

1. Gehe zu deinem Repo → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Push deinen Code:

```bash
cd budgetsnap-app
git init
git add .
git commit -m "Initial: BudgetSnap v3"
git remote add origin https://github.com/DEIN-USERNAME/budgetsnap.git
git branch -M main
git push -u origin main
```

4. Warte 1-2 Minuten, dann ist die App unter:
   `https://DEIN-USERNAME.github.io/budgetsnap/`

**4. Auf iPhone nutzen**

Gleich wie bei Vercel:
1. Safari → URL öffnen
2. Teilen → „Zum Home-Bildschirm"
3. ✅ Fertig!

---

## 📱 iPhone-Tipp: „Zum Home-Bildschirm"

Dank der PWA-Meta-Tags (`manifest.json` + `apple-mobile-web-app-capable`)
verhält sich BudgetSnap auf dem iPhone wie eine native App:

- **Kein Safari-Rahmen** — Fullscreen
- **Eigenes App-Icon** auf dem Home-Bildschirm
- **Offline nutzbar** (Daten in localStorage)
- **Splash Screen** beim Öffnen

---

## 🌐 Eigene Domain (optional)

Wenn du eine eigene Domain wie `budget.meinedomain.de` möchtest:

### Vercel
1. Dashboard → Projekt → Settings → Domains
2. Domain eingeben → DNS-Einträge setzen → Fertig

### GitHub Pages
1. Settings → Pages → Custom Domain
2. CNAME-Eintrag bei deinem DNS-Provider setzen

---

## 🔧 Lokal testen (optional)

```bash
cd budgetsnap-app
npm install
npm run dev
# → Öffnet auf http://localhost:5173
```
