# Carga de Comercios en Yucatán Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poblar la base de datos con ~30-50 comercios reales geolocalizados en Yucatán usando un script SQL ejecutado vía Supabase MCP.

**Architecture:** Crearemos un archivo SQL estructurado con CTEs (`WITH`) para extraer el ID del usuario creador y luego insertar en bloque múltiples registros en la tabla `businesses`. El script se ejecutará directamente contra la base de datos usando la herramienta `mcp_supabase_execute_sql`.

**Tech Stack:** PostgreSQL, PostGIS (ST_GeomFromText), Supabase MCP.

---

### Task 1: Crear el Script SQL Base para Mérida (Centro y Paseo de Montejo)

**Files:**
- Create: `migrations/reference/seed_comercios_merida.sql`

- [ ] **Step 1: Escribir el script SQL con los comercios de Mérida**

```sql
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
```

- [ ] **Step 2: Ejecutar el script usando MCP Execute SQL**
Se debe ejecutar el script usando la herramienta `mcp_supabase_execute_sql` sobre la base de datos de producción.

- [ ] **Step 3: Commit**
```bash
git add migrations/reference/seed_comercios_merida.sql
git commit -m "chore: add seed data script for merida businesses"
```

### Task 2: Crear el Script SQL para la Costa (Progreso / Chicxulub)

**Files:**
- Create: `migrations/reference/seed_comercios_costa.sql`

- [ ] **Step 1: Escribir el script SQL con los comercios de la costa**

```sql
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
```

- [ ] **Step 2: Ejecutar el script usando MCP Execute SQL**

- [ ] **Step 3: Commit**
```bash
git add migrations/reference/seed_comercios_costa.sql
git commit -m "chore: add seed data script for coast businesses"
```

### Task 3: Crear el Script SQL para Cenotes y Pueblos Mágicos (Izamal, Valladolid, Homún)

**Files:**
- Create: `migrations/reference/seed_comercios_pueblos.sql`

- [ ] **Step 1: Escribir el script SQL con los comercios rurales y de pueblos mágicos**

```sql
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
```

- [ ] **Step 2: Ejecutar el script usando MCP Execute SQL**

- [ ] **Step 3: Commit**
```bash
git add migrations/reference/seed_comercios_pueblos.sql
git commit -m "chore: add seed data script for rural and tourist towns businesses"
```
