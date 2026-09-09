create table if not exists oefen_events (
  id serial primary key,
  klas text not null,
  vak_id text not null,
  hoofdstuk_id text not null,
  paragraaf_id text not null,
  lastig boolean not null default false,
  cijfer_bucket text not null,
  created_at timestamptz not null default now()
);

create index if not exists oefen_events_klas_idx
  on oefen_events (klas, created_at desc);

create index if not exists oefen_events_stof_idx
  on oefen_events (vak_id, hoofdstuk_id, paragraaf_id);
