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
    -- Restaurantes
    ('Eladio''s Bar Progreso', 'eladios-progreso', 'Restaurante familiar con botanas yucatecas frente al mar.', 'restaurante', 'activo', -89.6640, 21.2850, 'Malecón', 'Progreso', '+529990000010', '["https://images.unsplash.com/photo-1544148103-0773bf10d330"]'),
    ('Crabster', 'crabster-progreso', 'Mariscos premium y vistas al golfo.', 'restaurante', 'activo', -89.6620, 21.2840, 'Malecón', 'Progreso', '+529990000011', '["https://images.unsplash.com/photo-1559314809-0d155014e29e"]'),
    ('Los Trompos Progreso', 'trompos-progreso', 'Tacos al pastor y comida rápida regional.', 'restaurante', 'activo', -89.6600, 21.2820, 'Calle 78', 'Progreso', '+529990000012', '["https://images.unsplash.com/photo-1551504734-5ee1c4a1479b"]'),
    -- Conveniencia
    ('Oxxo Malecón', 'oxxo-malecon-progreso', 'Punto de hidratación y snacks.', 'tienda_conveniencia', 'activo', -89.6650, 21.2855, 'Malecón esq. Calle 80', 'Progreso', NULL, '["https://images.unsplash.com/photo-1601599561096-f87c95fff1e9"]'),
    ('Six Chicxulub', 'six-chicxulub', 'Bebidas y abastecimiento rápido.', 'tienda_conveniencia', 'activo', -89.6000, 21.2900, 'Centro', 'Chicxulub', NULL, '["https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff"]'),
    -- Hospedajes
    ('Hotel Costa Club', 'hotel-costa-club', 'Descanso con piscina frente a la playa.', 'hospedaje', 'activo', -89.6700, 21.2830, 'Avenida Malecón', 'Progreso', '+529990000013', '["https://images.unsplash.com/photo-1566073771259-6a8506099945"]')
) AS t(name, slug, description, business_type, status, lng, lat, address, municipality, phone, photos);
