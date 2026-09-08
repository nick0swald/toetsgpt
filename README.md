# ToetsGPT

Oefentoetsen voor VMBO-leerlingen (Aeres, klas van Nick Oswald). Tussen [Toetski](https://toetski.nl) en [OswaldGPT](https://oswaldgpt.nl).

Leerlingen kiezen een hoofdstuk of plakken een toets, maken de vragen één voor één, en zien een oefenscore.

Live: [toetsgpt.nl](https://toetsgpt.nl)

## Starten

```bash
npm install
cp .env.example .env
npm run dev
```

Zet in `.env` (en in Vercel):

- `XAI_API_KEY` — xAI-sleutel voor Grok. Zonder sleutel werkt de demo (dichtheid) nog; nieuwe stof uit een hoofdstuk valt terug op lokale vragen.

## Deploy (Vercel)

Zelfde keten als OswaldGPT: grok.com → GitHub → Vercel.

1. Koppel deze repo aan [Vercel](https://vercel.com) (Import Git Repository).
2. Environment variable: `XAI_API_KEY` (Production, Preview, Development).
3. Deploy. De site draait dan op `toetsgpt.vercel.app`.
4. In Vercel → Project → Settings → Domains: voeg `toetsgpt.nl` en `www.toetsgpt.nl` toe.
5. Bij Porkbun (DNS van toetsgpt.nl), parking uitzetten en records zetten zoals bij OswaldGPT:

| Type | Host | Waarde |
| --- | --- | --- |
| A | `@` | `216.198.79.1` |
| CNAME | `www` | `cname.vercel-dns.com` |

Vercel toont de exacte records als je het domein toevoegt. HTTPS komt vanzelf.

Toetski en OswaldGPT blijven ongemoeid.
