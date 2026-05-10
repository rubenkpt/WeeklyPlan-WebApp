# WeeklyPlan

Haushaltsaufgaben-App für Linus, Ruben & Markus. Gebaut mit React + TypeScript + Supabase. Installierbar als PWA auf dem iPhone.

## Setup

### 1. Supabase einrichten

1. Gehe auf [supabase.com](https://supabase.com) und erstelle ein neues Projekt.
2. Öffne **SQL Editor** und führe den Inhalt von `supabase-schema.sql` aus.
3. Kopiere deine **Project URL** und den **anon public key** (unter Settings → API).

### 2. Umgebungsvariablen

```bash
cp .env.example .env
# Trage deine Supabase-Werte ein:
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Lokale Entwicklung

```bash
npm install
npm run dev
```

---

## Deployment auf GitHub Pages

### Variante A – gh-pages (einfach)

```bash
npm install
BASE_URL=/WeeklyPlan-WebApp/ npm run build
npx gh-pages -d dist
```

Die App ist dann unter `https://<dein-username>.github.io/WeeklyPlan-WebApp/` erreichbar.

### Variante B – GitHub Actions (automatisch bei Push)

Erstelle `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
        env:
          BASE_URL: /WeeklyPlan-WebApp/
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Danach unter **Settings → Secrets** die beiden Supabase-Werte eintragen.

---

## Architektur

```
Browser (React SPA)
  ↕ Supabase JS Client
Supabase (PostgreSQL)
  ├── completions   – welche Aufgaben sind diese Woche erledigt
  └── custom_tasks  – einmalige Aufgaben mit optionalem Deadline
```

Wiederkehrende Aufgaben werden rein im Frontend aus der ISO-Wochennummer berechnet:

| ISO-Woche | Linus              | Ruben              | Markus                     |
|-----------|--------------------|--------------------|----------------------------|
| Ungerade  | Badezimmer         | Zimmer/Saugen/Flur | —                          |
| Gerade    | Zimmer/Saugen/Flur | Badezimmer         | Badezimmer + Flur saugen   |
| Jede      | Wäsche (Fr.)       | Wäsche (Fr.)       | Wäsche (Fr.)               |

---

## PWA auf iPhone installieren

1. App im Safari öffnen
2. Teilen-Symbol tippen → **„Zum Home-Bildschirm"**
3. Fertig – funktioniert offline und wie eine native App
