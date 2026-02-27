-- ============================================
-- RPC FUNCTIONS FOR FRONTEND CONSUMPTION
-- Converts PostGIS GEOMETRY to JSON coordinates
-- ============================================

-- 1. Get published routes with coordinates (for map markers & listing)
CREATE OR REPLACE FUNCTION get_published_routes(
  p_difficulty TEXT DEFAULT NULL,
  p_terrain TEXT DEFAULT NULL,
  p_max_distance NUMERIC DEFAULT NULL,
  p_min_distance NUMERIC DEFAULT NULL
)
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
  FROM (
    SELECT
      id, name, description, slug, distance_km, elevation_gain_m,
      estimated_duration_min, difficulty, terrain_type, status,
      price, is_free, cover_image_url, tags, municipality,
      average_rating, total_reviews, purchase_count, creator_id,
      ST_X(start_point) as start_lng,
      ST_Y(start_point) as start_lat,
      ST_X(end_point) as end_lng,
      ST_Y(end_point) as end_lat,
      created_at
    FROM routes
    WHERE status = 'publicado'
      AND (p_difficulty IS NULL OR difficulty = p_difficulty)
      AND (p_terrain IS NULL OR terrain_type = p_terrain)
      AND (p_max_distance IS NULL OR distance_km <= p_max_distance)
      AND (p_min_distance IS NULL OR distance_km >= p_min_distance)
    ORDER BY created_at DESC
  ) r;
$$ LANGUAGE sql STABLE;


-- 2. Get full route detail with GeoJSON path, waypoints, and nearby businesses
CREATE OR REPLACE FUNCTION get_route_detail(p_route_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'route', (
      SELECT row_to_json(r) FROM (
        SELECT
          id, name, description, slug, distance_km, elevation_gain_m,
          estimated_duration_min, difficulty, terrain_type, status,
          price, is_free, cover_image_url, photos, tags, municipality,
          average_rating, total_reviews, purchase_count, creator_id,
          ST_AsGeoJSON(route_path)::json as route_geojson,
          ST_X(start_point) as start_lng,
          ST_Y(start_point) as start_lat,
          ST_X(end_point) as end_lng,
          ST_Y(end_point) as end_lat,
          created_at
        FROM routes
        WHERE id = p_route_id
      ) r
    ),
    'waypoints', (
      SELECT COALESCE(json_agg(row_to_json(w) ORDER BY w.order_index), '[]'::json)
      FROM (
        SELECT
          id, name, description, waypoint_type, image_url, order_index,
          ST_X(location) as lng,
          ST_Y(location) as lat
        FROM route_waypoints
        WHERE route_id = p_route_id
      ) w
    ),
    'businesses', (
      SELECT COALESCE(json_agg(row_to_json(b)), '[]'::json)
      FROM (
        SELECT
          b.id, b.name, b.business_type, b.cover_image_url,
          b.average_rating, b.address, b.phone,
          ST_X(b.location) as lng,
          ST_Y(b.location) as lat,
          rb.distance_from_route_m
        FROM route_businesses rb
        JOIN businesses b ON b.id = rb.business_id
        WHERE rb.route_id = p_route_id AND b.status = 'activo'
        ORDER BY rb.order_index
      ) b
    )
  );
$$ LANGUAGE sql STABLE;


-- 3. Get active businesses with coordinates (for business listing)
CREATE OR REPLACE FUNCTION get_active_businesses(
  p_type TEXT DEFAULT NULL
)
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(row_to_json(b)), '[]'::json)
  FROM (
    SELECT
      id, name, slug, description, business_type,
      cover_image_url, logo_url, average_rating, total_reviews,
      address, municipality, phone, whatsapp, business_hours,
      accepts_advance_orders, minimum_order_amount,
      ST_X(location) as lng,
      ST_Y(location) as lat
    FROM businesses
    WHERE status = 'activo'
      AND (p_type IS NULL OR business_type = p_type)
    ORDER BY average_rating DESC NULLS LAST
  ) b;
$$ LANGUAGE sql STABLE;


-- 4. Get business detail with products
CREATE OR REPLACE FUNCTION get_business_detail(p_business_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'business', (
      SELECT row_to_json(b) FROM (
        SELECT
          id, name, slug, description, business_type,
          cover_image_url, logo_url, photos, average_rating, total_reviews,
          address, municipality, phone, email, website, whatsapp,
          business_hours, accepts_advance_orders, minimum_order_amount,
          ST_X(location) as lng,
          ST_Y(location) as lat
        FROM businesses
        WHERE id = p_business_id
      ) b
    ),
    'products', (
      SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json)
      FROM (
        SELECT
          id, name, description, price, category,
          image_url, is_available, stock_quantity, is_cyclist_special
        FROM products
        WHERE business_id = p_business_id AND is_available = TRUE
        ORDER BY category, name
      ) p
    )
  );
$$ LANGUAGE sql STABLE;


-- 5. Search routes by name/location
CREATE OR REPLACE FUNCTION search_routes(p_query TEXT)
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
  FROM (
    SELECT
      id, name, description, slug, distance_km, elevation_gain_m,
      estimated_duration_min, difficulty, terrain_type,
      price, is_free, cover_image_url, tags, municipality,
      average_rating, total_reviews, creator_id,
      ST_X(start_point) as start_lng,
      ST_Y(start_point) as start_lat,
      created_at
    FROM routes
    WHERE status = 'publicado'
      AND (
        name ILIKE '%' || p_query || '%'
        OR description ILIKE '%' || p_query || '%'
        OR municipality ILIKE '%' || p_query || '%'
      )
    ORDER BY
      CASE WHEN name ILIKE p_query || '%' THEN 0 ELSE 1 END,
      average_rating DESC NULLS LAST
    LIMIT 20
  ) r;
$$ LANGUAGE sql STABLE;
