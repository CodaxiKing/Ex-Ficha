-- Ex-Ficha: tabela de backup. Rode no SQL Editor do seu projeto Supabase.
-- Cada pessoa tem uma linha com o estado do app (sem as fotos, que ficam no aparelho).

create table if not exists public.backups (
  user_id uuid primary key references auth.users (id) on delete cascade,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);

alter table public.backups enable row level security;

-- Cada um só lê e escreve o próprio backup.
create policy "backup: ler o próprio" on public.backups
  for select using (auth.uid() = user_id);
create policy "backup: criar o próprio" on public.backups
  for insert with check (auth.uid() = user_id);
create policy "backup: atualizar o próprio" on public.backups
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "backup: apagar o próprio" on public.backups
  for delete using (auth.uid() = user_id);
