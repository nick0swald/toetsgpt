# ToetsGPT

Oefentoetsen voor VMBO-leerlingen (Aeres, klas van Nick Oswald). Tussen [Toetski](https://toetski.nl) en [OswaldGPT](https://oswaldgpt.nl).

Leerlingen kiezen een hoofdstuk, maken de vragen één voor één, en zien een oefenscore. De docentkant zit achter vijf keer tikken op de titel.

Live: [toetsgpt.nl](https://toetsgpt.nl)

## Starten

```bash
npm install
cp .env.example .env
npm run dev
```

Zet in `.env` (en in Vercel):

- `XAI_API_KEY` — xAI-sleutel voor Grok. Zonder sleutel werken de NaSk-hoofdstukken met lokale vragen nog.
- `DOCENT_PIN` — wachtwoord voor de docentkant (vijf keer tikken op ToetsGPT). Standaard `12341234` tot je dit zet.


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
