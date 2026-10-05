import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { env } from "@/lib/env.server";
import { KLASSEN } from "./types";
import { paragraafLabel, vakById } from "./stof";
import { telBank, zorgVoorTabellen } from "./vraagbank";

const PIN = () => env("DOCENT_PIN") ?? "12341234";

function pinOk(pin: string): boolean {
  return pin.trim() === PIN();
}

const EventIn = z.object({
  klas: z.string().max(12),
  vakId: z.string().max(24),
  hoofdstukId: z.string().max(40),
  paragraafId: z.string().max(40),
  lastig: z.boolean(),
  cijferBucket: z.enum(["onder", "cesuur", "boven"]),
  behaald: z.number().int().min(0).max(40).optional(),
  totaal: z.number().int().min(0).max(40).optional(),
  doelId: z.string().max(80).optional(),
});

export const rapporteerOefening = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        events: z.array(EventIn).min(1).max(12),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await zorgVoorTabellen();
    const toegestaan = new Set<string>(KLASSEN);
    let n = 0;
    for (const e of data.events) {
      if (!toegestaan.has(e.klas)) continue;
      if (!vakById(e.vakId)) continue;
      await sql`
        insert into oefen_events (klas, vak_id, hoofdstuk_id, paragraaf_id, lastig, cijfer_bucket, behaald, totaal, doel_id)
        values (${e.klas}, ${e.vakId}, ${e.hoofdstukId}, ${e.paragraafId}, ${e.lastig}, ${e.cijferBucket}, ${e.behaald ?? null}, ${e.totaal ?? null}, ${e.doelId ?? null})
      `;
      n += 1;
    }
    return { ok: true as const, n };
  });

export type KlasRij = {
  klas: string;
  oefeningen: number;
  lastig: number;
};

export type StofRij = {
  vakId: string;
  vak: string;
  hoofdstukId: string;
  paragraafId: string;
  label: string;
  oefeningen: number;
  lastig: number;
  behaald: number;
  totaal: number;
};

export type Overzicht = {
  klassen: KlasRij[];
  stof: StofRij[];
  totaal: number;
  bank: number;
};

export const leesOverzicht = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ pin: z.string().max(24) }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true; overzicht: Overzicht } | { ok: false; error: string }> => {
    if (!pinOk(data.pin)) return { ok: false, error: "Onjuiste code." };
    await zorgVoorTabellen();
    const sql = await getSql();
    const klassen = await sql<{ klas: string; oefeningen: number; lastig: number }>`
      select klas,
        count(*)::int as oefeningen,
        sum(case when lastig then 1 else 0 end)::int as lastig
      from oefen_events
      where created_at > now() - interval '28 days'
      group by klas
      order by lastig desc, oefeningen desc
    `;
    const stof = await sql<{
      vak_id: string;
      hoofdstuk_id: string;
      paragraaf_id: string;
      oefeningen: number;
      lastig: number;
      behaald: number;
      totaal: number;
    }>`
      select vak_id, hoofdstuk_id, paragraaf_id,
        count(*)::int as oefeningen,
        sum(case when lastig then 1 else 0 end)::int as lastig,
        coalesce(sum(behaald), 0)::int as behaald,
        coalesce(sum(totaal), 0)::int as totaal
      from oefen_events
      where created_at > now() - interval '28 days'
      group by vak_id, hoofdstuk_id, paragraaf_id
      order by
        case when coalesce(sum(totaal), 0) = 0 then 1 else 0 end,
        coalesce(sum(behaald), 0)::float / nullif(sum(totaal), 0),
        lastig desc
      limit 24
    `;
    const totaalRow = await sql<{ n: number }>`
      select count(*)::int as n from oefen_events
      where created_at > now() - interval '28 days'
    `;
    return {
      ok: true,
      overzicht: {
        klassen,
        stof: stof.map((s) => ({
          vakId: s.vak_id,
          vak: vakById(s.vak_id)?.titel ?? s.vak_id,
          hoofdstukId: s.hoofdstuk_id,
          paragraafId: s.paragraaf_id,
          label: paragraafLabel(s.hoofdstuk_id, s.paragraaf_id),
          oefeningen: s.oefeningen,
          lastig: s.lastig,
          behaald: s.behaald,
          totaal: s.totaal,
        })),
        totaal: totaalRow[0]?.n ?? 0,
        bank: await telBank().catch(() => 0),
      },
    };
  });
