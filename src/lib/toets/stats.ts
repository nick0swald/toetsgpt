import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { env } from "@/lib/env.server";
import { KLASSEN } from "./types";
import { paragraafLabel, vakById } from "./stof";

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
    const toegestaan = new Set<string>(KLASSEN);
    let n = 0;
    for (const e of data.events) {
      if (!toegestaan.has(e.klas)) continue;
      if (!vakById(e.vakId)) continue;
      await sql`
        insert into oefen_events (klas, vak_id, hoofdstuk_id, paragraaf_id, lastig, cijfer_bucket)
        values (${e.klas}, ${e.vakId}, ${e.hoofdstukId}, ${e.paragraafId}, ${e.lastig}, ${e.cijferBucket})
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
};

export type Overzicht = {
  klassen: KlasRij[];
  stof: StofRij[];
  totaal: number;
};

export const leesOverzicht = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ pin: z.string().max(24) }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true; overzicht: Overzicht } | { ok: false; error: string }> => {
    if (!pinOk(data.pin)) return { ok: false, error: "Onjuiste code." };
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
    }>`
      select vak_id, hoofdstuk_id, paragraaf_id,
        count(*)::int as oefeningen,
        sum(case when lastig then 1 else 0 end)::int as lastig
      from oefen_events
      where created_at > now() - interval '28 days'
      group by vak_id, hoofdstuk_id, paragraaf_id
      order by lastig desc, oefeningen desc
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
        })),
        totaal: totaalRow[0]?.n ?? 0,
      },
    };
  });
