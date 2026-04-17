WITH u AS (
    SELECT id FROM public.profiles LIMIT 1
)
INSERT INTO public.businesses (
    owner_id, name, slug, description, business_type, status,
    location, address, municipality, phone, photos
) SELECT 
    id, name, slug, description, business_type::text, status,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326), address, municipality, phone, photos::jsonb
FROM u CROSS JOIN (
    VALUES 
    -- Cafeterías
    ('Marito & Mogaburo', 'marito-mogaburo', 'Cafetería de especialidad e italiana.', 'cafeteria', 'activo', -89.6200, 20.9800, 'Calle 58, Paseo de Montejo', 'Mérida', '+529990000001', '["https://images.unsplash.com/photo-1509042239860-f550ce710b93"]'),
    ('Manifesto Tostaduría', 'manifesto-tostaduria', 'Café tostado localmente, excelente calidad.', 'cafeteria', 'activo', -89.6225, 20.9705, 'Calle 59, Centro', 'Mérida', '+529990000002', '["https://images.unsplash.com/photo-1497935586351-b67a49e012bf"]'),
    ('Bengala Kaffeehaus', 'bengala-kaffeehaus', 'Café en el centro histórico.', 'cafeteria', 'activo', -89.6210, 20.9680, 'Calle 60, Centro', 'Mérida', '+529990000003', '["https://images.unsplash.com/photo-1554118811-1e0d58224f24"]'),
    -- Restaurantes
    ('Museo de la Gastronomía Yucateca', 'mugy-merida', 'Comida tradicional en un entorno de museo.', 'restaurante', 'activo', -89.6230, 20.9710, 'Calle 62, Centro', 'Mérida', '+529990000004', '["https://images.unsplash.com/photo-1514326640560-7d063ef2aed5"]'),
    ('Manjar Blanco', 'manjar-blanco', 'Cochinita pibil y antojitos yucatecos.', 'restaurante', 'activo', -89.6240, 20.9750, 'Parque de Santa Ana', 'Mérida', '+529990000005', '["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"]'),
    ('La Chaya Maya', 'chaya-maya-centro', 'Comida tradicional yucateca.', 'restaurante', 'activo', -89.6225, 20.9699, 'Calle 55, Centro', 'Mérida', '+529999284780', '["https://media-cdn.tripadvisor.com/media/photo-s/17/a3/52/63/la-chaya-maya.jpg"]'),
    -- Talleres / Tiendas
    ('Bicimotos', 'bicimotos-merida', 'Venta y reparación de bicicletas.', 'taller_bicicletas', 'activo', -89.6150, 20.9850, 'Prol. Montejo', 'Mérida', '+529990000006', '["https://images.unsplash.com/photo-1581508775463-547372b6ad15"]'),
    ('Bike Center Mérida', 'bike-center-merida', 'Refacciones y servicio para ciclistas.', 'taller_bicicletas', 'activo', -89.6100, 20.9900, 'Norte', 'Mérida', '+529990000007', '["https://images.unsplash.com/photo-1511994298241-608e28f14fde"]'),
    -- Mercados
    ('Mercado Lucas de Gálvez', 'mercado-lucas-de-galvez', 'El mercado más grande y tradicional de Mérida.', 'mercado', 'activo', -89.6215, 20.9630, 'Calle 65, Centro', 'Mérida', '+529990000008', '["https://images.unsplash.com/photo-1533900298318-6b8da08a523e"]'),
    ('Mercado de Santa Ana', 'mercado-santa-ana', 'Ideal para panuchos y salbutes matutinos.', 'mercado', 'activo', -89.6245, 20.9755, 'Parque de Santa Ana', 'Mérida', '+529990000009', '["https://images.unsplash.com/photo-1555939594-58d7cb561ad1"]')
) AS t(name, slug, description, business_type, status, lng, lat, address, municipality, phone, photos);
