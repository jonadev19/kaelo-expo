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
    -- Homún / Cuzamá (Cenotes)
    ('Parador Turístico Santa Bárbara', 'parador-santa-barbara', 'Acceso a tres hermosos cenotes y restaurante.', 'restaurante', 'activo', -89.2800, 20.7300, 'Afueras de Homún', 'Homún', '+529990000014', '["https://images.unsplash.com/photo-1629807466487-73d712ce526d"]'),
    ('Abarrotes El Centro', 'abarrotes-homun', 'Ideal para comprar agua y fruta antes de la ruta.', 'tienda', 'activo', -89.2900, 20.7400, 'Plaza Principal', 'Homún', NULL, '["https://images.unsplash.com/photo-1534723452862-4c874018d66d"]'),
    ('Mercado Municipal Cuzamá', 'mercado-cuzama', 'Desayunos económicos locales.', 'mercado', 'activo', -89.3100, 20.7450, 'Centro', 'Cuzamá', NULL, '["https://images.unsplash.com/photo-1533900298318-6b8da08a523e"]'),
    
    -- Izamal
    ('Restaurante Kinich', 'kinich-izamal', 'Referente gastronómico de Izamal.', 'restaurante', 'activo', -89.0180, 20.9320, 'Calle 27', 'Izamal', '+529990000015', '["https://images.unsplash.com/photo-1555939594-58d7cb561ad1"]'),
    ('Convento de Izamal (Referencia)', 'convento-izamal', 'Punto de encuentro y área de descanso.', 'otro', 'activo', -89.0175, 20.9330, 'Centro', 'Izamal', NULL, '["https://images.unsplash.com/photo-1582230043834-4537d94cf212"]'),

    -- Valladolid
    ('Mesón del Marqués', 'meson-del-marques', 'Hospedaje tradicional y restaurante premium.', 'hospedaje', 'activo', -88.2010, 20.6900, 'Plaza Principal', 'Valladolid', '+529990000016', '["https://images.unsplash.com/photo-1566073771259-6a8506099945"]'),
    ('La Casona de Valladolid', 'la-casona-valladolid', 'Restaurante con comida típica.', 'restaurante', 'activo', -88.2020, 20.6890, 'Calle 41', 'Valladolid', '+529990000017', '["https://images.unsplash.com/photo-1514326640560-7d063ef2aed5"]'),
    ('Mercado Municipal Valladolid', 'mercado-valladolid', 'Comida local, antojitos y abastecimiento.', 'mercado', 'activo', -88.1990, 20.6910, 'Centro', 'Valladolid', NULL, '["https://images.unsplash.com/photo-1533900298318-6b8da08a523e"]')
) AS t(name, slug, description, business_type, status, lng, lat, address, municipality, phone, photos);
