-- =====================================================
-- SCHEMA DE BASE DE DATOS PARA SUPABASE
-- Summit Empresarial México
-- =====================================================

-- Habilitar extensión para UUIDs si no está habilitada
create extension if not exists "uuid-ossp";

-- 1. TABLA DE USUARIOS / ASISTENTES REGISTRADOS
create table if not exists public.usuarios (
    id uuid primary key default uuid_generate_v4(),
    auth_user_id uuid references auth.users(id) on delete set null,
    nombre varchar(100) not null,
    apellido_paterno varchar(100) not null,
    apellido_materno varchar(100) default '',
    correo varchar(150) not null unique,
    telefono varchar(30) not null,
    password_hash text, -- Para login directo si no se usa Supabase Auth
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABLA DE BOLETOS
create table if not exists public.boletos (
    id uuid primary key default uuid_generate_v4(),
    codigo_boleto varchar(50) not null unique,
    usuario_id uuid references public.usuarios(id) on delete cascade,
    nombre varchar(100) not null,
    apellido_paterno varchar(100) not null,
    apellido_materno varchar(100) default '',
    correo varchar(150) not null,
    telefono varchar(30) not null,
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

-- Índices para búsquedas rápidas
create index if not exists idx_boletos_codigo on public.boletos (codigo_boleto);
create index if not exists idx_boletos_correo on public.boletos (correo);
create index if not exists idx_usuarios_correo on public.usuarios (correo);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - SEGURIDAD SUPABASE
-- =====================================================
alter table public.usuarios enable row level security;
alter table public.boletos enable row level security;

-- Políticas para 'usuarios'
create policy "Permitir registro de nuevos usuarios"
    on public.usuarios for insert
    with check (true);

create policy "Permitir lectura de perfil por correo"
    on public.usuarios for select
    using (true);

-- Políticas para 'boletos'
create policy "Permitir crear boleto con compra"
    on public.boletos for insert
    with check (true);

create policy "Permitir ver boletos"
    on public.boletos for select
    using (true);

create policy "Permitir validar boleto para ingreso"
    on public.boletos for update
    using (true)
    with check (true);

