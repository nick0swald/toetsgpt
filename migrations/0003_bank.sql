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
);

create index if not exists vraag_bank_hoofdstuk_idx
  on vraag_bank (vak_id, hoofdstuk_id);

alter table oefen_events add column if not exists behaald integer;
alter table oefen_events add column if not exists totaal integer;
