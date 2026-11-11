-- Sucursales de Renova México. Los enlaces son los de la ficha de Google Maps del sitio;
-- reemplazar por el enlace de reseña directa (g.page/r/.../review) desde el backoffice.
insert into public.sucursales (nombre, slug, url_resena_google) values
  ('Atizapán', 'atizapan', 'https://maps.app.goo.gl/Mv6g1EX7Cow8G4tC7'),
  ('Tepotzotlán', 'tepotzotlan', 'https://maps.app.goo.gl/dY7QAfPbAf9SCJwy7'),
  ('Tepojaco', 'tepojaco', 'https://maps.app.goo.gl/NZDjhftsUZ19QpMg6'),
  ('Cuautitlán Izcalli', 'cuautitlan-izcalli', 'https://maps.app.goo.gl/dW1dtuvoyGYt3HtN6')
on conflict (slug) do nothing;
