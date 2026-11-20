# AniVerse — Anime Discovery & Recommendation Prototype

A student-friendly anime discovery app built with **Node.js + Express + HTML/CSS/JavaScript**. No Python, TMDB key, database server, or cloud account is required.

## Features
- Curated starter catalogue of 20 famous anime titles.
- Live popular anime catalogue, search and posters from the Jikan API when available.
- Automatic local-catalogue fallback if the external API is offline or rate-limited.
- Anime detail view with genres, synopsis, score and MyAnimeList info link.
- “Where to watch” links that search official services (Crunchyroll, Netflix, Prime Video and official YouTube channels). These are search links, not claims that a title is available in your country.
- AniMind genre-based recommendations with an explanation of genre matches.
- AniTrack personal library with Wishlist, Plan to Watch, Watching, Completed and On Hold statuses.
- Watchlist, preferences and community reviews stored locally in `data/db.json`.
- AnimeDex character search (requires the live metadata API).

## Requirements
- Node.js 18 or newer
- Internet connection for live catalogue data and poster images (the local starter catalogue still loads without the API)

## Run on Windows PowerShell
```powershell
npm.cmd install
npm.cmd start
```
Then open http://localhost:3000

If PowerShell allows npm scripts, `npm install` and `npm start` work too.

## Notes
- Jikan is an unofficial, read-only public metadata API for MyAnimeList. It supplies anime metadata and poster image URLs; API availability and rate limits are outside this app's control.
- The app does **not** host, embed, download, or distribute anime episodes. Use the official provider search links to check legal availability in your region.
- All local user data is stored in `data/db.json`. Back up that file if you want to keep your wishlist and reviews.
