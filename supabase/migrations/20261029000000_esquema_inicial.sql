-- Esquema inicial: encuesta de satisfacción Renova
-- Una sola base con campo `canal` (tienda / mayoreo).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type canal_encuesta as enum ('tienda', 'mayoreo');
create type rol_usuario as enum ('admin', 'equipo');
-- "vencida" no se guarda: se deriva de vence_en < now() cuando el estado es 'enviada'.
create type estado_invitacion as enum ('enviada', 'respondida', 'anulada');
create type estado_seguimiento as enum ('pendiente', 'atendido', 'cerrado');

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
create table public.sucursales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  url_resena_google text,
  activa boolean not null default true,
  creada_en timestamptz not null default now()
);

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  rol rol_usuario not null default 'equipo',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table public.invitaciones_mayoreo (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(18), 'hex'),
  numero_pedido text not null check (numero_pedido = upper(btrim(numero_pedido)) and length(numero_pedido) between 1 and 40),
  sucursal_id uuid references public.sucursales (id),
  referencia_cliente text,
  monto_ticket numeric(12, 2) check (monto_ticket is null or monto_ticket >= 0),
  estado estado_invitacion not null default 'enviada',
  creada_por uuid not null references public.perfiles (id),
  creada_en timestamptz not null default now(),
  vence_en timestamptz not null default (now() + interval '30 days'),
  respondida_en timestamptz
);

-- Un pedido de mayoreo solo puede tener una liga viva (enviada o respondida).
create unique index invitaciones_pedido_vigente_idx
  on public.invitaciones_mayoreo (numero_pedido)
  where estado in ('enviada', 'respondida');

create table public.respuestas (
  id uuid primary key default gen_random_uuid(),
  canal canal_encuesta not null,
  sucursal_id uuid references public.sucursales (id),
  numero_pedido text not null check (numero_pedido = upper(btrim(numero_pedido)) and length(numero_pedido) between 1 and 40),
  invitacion_id uuid unique references public.invitaciones_mayoreo (id),
  satisfaccion smallint not null check (satisfaccion between 1 and 5),
  nps smallint not null check (nps between 0 and 10),
  atencion smallint not null check (atencion between 1 and 5),
  producto_entrega smallint not null check (producto_entrega between 1 and 5),
  comentario text check (comentario is null or length(comentario) <= 2000),
  monto_ticket numeric(12, 2) check (monto_ticket is null or monto_ticket >= 0),
  version_cuestionario smallint not null default 1,
  creada_en timestamptz not null default now(),
  -- Tienda siempre trae sucursal; mayoreo la trae solo "en caso de aplicar".
  check (canal = 'mayoreo' or sucursal_id is not null),
  unique nulls not distinct (canal, sucursal_id, numero_pedido)
);

create index respuestas_creada_en_idx on public.respuestas (creada_en desc);
create index respuestas_canal_sucursal_idx on public.respuestas (canal, sucursal_id, creada_en desc);
create index respuestas_monto_idx on public.respuestas (monto_ticket) where monto_ticket is not null;

