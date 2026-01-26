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

`AUTH_TRUST_HOST`
- Remmember to add api as trust host

`NEXT_PUBLIC_VAPID_PUBLIC_KEY`
`VAPID_PRIVATE_KEY`
`VAPID_CONTACT`
- this is all for push notifications on browser, can be hardcoded

# FOR PROD

Remmember to run `pnpm install` for proper deploy on Railway