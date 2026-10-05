import { getSql } from "@/lib/db";
import { BANK_ALIAS } from "./nova";
import { bioBank } from "./bio";
import { voorbeeldVragen } from "./demo";
import type { Question } from "./types";

const RIJP = 16;

function sleutel(q: Question): string {
  const s = `${q.type}|${q.skill ?? ""}|${q.situation}|${q.prompt}|${q.modelAnswer}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `v${(h >>> 0).toString(36)}`;
}

async function tabel(): Promise<void> {
  const sql = await getSql();
  await sql.query(`
    create table if not exists vraag_bank (
      id text primary key,
      vak_id text not null,
      hoofdstuk_id text not null,
      paragraaf_id text not null,
      skill text not null,
      soort text not null,
      bron text not null,
      payload text not null,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(`alter table oefen_events add column if not exists behaald integer`);
  await sql.query(`alter table oefen_events add column if not exists totaal integer`);
  await sql.query(`alter table oefen_events add column if not exists doel_id text`);
}

export function zorgVoorTabellen(): Promise<void> {
  return tabel();
}

let zaad: Promise<void> | null = null;

export function zorgVoorZaad(): Promise<void> {
  zaad ??= (async () => {
    await tabel();
    const sql = await getSql();
    const n = await sql<{ n: number }>`select count(*)::int as n from vraag_bank where bron = 'demo' and vak_id = 'nask'`;
    if ((n[0]?.n ?? 0) === 0) {
      await bewaarVragen(voorbeeldVragen(1), "demo", "nask");
      await bewaarVragen(voorbeeldVragen(2), "demo", "nask");
    }
    const bio = await sql<{ n: number }>`
      select count(*)::int as n from vraag_bank
      where vak_id = 'biologie' and payload like '%vitale capaciteit%'
    `;
    if ((bio[0]?.n ?? 0) === 0) {
      await sql`delete from vraag_bank where vak_id = 'biologie'`;
      await bewaarVragen(bioBank(), "demo", "biologie");
    }
  })().catch((err) => {
    zaad = null;
    throw err;
  });
  return zaad;
}

export async function bewaarVragen(vragen: Question[], bron: "demo" | "ai", vakId: string): Promise<number> {
  await tabel();
  const sql = await getSql();
  let n = 0;
  for (const q of vragen) {
    if (!q.stof?.hoofdstukId || !q.prompt || !q.situation) continue;
    const id = sleutel(q);
    const rows = await sql`
      insert into vraag_bank (id, vak_id, hoofdstuk_id, paragraaf_id, skill, soort, bron, payload)
      values (
        ${id},
        ${vakId},
        ${q.stof.hoofdstukId},
        ${q.stof.paragraafId},
        ${q.skill ?? "stof"},
        ${q.type},
        ${bron},
        ${JSON.stringify(q)}
      )
      on conflict (id) do nothing
      returning id
    `;
    n += rows.length;
  }
  return n;
}

function stofIds(hoofdstukId?: string): Set<string> {
  if (!hoofdstukId) return new Set();
  return new Set([hoofdstukId, ...(BANK_ALIAS[hoofdstukId] ?? [])]);
}

export async function pakVragen(opts: {
  vakId: string;
  hoofdstukId?: string;
  paragraafIds?: string[];
  soort?: string;
  limit?: number;
}): Promise<Question[]> {
  await tabel();
  const sql = await getSql();
  const rows = await sql<{ payload: string }>`
    select payload from vraag_bank
    where vak_id = ${opts.vakId || "nask"}
    order by created_at desc
    limit 400
  `;
  const ids = stofIds(opts.hoofdstukId);
  const paras = new Set(opts.paragraafIds ?? []);
  let list: Question[] = [];
  for (const row of rows) {
    try {
      const q = JSON.parse(row.payload) as Question;
      if (ids.size && !ids.has(q.stof?.hoofdstukId ?? "")) continue;
      if (opts.soort === "lees" && q.skill !== "lees") continue;
      if (opts.soort === "mc" && (q.type !== "mc" || q.skill === "lees")) continue;
      if (opts.soort === "open" && q.type !== "open") continue;
      if (opts.soort === "invul" && q.type !== "invul") continue;
      list.push(q);
    } catch {
      /* kapotte rij slaan we over */
    }
  }
  if (paras.size) {
    const nauw = list.filter((q) => q.stof && paras.has(q.stof.paragraafId));
    if (nauw.length >= 4) list = nauw;
  }
  return list.slice(0, opts.limit ?? 40);
}

export function bankIsRijp(n: number): boolean {
  return n >= RIJP;
}

export async function telBank(): Promise<number> {
  await tabel();
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*)::int as n from vraag_bank`;
  return rows[0]?.n ?? 0;
}
