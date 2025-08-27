## APACHETA
NextJs Project you know the drill, `npm install` and read `package.json`.
Also any setup requires an .env of project Neptuno(API).

### Environment Files Structure:

- `.env.local` - for your local machine only (not committed to git)
- `.env.development` - for dev environment (can be committed, no secrets)
- `.env` - shared defaults/fallbacks

#### What Goes in Each File

`API_URL`
- .env.local: http://localhost:8080/v1

`AUTH_SECRET` handling:

- Local: Generate one secret for your machine
- Dev: Different secret for dev server
- Never commit secrets to git