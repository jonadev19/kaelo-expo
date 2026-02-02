export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      business_coupons: {
        Row: {
          business_id: string
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          minimum_purchase: number | null
          starts_at: string | null
        }
        Insert: {
          business_id: string
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_purchase?: number | null
          starts_at?: string | null
        }
        Update: {
          business_id?: string
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_purchase?: number | null
          starts_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_coupons_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          accepts_advance_orders: boolean | null
          address: string
          advance_order_hours: number | null
          average_rating: number | null
          business_hours: Json | null
          business_type: string | null
          commission_rate: number | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          location: unknown
          logo_url: string | null
          minimum_order_amount: number | null
          municipality: string | null
          name: string
          owner_id: string
          phone: string | null
          photos: Json | null
          slug: string
          status: string | null
          total_orders: number | null
          total_reviews: number | null
          updated_at: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          accepts_advance_orders?: boolean | null
          address: string
          advance_order_hours?: number | null
          average_rating?: number | null
          business_hours?: Json | null
          business_type?: string | null
          commission_rate?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location: unknown
          logo_url?: string | null
          minimum_order_amount?: number | null
          municipality?: string | null
          name: string
          owner_id: string
          phone?: string | null
          photos?: Json | null
          slug: string
          status?: string | null
          total_orders?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          accepts_advance_orders?: boolean | null
          address?: string
          advance_order_hours?: number | null
          average_rating?: number | null
          business_hours?: Json | null
          business_type?: string | null
          commission_rate?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location?: unknown
          logo_url?: string | null
          minimum_order_amount?: number | null
          municipality?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          photos?: Json | null
          slug?: string
          status?: string | null
          total_orders?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          notification_type: string
          read_at: string | null
          related_business_id: string | null
          related_order_id: string | null
          related_route_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type: string
          read_at?: string | null
          related_business_id?: string | null
          related_order_id?: string | null
          related_route_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          notification_type?: string
          read_at?: string | null
          related_business_id?: string | null
          related_order_id?: string | null
          related_route_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_business_id_fkey"
            columns: ["related_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_route_id_fkey"
            columns: ["related_route_id"]
            isOneToOne: false
            referencedRelation: "route_leaderboards"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "notifications_related_route_id_fkey"
            columns: ["related_route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          notes: string | null
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          notes?: string | null
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_pickup_time: string | null
          business_id: string
          created_at: string | null
          customer_id: string
          estimated_pickup_time: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          platform_fee: number
          route_id: string | null
          status: string | null
          stripe_payment_id: string | null
          subtotal: number
          total: number
          updated_at: string | null
        }
        Insert: {
          actual_pickup_time?: string | null
          business_id: string
          created_at?: string | null
          customer_id: string
          estimated_pickup_time: string
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          platform_fee: number
          route_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          subtotal: number
          total: number
          updated_at?: string | null
        }
        Update: {
          actual_pickup_time?: string | null
          business_id?: string
          created_at?: string | null
          customer_id?: string
          estimated_pickup_time?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          platform_fee?: number
          route_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route_leaderboards"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "orders_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          business_id: string
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_cyclist_special: boolean | null
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_cyclist_special?: boolean | null
          name: string
          price: number
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_cyclist_special?: boolean | null
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          creator_rating: number | null
          email: string
          full_name: string | null
          id: string
          is_business_owner: boolean | null
          is_creator: boolean | null
          phone: string | null
          preferences: Json | null
          total_earnings: number | null
          total_routes_sold: number | null
          updated_at: string | null
          wallet_balance: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_rating?: number | null
          email: string
          full_name?: string | null
          id: string
          is_business_owner?: boolean | null
          is_creator?: boolean | null
          phone?: string | null
          preferences?: Json | null
          total_earnings?: number | null
          total_routes_sold?: number | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_rating?: number | null
          email?: string
          full_name?: string | null
          id?: string
          is_business_owner?: boolean | null
          is_creator?: boolean | null
          phone?: string | null
          preferences?: Json | null
          total_earnings?: number | null
          total_routes_sold?: number | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          business_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          photos: Json | null
          purchase_id: string | null
          rating: number
          review_type: string
          route_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          photos?: Json | null
          purchase_id?: string | null
          rating: number
          review_type: string
          route_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          photos?: Json | null
          purchase_id?: string | null
          rating?: number
          review_type?: string
          route_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "route_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route_leaderboards"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "reviews_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      route_businesses: {
        Row: {
          business_id: string
          created_at: string | null
          distance_from_route_m: number | null
          id: string
          notes: string | null
          order_index: number | null
          route_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          distance_from_route_m?: number | null
          id?: string
          notes?: string | null
          order_index?: number | null
          route_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          distance_from_route_m?: number | null
          id?: string
          notes?: string | null
          order_index?: number | null
          route_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_businesses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_businesses_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route_leaderboards"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "route_businesses_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_completions: {
        Row: {
          avg_speed_kmh: number | null
          calories_burned: number | null
          completed_at: string | null
          created_at: string | null
          device_info: Json | null
          distance_actual_km: number | null
          duration_min: number | null
          elevation_gain_actual_m: number | null
          id: string
          max_speed_kmh: number | null
          notes: string | null
          recorded_path: unknown
          route_id: string
          started_at: string
          status: string | null
          user_id: string
          weather_conditions: Json | null
        }
        Insert: {
          avg_speed_kmh?: number | null
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          device_info?: Json | null
          distance_actual_km?: number | null
          duration_min?: number | null
          elevation_gain_actual_m?: number | null
          id?: string
          max_speed_kmh?: number | null
          notes?: string | null
          recorded_path?: unknown
          route_id: string
          started_at: string
          status?: string | null
          user_id: string
          weather_conditions?: Json | null
        }
        Update: {
          avg_speed_kmh?: number | null
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          device_info?: Json | null
          distance_actual_km?: number | null
          duration_min?: number | null
          elevation_gain_actual_m?: number | null
          id?: string
          max_speed_kmh?: number | null
          notes?: string | null
          recorded_path?: unknown
          route_id?: string
          started_at?: string
          status?: string | null
          user_id?: string
          weather_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "route_completions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route_leaderboards"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "route_completions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      route_purchases: {
        Row: {
          amount_paid: number
          buyer_id: string
          creator_earnings: number
          id: string
          payment_status: string | null
          platform_fee: number
          purchased_at: string | null
          refund_reason: string | null
          refund_requested_at: string | null
          refunded_at: string | null
          route_id: string
          stripe_payment_id: string | null
        }
        Insert: {
          amount_paid: number
          buyer_id: string
          creator_earnings: number
          id?: string
          payment_status?: string | null
          platform_fee: number
          purchased_at?: string | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          refunded_at?: string | null
          route_id: string
          stripe_payment_id?: string | null
        }
        Update: {
          amount_paid?: number
          buyer_id?: string
          creator_earnings?: number
          id?: string
          payment_status?: string | null
          platform_fee?: number
          purchased_at?: string | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          refunded_at?: string | null
          route_id?: string
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_purchases_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_purchases_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "route_purchases_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route_leaderboards"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "route_purchases_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_waypoints: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          location: unknown
          name: string
          order_index: number
          route_id: string
          waypoint_type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location: unknown
          name: string
          order_index?: number
          route_id: string
          waypoint_type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: unknown
          name?: string
          order_index?: number
          route_id?: string
          waypoint_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_waypoints_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route_leaderboards"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "route_waypoints_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          average_rating: number | null
          cover_image_url: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          difficulty: string | null
          distance_km: number
          elevation_gain_m: number | null
          end_point: unknown
          estimated_duration_min: number | null
          id: string
          is_free: boolean | null
          municipality: string | null
          name: string
          photos: Json | null
          price: number | null
          published_at: string | null
          purchase_count: number | null
          route_path: unknown
          slug: string
          start_point: unknown
          status: string | null
          tags: Json | null
          terrain_type: string | null
          total_reviews: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          average_rating?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          difficulty?: string | null
          distance_km: number
          elevation_gain_m?: number | null
          end_point?: unknown
          estimated_duration_min?: number | null
          id?: string
          is_free?: boolean | null
          municipality?: string | null
          name: string
          photos?: Json | null
          price?: number | null
          published_at?: string | null
          purchase_count?: number | null
          route_path?: unknown
          slug: string
          start_point?: unknown
          status?: string | null
          tags?: Json | null
          terrain_type?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          average_rating?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          difficulty?: string | null
          distance_km?: number
          elevation_gain_m?: number | null
          end_point?: unknown
          estimated_duration_min?: number | null
          id?: string
          is_free?: boolean | null
          municipality?: string | null
          name?: string
          photos?: Json | null
          price?: number | null
          published_at?: string | null
          purchase_count?: number | null
          route_path?: unknown
          slug?: string
          start_point?: unknown
          status?: string | null
          tags?: Json | null
          terrain_type?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      saved_routes: {
        Row: {
          created_at: string | null
          id: string
          route_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          route_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          route_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_routes_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route_leaderboards"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "saved_routes_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_routes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_routes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      sponsored_segments: {
        Row: {
          business_id: string
          coupon_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          reward_message: string | null
          route_id: string
          segment_end_index: number
          segment_path: unknown
          segment_start_index: number
        }
        Insert: {
          business_id: string
          coupon_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          reward_message?: string | null
          route_id: string
          segment_end_index: number
          segment_path?: unknown
          segment_start_index: number
        }
        Update: {
          business_id?: string
          coupon_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          reward_message?: string | null
          route_id?: string
          segment_end_index?: number
          segment_path?: unknown
          segment_start_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_segments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_segments_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "business_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_segments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route_leaderboards"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "sponsored_segments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      unlocked_coupons: {
        Row: {
          coupon_id: string
          expires_at: string | null
          id: string
          is_used: boolean | null
          route_completion_id: string | null
          unlock_reason: string
          unlocked_at: string | null
          used_at: string | null
          used_in_order_id: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          route_completion_id?: string | null
          unlock_reason: string
          unlocked_at?: string | null
          used_at?: string | null
          used_in_order_id?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          route_completion_id?: string | null
          unlock_reason?: string
          unlocked_at?: string | null
          used_at?: string | null
          used_in_order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unlocked_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "business_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_coupons_route_completion_id_fkey"
            columns: ["route_completion_id"]
            isOneToOne: false
            referencedRelation: "route_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_coupons_used_in_order_id_fkey"
            columns: ["used_in_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_type: string
          badge_icon: string | null
          created_at: string
          id: string
          is_unlocked: boolean | null
          metadata: Json | null
          points_awarded: number | null
          progress_current: number | null
          progress_target: number
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          badge_icon?: string | null
          created_at?: string
          id?: string
          is_unlocked?: boolean | null
          metadata?: Json | null
          points_awarded?: number | null
          progress_current?: number | null
          progress_target: number
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          badge_icon?: string | null
          created_at?: string
          id?: string
          is_unlocked?: boolean | null
          metadata?: Json | null
          points_awarded?: number | null
          progress_current?: number | null
          progress_target?: number
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          current_value: number | null
          deadline: string | null
          description: string | null
          goal_type: string
          id: string
          reward_points: number | null
          started_at: string
          status: string
          target_value: number
          title: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          goal_type: string
          id?: string
          reward_points?: number | null
          started_at?: string
          status?: string
          target_value: number
          title: string
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          reward_points?: number | null
          started_at?: string
          status?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_personal_records: {
        Row: {
          achieved_at: string
          best_avg_speed_kmh: number | null
          best_distance_km: number | null
          best_time_min: number | null
          completion_id: string
          created_at: string
          id: string
          improvement_percentage: number | null
          previous_record_id: string | null
          record_type: string
          route_id: string
          user_id: string
        }
        Insert: {
          achieved_at: string
          best_avg_speed_kmh?: number | null
          best_distance_km?: number | null
          best_time_min?: number | null
          completion_id: string
          created_at?: string
          id?: string
          improvement_percentage?: number | null
          previous_record_id?: string | null
          record_type: string
          route_id: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          best_avg_speed_kmh?: number | null
          best_distance_km?: number | null
          best_time_min?: number | null
          completion_id?: string
          created_at?: string
          id?: string
          improvement_percentage?: number | null
          previous_record_id?: string | null
          record_type?: string
          route_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_personal_records_completion_id_fkey"
            columns: ["completion_id"]
            isOneToOne: false
            referencedRelation: "route_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_personal_records_previous_record_id_fkey"
            columns: ["previous_record_id"]
            isOneToOne: false
            referencedRelation: "user_personal_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_personal_records_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route_leaderboards"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "user_personal_records_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_stats_monthly: {
        Row: {
          achievements_unlocked: number | null
          avg_distance_per_ride_km: number | null
          avg_speed_kmh: number | null
          businesses_visited: number | null
          calculated_at: string
          created_at: string
          distance_change_percent: number | null
          favorite_route_id: string | null
          favorite_route_rides: number | null
          id: string
          max_speed_kmh: number | null
          month: number
          rides_change_percent: number | null
          routes_completed: number | null
          speed_change_percent: number | null
          total_calories_burned: number | null
          total_distance_km: number | null
          total_duration_min: number | null
          total_elevation_gain_m: number | null
          total_points_earned: number | null
          total_rides: number | null
          unique_routes_completed: number | null
          updated_at: string
          user_id: string
          waypoints_visited: number | null
          year: number
        }
        Insert: {
          achievements_unlocked?: number | null
          avg_distance_per_ride_km?: number | null
          avg_speed_kmh?: number | null
          businesses_visited?: number | null
          calculated_at?: string
          created_at?: string
          distance_change_percent?: number | null
          favorite_route_id?: string | null
          favorite_route_rides?: number | null
          id?: string
          max_speed_kmh?: number | null
          month: number
          rides_change_percent?: number | null
          routes_completed?: number | null
          speed_change_percent?: number | null
          total_calories_burned?: number | null
          total_distance_km?: number | null
          total_duration_min?: number | null
          total_elevation_gain_m?: number | null
          total_points_earned?: number | null
          total_rides?: number | null
          unique_routes_completed?: number | null
          updated_at?: string
          user_id: string
          waypoints_visited?: number | null
          year: number
        }
        Update: {
          achievements_unlocked?: number | null
          avg_distance_per_ride_km?: number | null
          avg_speed_kmh?: number | null
          businesses_visited?: number | null
          calculated_at?: string
          created_at?: string
          distance_change_percent?: number | null
          favorite_route_id?: string | null
          favorite_route_rides?: number | null
          id?: string
          max_speed_kmh?: number | null
          month?: number
          rides_change_percent?: number | null
          routes_completed?: number | null
          speed_change_percent?: number | null
          total_calories_burned?: number | null
          total_distance_km?: number | null
          total_duration_min?: number | null
          total_elevation_gain_m?: number | null
          total_points_earned?: number | null
          total_rides?: number | null
          unique_routes_completed?: number | null
          updated_at?: string
          user_id?: string
          waypoints_visited?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_monthly_favorite_route_id_fkey"
            columns: ["favorite_route_id"]
            isOneToOne: false
            referencedRelation: "route_leaderboards"
            referencedColumns: ["route_id"]
          },
          {
            foreignKeyName: "user_stats_monthly_favorite_route_id_fkey"
            columns: ["favorite_route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_stats_monthly_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_stats_monthly_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      route_leaderboards: {
        Row: {
          fastest_times_top10: Json | null
          highest_speeds_top10: Json | null
          route_id: string | null
          route_name: string | null
          route_slug: string | null
        }
        Insert: {
          fastest_times_top10?: never
          highest_speeds_top10?: never
          route_id?: string | null
          route_name?: string | null
          route_slug?: string | null
        }
        Update: {
          fastest_times_top10?: never
          highest_speeds_top10?: never
          route_id?: string | null
          route_name?: string | null
          route_slug?: string | null
        }
        Relationships: []
      }
      user_dashboard_summary: {
        Row: {
          achievements_unlocked: number | null
          active_goals: number | null
          avatar_url: string | null
          avg_speed_kmh: number | null
          completed_goals: number | null
          full_name: string | null
          last_ride_at: string | null
          max_speed_kmh: number | null
          total_achievement_points: number | null
          total_calories: number | null
          total_distance_km: number | null
          total_duration_min: number | null
          total_elevation_m: number | null
          total_rides: number | null
          unique_routes: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      aggregate_monthly_stats: {
        Args: { target_month: number; target_year: number }
        Returns: undefined
      }
      calculate_route_distance: {
        Args: { route_geometry: unknown }
        Returns: number
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      find_businesses_near_route: {
        Args: { radius_m?: number; target_route_id: string }
        Returns: {
          business_id: string
          business_type: string
          distance_m: number
          location_lat: number
          location_lng: number
          name: string
        }[]
      }
      find_routes_near_point: {
        Args: { lat: number; lng: number; radius_km?: number }
        Returns: {
          difficulty: string
          distance_km: number
          distance_to_start_km: number
          is_free: boolean
          name: string
          price: number
          route_id: string
        }[]
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_user_achievements: { Args: { p_user_id: string }; Returns: Json }
      get_user_activity_history: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: Json
      }
      get_user_goals: { Args: { p_user_id: string }; Returns: Json }
      get_user_personal_records: { Args: { p_user_id: string }; Returns: Json }
      get_user_route_stats: {
        Args: { p_route_id: string; p_user_id: string }
        Returns: Json
      }
      get_user_stats: { Args: { p_user_id: string }; Returns: Json }
      gettransactionid: { Args: never; Returns: unknown }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