create table public.seguimientos (
  respuesta_id uuid primary key references public.respuestas (id) on delete cascade,
  estado estado_seguimiento not null default 'pendiente',
  nota text,
  atendido_por uuid references public.perfiles (id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index seguimientos_estado_idx on public.seguimientos (estado, creado_en desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Alerta por calificación baja: CSAT <= 2 o NPS <= 6 (detractor).
create function public.crear_seguimiento_si_aplica() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.satisfaccion <= 2 or new.nps <= 6 then
    insert into public.seguimientos (respuesta_id) values (new.id)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger respuestas_seguimiento
after insert on public.respuestas
for each row execute function public.crear_seguimiento_si_aplica();

create function public.tocar_actualizado_en() returns trigger
language plpgsql as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create trigger seguimientos_actualizado
before update on public.seguimientos
for each row execute function public.tocar_actualizado_en();

-- Crea el perfil al dar de alta un usuario en auth. El rol se lee de app_metadata
-- (no editable por el usuario). El registro público está deshabilitado en config.toml.
create function public.crear_perfil_para_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce((new.raw_app_meta_data ->> 'rol')::rol_usuario, 'equipo')
  );
  return new;
end;
$$;

create trigger auth_usuario_nuevo
after insert on auth.users
for each row execute function public.crear_perfil_para_usuario();

-- ---------------------------------------------------------------------------
-- Funciones de captura (las llama solo el servidor con service_role)
-- ---------------------------------------------------------------------------

create function public.registrar_respuesta_tienda(
  p_sucursal_slug text,
  p_numero_pedido text,
  p_satisfaccion smallint,
  p_nps smallint,
  p_atencion smallint,
  p_producto_entrega smallint,
  p_comentario text,
  p_version smallint default 1
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_sucursal public.sucursales%rowtype;
  v_pedido text := upper(btrim(p_numero_pedido));
begin
  select * into v_sucursal from public.sucursales where slug = p_sucursal_slug and activa;
  if not found then
    return jsonb_build_object('estado', 'sucursal_invalida');
  end if;

  begin
    insert into public.respuestas (
      canal, sucursal_id, numero_pedido, satisfaccion, nps, atencion,
      producto_entrega, comentario, version_cuestionario
    ) values (
      'tienda', v_sucursal.id, v_pedido, p_satisfaccion, p_nps, p_atencion,
      p_producto_entrega, nullif(btrim(p_comentario), ''), p_version
    );
  exception when unique_violation then
    return jsonb_build_object('estado', 'duplicada');
  end;

  return jsonb_build_object('estado', 'ok', 'url_resena_google', v_sucursal.url_resena_google);
end;
$$;

create function public.registrar_respuesta_mayoreo(
  p_token text,
  p_satisfaccion smallint,
  p_nps smallint,
  p_atencion smallint,
  p_producto_entrega smallint,
  p_comentario text,
  p_version smallint default 1
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_inv public.invitaciones_mayoreo%rowtype;
begin
  -- Bloquea la fila para que dos envíos simultáneos no respondan la misma liga.
  select * into v_inv from public.invitaciones_mayoreo where token = p_token for update;
  if not found or v_inv.estado = 'anulada' then
    return jsonb_build_object('estado', 'invalida');
  end if;
  if v_inv.estado = 'respondida' then
    return jsonb_build_object('estado', 'ya_respondida');
  end if;
  if v_inv.vence_en < now() then
    return jsonb_build_object('estado', 'vencida');
  end if;

  insert into public.respuestas (
    canal, sucursal_id, numero_pedido, invitacion_id, satisfaccion, nps, atencion,
    producto_entrega, comentario, monto_ticket, version_cuestionario
  ) values (
    'mayoreo', v_inv.sucursal_id, v_inv.numero_pedido, v_inv.id, p_satisfaccion, p_nps,
    p_atencion, p_producto_entrega, nullif(btrim(p_comentario), ''), v_inv.monto_ticket, p_version
  );

  update public.invitaciones_mayoreo
     set estado = 'respondida', respondida_en = now()
   where id = v_inv.id;

  return jsonb_build_object('estado', 'ok');
end;
$$;

revoke all on function public.registrar_respuesta_tienda(text, text, smallint, smallint, smallint, smallint, text, smallint) from public, anon, authenticated;
revoke all on function public.registrar_respuesta_mayoreo(text, smallint, smallint, smallint, smallint, text, smallint) from public, anon, authenticated;
grant execute on function public.registrar_respuesta_tienda(text, text, smallint, smallint, smallint, smallint, text, smallint) to service_role;
grant execute on function public.registrar_respuesta_mayoreo(text, smallint, smallint, smallint, smallint, text, smallint) to service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
create function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin' and activo);
$$;

create function public.es_equipo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and activo);
$$;

alter table public.sucursales enable row level security;
alter table public.perfiles enable row level security;
alter table public.invitaciones_mayoreo enable row level security;
alter table public.respuestas enable row level security;
alter table public.seguimientos enable row level security;

-- sucursales: lectura para el equipo, escritura solo admin.
create policy sucursales_select on public.sucursales for select to authenticated using (public.es_equipo());
create policy sucursales_admin on public.sucursales for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- perfiles: cada quien ve el suyo; admin gestiona todos.
create policy perfiles_select on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_admin());
create policy perfiles_admin on public.perfiles for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- invitaciones: el equipo ve todas, crea a su nombre y puede actualizarlas (anular).
create policy invitaciones_select on public.invitaciones_mayoreo for select to authenticated
  using (public.es_equipo());
create policy invitaciones_insert on public.invitaciones_mayoreo for insert to authenticated
  with check (public.es_equipo() and creada_por = auth.uid());
create policy invitaciones_update on public.invitaciones_mayoreo for update to authenticated
  using (public.es_equipo()) with check (public.es_equipo());

-- respuestas: solo lectura para el equipo; el público no accede (inserta el servidor con service_role).
create policy respuestas_select on public.respuestas for select to authenticated using (public.es_equipo());

-- seguimientos: el equipo lee y actualiza estado/nota.
create policy seguimientos_select on public.seguimientos for select to authenticated using (public.es_equipo());
create policy seguimientos_update on public.seguimientos for update to authenticated
  using (public.es_equipo()) with check (public.es_equipo());

-- Permisos de tabla mínimos para `authenticated` (RLS decide el resto).
revoke all on public.sucursales, public.perfiles, public.invitaciones_mayoreo, public.respuestas, public.seguimientos from anon;
revoke all on public.respuestas, public.seguimientos from authenticated;
grant select on public.respuestas to authenticated;
grant select, update on public.seguimientos to authenticated;
revoke insert, update, delete on public.invitaciones_mayoreo from authenticated;
grant select, insert, update on public.invitaciones_mayoreo to authenticated;
