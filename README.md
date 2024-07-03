
# Vertica ansøgning Demo projekt:
Dette er en MVP af en implementering af WebAutN som logind mulighed, med fallback til Email OTP, hvis WebAuthN ikke er understøttet af brugerens browser. Jeg har ikke optimeret løsningen for performance, vil der være en smule latency grundet coldstarts for Firebase Cloud Functions. I production er dette selvfølgelig noget jeg vill optimere. Ved successfuldt login sættes en "Session Cookie" ved navn __session, der er tilgængelig på alle subdomæner under paraplyen "mathiasqm.dk". Denne sessionCookie kan benyttes til at autnetificere brugere på tværs af subdomæner. Hverken autentificering og ugyldiggørelse af denne cookie er ikke implementeret i denne demo og cookien vil derfor stadig være tilstede ved logout 

Jeg har forsøgt at genskabe [Vertica]([https://auth.brandbrainai.com/](https://www.vertica.dk/)'s brandidentitet i denne demo. Jeg har dog afholdt mig, fra at bruge Verticas' logo og font, for ikke at overtræde ophavsret.

# Live Demo:
[Live Demo](https://auth.brandbrainai.com/)

# Tech:

Nuxt 3 (Vue 3) - Benytter Vue's "Script setup" syntax
Typescript
TailwindCSS
Firebase håndterer min backend og Authentication

## Setup

Make sure to install the dependencies within the rootfolder and functions:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
Or
Nuxi dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
