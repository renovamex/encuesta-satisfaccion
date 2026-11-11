-- Agregados para el dashboard. security invoker => respeta RLS (solo el equipo ve datos).
-- NPS = % promotores (9-10) - % detractores (0-6).

create function public.resumen_dashboard(
  p_canal canal_encuesta default null,
  p_sucursal uuid default null,
  p_desde timestamptz default null,
  p_hasta timestamptz default null
) returns jsonb
language sql stable security invoker set search_path = public as $$
  with f as (
    select r.*
    from public.respuestas r
    where (p_canal is null or r.canal = p_canal)
      and (p_sucursal is null or r.sucursal_id = p_sucursal)
      and (p_desde is null or r.creada_en >= p_desde)
      and (p_hasta is null or r.creada_en < p_hasta)
  ),
  general as (
    select jsonb_build_object(
      'total', count(*),
      'satisfaccion', round(avg(satisfaccion), 2),
      'atencion', round(avg(atencion), 2),
      'producto_entrega', round(avg(producto_entrega), 2),
      'nps', round(
        100.0 * (count(*) filter (where nps >= 9) - count(*) filter (where nps <= 6)) / nullif(count(*), 0),
        1
      )
    ) as j
    from f
  ),
  por_canal as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'canal', canal,
      'total', total,
      'satisfaccion', satisfaccion,
      'atencion', atencion,
      'producto_entrega', producto_entrega,
      'nps', nps
    ) order by canal), '[]'::jsonb) as j
    from (
      select
        canal,
        count(*) as total,
        round(avg(satisfaccion), 2) as satisfaccion,
        round(avg(atencion), 2) as atencion,
        round(avg(producto_entrega), 2) as producto_entrega,
        round(100.0 * (count(*) filter (where nps >= 9) - count(*) filter (where nps <= 6)) / nullif(count(*), 0), 1) as nps
      from f
      group by canal
    ) t
  ),
  por_sucursal as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'sucursal_id', sucursal_id,
      'nombre', nombre,
      'total', total,
      'satisfaccion', satisfaccion,
      'atencion', atencion,
      'producto_entrega', producto_entrega,
      'nps', nps
    ) order by nombre), '[]'::jsonb) as j
    from (
      select
        f.sucursal_id,
        coalesce(s.nombre, 'Sin sucursal') as nombre,
        count(*) as total,
        round(avg(f.satisfaccion), 2) as satisfaccion,
        round(avg(f.atencion), 2) as atencion,
        round(avg(f.producto_entrega), 2) as producto_entrega,
        round(100.0 * (count(*) filter (where f.nps >= 9) - count(*) filter (where f.nps <= 6)) / nullif(count(*), 0), 1) as nps
      from f
      left join public.sucursales s on s.id = f.sucursal_id
      group by f.sucursal_id, s.nombre
    ) t
  ),
  tendencia as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'dia', dia,
      'total', total,
      'satisfaccion', satisfaccion
    ) order by dia), '[]'::jsonb) as j
    from (
      select
        (creada_en at time zone 'America/Mexico_City')::date as dia,
        count(*) as total,
        round(avg(satisfaccion), 2) as satisfaccion
      from f
      group by 1
    ) t
  ),
  pendientes as (
    select count(*) as n from public.seguimientos where estado = 'pendiente'
  )
  select jsonb_build_object(
    'general', (select j from general),
    'por_canal', (select j from por_canal),
    'por_sucursal', (select j from por_sucursal),
    'tendencia', (select j from tendencia),
    'seguimientos_pendientes', (select n from pendientes)
  );
$$;

revoke all on function public.resumen_dashboard(canal_encuesta, uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.resumen_dashboard(canal_encuesta, uuid, timestamptz, timestamptz) to authenticated;
