-- =====================================================
-- SCHEMA DE BASE DE DATOS PARA SUPABASE
-- Summit Empresarial México
-- =====================================================

-- Habilitar extensión para UUIDs
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. TABLA DE USUARIOS / PERFILES VINCULADOS A SUPABASE AUTH
create table if not exists public.usuarios (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid unique references auth.users(id) on delete set null,
    nombre varchar(100) not null,
    apellido_paterno varchar(100) not null,
    apellido_materno varchar(100) default '',
    correo varchar(150) not null unique,
    telefono varchar(30) default '',
    rol varchar(30) default 'asistente', -- 'asistente', 'staff', 'admin'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABLA DE BOLETOS
create table if not exists public.boletos (
    id uuid primary key default gen_random_uuid(),
    codigo_boleto varchar(50) not null unique,
    usuario_id uuid references public.usuarios(id) on delete cascade,
    auth_user_id uuid references auth.users(id) on delete set null,
    nombre varchar(100) not null,
    apellido_paterno varchar(100) not null,
    apellido_materno varchar(100) default '',
    correo varchar(150) not null,
    telefono varchar(30) default '',
    tipo_acceso varchar(50) default 'Acceso Completo',
    precio numeric(10, 2) default 350.00,
    moneda varchar(10) default 'MXN',
    estado_pago varchar(30) default 'PAGADO', -- 'PENDIENTE', 'PAGADO', 'CANCELADO'
    stripe_payment_id varchar(150),
    stripe_session_id varchar(150),
    usado smallint default 0, -- 0 = No usado, 1 = Usado / Ingresó
    fecha_uso timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices de alto rendimiento
create index if not exists idx_usuarios_auth_user_id on public.usuarios (auth_user_id);
create index if not exists idx_usuarios_correo on public.usuarios (correo);
create index if not exists idx_boletos_codigo on public.boletos (codigo_boleto);
create index if not exists idx_boletos_correo on public.boletos (correo);
create index if not exists idx_boletos_auth_user_id on public.boletos (auth_user_id);
create index if not exists idx_boletos_usuario_id on public.boletos (usuario_id);

-- 3. TRIGGER DE SINCRONIZACIÓN AUTOMÁTICA: auth.users -> public.usuarios
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (
    id,
    auth_user_id,
    correo,
    nombre,
    apellido_paterno,
    apellido_materno,
    telefono,
    rol
  )
  values (
    new.id,
    new.id,
    lower(trim(new.email)),
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'apellido_paterno', ''),
    coalesce(new.raw_user_meta_data->>'apellido_materno', ''),
    coalesce(new.raw_user_meta_data->>'telefono', ''),
    coalesce(new.raw_app_meta_data->>'rol', 'asistente')
  )
  on conflict (correo) do update set
    auth_user_id = excluded.auth_user_id,
    nombre = case when public.usuarios.nombre = '' or public.usuarios.nombre is null then excluded.nombre else public.usuarios.nombre end,
    apellido_paterno = case when public.usuarios.apellido_paterno = '' or public.usuarios.apellido_paterno is null then excluded.apellido_paterno else public.usuarios.apellido_paterno end,
    telefono = case when public.usuarios.telefono = '' or public.usuarios.telefono is null then excluded.telefono else public.usuarios.telefono end;

  return new;
end;
$$;

-- Buenas prácticas de seguridad: revocar ejecución directa desde roles públicos
revoke execute on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Función auxiliar para verificar si el usuario actual es admin/staff
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios
    where auth_user_id = (select auth.uid()) and rol in ('admin', 'staff')
  );
$$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - SEGURIDAD SUPABASE
-- =====================================================
alter table public.usuarios enable row level security;
alter table public.boletos enable row level security;

-- Limpieza de políticas previas si existían
drop policy if exists "Permitir registro de nuevos usuarios" on public.usuarios;
drop policy if exists "Permitir lectura de perfil por correo" on public.usuarios;
drop policy if exists "Usuarios pueden ver su propio perfil" on public.usuarios;
drop policy if exists "Usuarios pueden actualizar su propio perfil" on public.usuarios;
drop policy if exists "Permitir insercion de perfil" on public.usuarios;

drop policy if exists "Permitir crear boleto con compra" on public.boletos;
drop policy if exists "Permitir ver boletos" on public.boletos;
drop policy if exists "Permitir validar boleto para ingreso" on public.boletos;
drop policy if exists "Usuarios pueden ver sus propios boletos o admins" on public.boletos;
drop policy if exists "Permitir consulta publica de boletos por codigo" on public.boletos;
drop policy if exists "Permitir crear boletos" on public.boletos;
drop policy if exists "Staff o admin pueden actualizar estado de boletos" on public.boletos;
drop policy if exists "Admins pueden eliminar boletos" on public.boletos;

-- Políticas para 'usuarios'
create policy "Usuarios pueden ver su propio perfil"
    on public.usuarios for select
    to authenticated
    using ( (select auth.uid()) = auth_user_id or public.is_admin() );

create policy "Usuarios pueden actualizar su propio perfil"
    on public.usuarios for update
    to authenticated
    using ( (select auth.uid()) = auth_user_id or public.is_admin() )
    with check ( (select auth.uid()) = auth_user_id or public.is_admin() );

create policy "Permitir insercion de perfil"
    on public.usuarios for insert
    to anon, authenticated
    with check ( true );

-- Políticas para 'boletos'
create policy "Usuarios pueden ver sus propios boletos o admins"
    on public.boletos for select
    to authenticated
    using (
        (select auth.uid()) = auth_user_id
        or correo = (select auth.jwt()->>'email')
        or public.is_admin()
    );

create policy "Permitir consulta publica de boletos por codigo"
    on public.boletos for select
    to anon
    using ( true );

create policy "Permitir crear boletos"
    on public.boletos for insert
    to anon, authenticated
    with check ( true );

create policy "Staff o admin pueden actualizar estado de boletos"
    on public.boletos for update
    to authenticated
    using ( public.is_admin() or (select auth.uid()) = auth_user_id )
    with check ( public.is_admin() or (select auth.uid()) = auth_user_id );

create policy "Admins pueden eliminar boletos"
    on public.boletos for delete
    to authenticated
    using ( public.is_admin() );

-- =====================================================
-- EXPOSICIÓN DATA API (GRANTS)
-- =====================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.usuarios to authenticated;
grant select, insert on public.usuarios to anon;
grant select, insert, update, delete on public.boletos to authenticated;
grant select, insert, update on public.boletos to anon;

-- =====================================================
-- USUARIO ADMINISTRADOR PRINCIPAL (Antonio Rincón)
-- =====================================================
insert into public.usuarios (
    nombre,
    apellido_paterno,
    correo,
    telefono,
    rol
)
values (
    'Antonio',
    'Rincón',
    'antonio.rincon@summitempresarial.com',
    '5500000000',
    'admin'
)
on conflict (correo) do update set
    rol = 'admin',
    nombre = 'Antonio',
    apellido_paterno = 'Rincón';

