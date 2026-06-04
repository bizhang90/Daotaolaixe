-- ĐÀO TẠO LÁI XE – BÁO CÁO MARKETING
-- Cơ sở dữ liệu chính thức cho vận hành online trên Supabase.
-- Chạy file này trong Supabase SQL Editor sau khi tạo Project.

create table if not exists public.members (
  record_id text primary key,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  owner_code text not null,
  record jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_reports (
  record_id text primary key,
  owner_code text not null,
  record jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.content_topics (
  record_id text primary key,
  owner_code text not null,
  record jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.products (
  record_id text primary key,
  owner_code text not null,
  record jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.outcomes (
  record_id text primary key,
  owner_code text not null,
  record jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.other_work (
  record_id text primary key,
  owner_code text not null,
  record jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.members enable row level security;
alter table public.daily_reports enable row level security;
alter table public.content_topics enable row level security;
alter table public.products enable row level security;
alter table public.outcomes enable row level security;
alter table public.other_work enable row level security;

create or replace function public.current_staff_code()
returns text language sql stable security definer set search_path=public as $$
  select record_id from public.members where auth_user_id = auth.uid() limit 1;
$$;
create or replace function public.current_staff_role()
returns text language sql stable security definer set search_path=public as $$
  select record->>'role' from public.members where auth_user_id = auth.uid() limit 1;
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select coalesce(public.current_staff_role()='ADMIN', false);
$$;
create or replace function public.is_it()
returns boolean language sql stable security definer set search_path=public as $$
  select coalesce(public.current_staff_role() in ('ADMIN','IT_ADS','IT_SYSTEM'), false);
$$;

-- Nhân sự: mọi thành viên đã đăng nhập được đọc danh sách để phối hợp sản xuất;
-- chỉ Admin được sửa thông tin nhân sự.
drop policy if exists "members_read" on public.members;
drop policy if exists "members_admin_write" on public.members;
create policy "members_read" on public.members for select to authenticated using (true);
create policy "members_admin_write" on public.members for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Báo cáo ngày: nhân sự nhập/sửa báo cáo của mình; Admin và IT đọc tổng hợp.
drop policy if exists "daily_read" on public.daily_reports;
drop policy if exists "daily_insert" on public.daily_reports;
drop policy if exists "daily_update" on public.daily_reports;
drop policy if exists "daily_delete" on public.daily_reports;
create policy "daily_read" on public.daily_reports for select to authenticated
using (public.is_it() or owner_code = public.current_staff_code());
create policy "daily_insert" on public.daily_reports for insert to authenticated
with check (owner_code = public.current_staff_code() or public.is_admin());
create policy "daily_update" on public.daily_reports for update to authenticated
using (owner_code = public.current_staff_code() or public.is_admin())
with check (owner_code = public.current_staff_code() or public.is_admin());
create policy "daily_delete" on public.daily_reports for delete to authenticated
using (owner_code = public.current_staff_code() or public.is_admin());

-- Chủ đề: cả đội xem để tránh trùng lặp; Media/Talent/Admin được nhập;
-- người đề xuất hoặc Admin được sửa.
drop policy if exists "topic_read" on public.content_topics;
drop policy if exists "topic_insert" on public.content_topics;
drop policy if exists "topic_update" on public.content_topics;
create policy "topic_read" on public.content_topics for select to authenticated using (true);
create policy "topic_insert" on public.content_topics for insert to authenticated
with check (public.current_staff_role() in ('MEDIA','TALENT','ADMIN') and (owner_code=public.current_staff_code() or public.is_admin()));
create policy "topic_update" on public.content_topics for update to authenticated
using (owner_code=public.current_staff_code() or public.is_admin())
with check (owner_code=public.current_staff_code() or public.is_admin());

-- Sản phẩm: cả đội xem; người thực hiện chính hoặc Admin nhập/sửa.
drop policy if exists "product_read" on public.products;
drop policy if exists "product_insert" on public.products;
drop policy if exists "product_update" on public.products;
create policy "product_read" on public.products for select to authenticated using (true);
create policy "product_insert" on public.products for insert to authenticated
with check (owner_code=public.current_staff_code() or public.is_admin());
create policy "product_update" on public.products for update to authenticated
using (owner_code=public.current_staff_code() or public.is_admin())
with check (owner_code=public.current_staff_code() or public.is_admin());

-- Ads & kết quả: cả đội được xem hiệu quả; IT Ads và Admin nhập/sửa.
drop policy if exists "outcome_read" on public.outcomes;
drop policy if exists "outcome_write" on public.outcomes;
create policy "outcome_read" on public.outcomes for select to authenticated using (true);
create policy "outcome_write" on public.outcomes for all to authenticated
using (public.current_staff_role() in ('ADMIN','IT_ADS'))
with check (public.current_staff_role() in ('ADMIN','IT_ADS'));

-- Công việc khác: nhân sự nhập của mình; IT/Admin xem tổng hợp; chỉ Admin duyệt/sửa bản ghi người khác.
drop policy if exists "other_read" on public.other_work;
drop policy if exists "other_insert" on public.other_work;
drop policy if exists "other_update" on public.other_work;
create policy "other_read" on public.other_work for select to authenticated
using (public.is_it() or owner_code=public.current_staff_code());
create policy "other_insert" on public.other_work for insert to authenticated
with check (owner_code=public.current_staff_code() or public.is_admin());
create policy "other_update" on public.other_work for update to authenticated
using (owner_code=public.current_staff_code() or public.is_admin())
with check (owner_code=public.current_staff_code() or public.is_admin());

-- Sau khi tạo 8 tài khoản ở Authentication > Users, thay UUID tương ứng và chạy khối dưới đây.
-- Admin cần được insert trước qua SQL Editor; sau đó có thể chỉnh tên/KPI trong app.
/*
insert into public.members (record_id, auth_user_id, owner_code, record) values
('ADMIN',    'UUID_ADMIN',    'ADMIN',    '{"id":"ADMIN","name":"Quản lý","role":"ADMIN","kpi":"Tổng hợp và đánh giá","active":true}'),
('MEDIA-01', 'UUID_MEDIA_01', 'MEDIA-01', '{"id":"MEDIA-01","name":"Media 01","role":"MEDIA","kpi":"Nội dung & sản phẩm","active":true}'),
('MEDIA-02', 'UUID_MEDIA_02', 'MEDIA-02', '{"id":"MEDIA-02","name":"Media 02","role":"MEDIA","kpi":"Nội dung & sản phẩm","active":true}'),
('MEDIA-03', 'UUID_MEDIA_03', 'MEDIA-03', '{"id":"MEDIA-03","name":"Media 03","role":"MEDIA","kpi":"Nội dung & sản phẩm","active":true}'),
('TALENT-01','UUID_TALENT_01','TALENT-01','{"id":"TALENT-01","name":"Talent 01","role":"TALENT","kpi":"Lên hình & nội dung","active":true}'),
('TALENT-02','UUID_TALENT_02','TALENT-02','{"id":"TALENT-02","name":"Talent 02","role":"TALENT","kpi":"Lên hình & nội dung","active":true}'),
('IT-01',    'UUID_IT_01',    'IT-01',    '{"id":"IT-01","name":"IT 01","role":"IT_ADS","kpi":"Ads, Lead & Kết quả","active":true}'),
('IT-02',    'UUID_IT_02',    'IT-02',    '{"id":"IT-02","name":"IT 02","role":"IT_SYSTEM","kpi":"Hệ thống & báo cáo","active":true}')
on conflict (record_id) do update set auth_user_id=excluded.auth_user_id, record=excluded.record, updated_at=now();
*/
