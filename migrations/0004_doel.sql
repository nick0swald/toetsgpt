alter table oefen_events add column if not exists doel_id text;

create index if not exists oefen_events_doel_idx
  on oefen_events (doel_id);
