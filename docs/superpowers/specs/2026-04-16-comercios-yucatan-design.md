# Diseño de Carga de Comercios Reales en Yucatán

## 1. Objetivo
Poblar la base de datos de la aplicación Kaelo con un catálogo realista de comercios (aproximadamente 30-50 lugares) geolocalizados con precisión en el Estado de Yucatán. Esta carga cubrirá diversas categorías (`restaurante`, `cafeteria`, `tienda`, `taller_bicicletas`, `hospedaje`, `tienda_conveniencia`, `mercado`, `otro`) útiles tanto para ciclistas/deportistas como para turistas, permitiendo la creación de rutas ricas y variadas en el mapa.

## 2. Estructura de Datos
Se creará un script SQL que insertará registros en la tabla `businesses` de Supabase. Cada registro cumplirá con las restricciones de la base de datos (por ejemplo, validando el `business_type`).

Campos a poblar por cada negocio:
- `owner_id`: ID del usuario actual obtenido de la tabla `profiles`.
- `name`: Nombre real del comercio.
- `description`: Breve descripción del lugar y por qué es relevante.
- `address`: Dirección real.
- `municipality`: Municipio correspondiente (Mérida, Progreso, Izamal, Valladolid, Homún, etc.).
- `slug`: Generado automáticamente (ej. `nombre-del-lugar-timestamp`).
- `business_type`: Categoría estricta (`restaurante`, `cafeteria`, `tienda`, `taller_bicicletas`, `hospedaje`, `tienda_conveniencia`, `mercado`, `otro`).
- `location`: Punto geográfico (POINT) exacto usando coordenadas reales (longitud, latitud) en SRID 4326.
- `photos`: Array JSON con 1 o 2 URLs de fotos representativas del lugar (usando imágenes de alta calidad de Unsplash o Foursquare si no hay una específica).
- `status`: `'activo'`.
- `phone`: Número de teléfono (si aplica/está disponible).

## 3. Distribución Geográfica y Categorías Propuestas

### Mérida (Centro y Paseo de Montejo)
Enfoque en puntos de partida/llegada clásicos y abastecimiento urbano.
- **Cafeterías**: Marito & Mogaburo, Manifesto Tostaduría, Bengala Kaffeehaus.
- **Restaurantes**: Museo de la Gastronomía Yucateca, Manjar Blanco, La Chaya Maya (re-inserción si es necesario).
- **Talleres de bicicletas**: Bicimotos, Bike Center Mérida.
- **Mercados**: Mercado Lucas de Gálvez, Mercado de Santa Ana.

### Ruta de la Costa (Progreso / Telchac / Chicxulub)
Puntos de hidratación, comida de mariscos y descanso costero.
- **Restaurantes**: Eladio's Bar Progreso, Los Trompos (Progreso), Crabster.
- **Tiendas de conveniencia / Abastecimiento**: Oxxo Malecón, Six Chicxulub.
- **Hospedajes**: Hoteles frente al mar.

### Ruta de los Cenotes (Cuzamá / Homún)
Puntos de interés rural, descanso y comida tradicional.
- **Puntos de interés (`otro`/`restaurante`)**: Parador Turístico Santa Bárbara, Cenote Los Tres Oches.
- **Mercados/Tiendas locales**: Abarrotes del centro de Homún, Mercado Municipal de Cuzamá.

### Pueblos Mágicos (Izamal / Valladolid)
Destinos turísticos y gastronómicos mayores.
- **Restaurantes**: Restaurante Kinich (Izamal), Mesón del Marqués (Valladolid), La Casona de Valladolid.
- **Mercados/Cafeterías**: Mercado Municipal de Valladolid, Convento de Izamal (punto de referencia/cafetería cercana).

## 4. Metodología de Ejecución
1. **Validación de Usuario**: Ejecutar una consulta para obtener el ID del usuario actual de la tabla `profiles`.
2. **Generación del Script SQL**: Escribir un script estructurado usando CTEs (`WITH ... INSERT ...`) para agrupar las inserciones por municipio o categoría, facilitando la lectura y el mantenimiento. Se incluirán las coordenadas exactas de Google Maps/OpenStreetMap.
3. **Ejecución**: Usar el MCP de Supabase (`execute_sql`) para correr el script directamente en la base de datos en la nube.
4. **Verificación**: Realizar un `SELECT` rápido para contar los nuevos negocios insertados y confirmar que las categorías y ubicaciones sean correctas.

## 5. Criterios de Éxito
- La tabla `businesses` contiene al menos 30 nuevos registros válidos.
- Las ubicaciones (`location`) son precisas y caen dentro del Estado de Yucatán.
- Las categorías (`business_type`) respetan el constraint de la base de datos.
- No hay errores de llaves foráneas (`owner_id` válido).