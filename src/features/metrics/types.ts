export interface UserDashboard {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    total_routes_completed: number;
    total_distance_km: number;
    total_duration_hours: number;
    total_calories_burned: number;
    total_elevation_gain_m: number;
    avg_speed_kmh: number;
    total_points: number;
    unlocked_achievements: number;
    total_achievements: number;
    active_goals: number;
}

export interface Achievement {
    id: string;
    user_id: string;
    achievement_type: string;
    progress_current: number;
    progress_target: number;
    is_unlocked: boolean;
    unlocked_at: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface ActivityRecord {
    id: string;
    route_id: string;
    status: string;
    completion_percentage: number;
    distance_actual_km: number | null;
    avg_speed_kmh: number | null;
    calories_burned: number | null;
    total_duration: number | null;
    started_at: string;
    completed_at: string | null;
    // Joined route name
    route?: {
        name: string;
        difficulty: string;
    };
}

// Achievement display metadata
export const ACHIEVEMENT_META: Record<
    string,
    { icon: string; title: string; description: string }
> = {
    first_ride: {
        icon: "🚴",
        title: "Primera Pedaleada",
        description: "Completa tu primera ruta",
    },
    speed_demon: {
        icon: "⚡",
        title: "Velocista",
        description: "Alcanza 30+ km/h de velocidad promedio",
    },
    distance_10km: {
        icon: "🛣️",
        title: "10 Kilómetros",
        description: "Recorre 10 km en una sola ruta",
    },
    distance_50km: {
        icon: "🏔️",
        title: "50 Kilómetros",
        description: "Recorre 50 km en una sola ruta",
    },
    distance_100km_total: {
        icon: "💯",
        title: "Centenario",
        description: "Recorre 100 km en total",
    },
    distance_500km_total: {
        icon: "🌍",
        title: "Explorador",
        description: "Recorre 500 km en total",
    },
    distance_1000km_total: {
        icon: "🏆",
        title: "Leyenda",
        description: "Recorre 1,000 km en total",
    },
    routes_completed_10: {
        icon: "🎯",
        title: "10 Rutas",
        description: "Completa 10 rutas",
    },
    routes_completed_50: {
        icon: "👑",
        title: "50 Rutas",
        description: "Completa 50 rutas",
    },
    streak_7_days: {
        icon: "🔥",
        title: "Racha 7 días",
        description: "Pedalea 7 días seguidos",
    },
    streak_30_days: {
        icon: "💪",
        title: "Racha 30 días",
        description: "Pedalea 30 días seguidos",
    },
    early_bird: {
        icon: "🌅",
        title: "Madrugador",
        description: "Completa una ruta antes de las 7am",
    },
    night_rider: {
        icon: "🌙",
        title: "Nocturno",
        description: "Completa una ruta después de las 8pm",
    },
    explorer: {
        icon: "🗺️",
        title: "Aventurero",
        description: "Visita 10 municipios diferentes",
    },
    supporter: {
        icon: "🤝",
        title: "Apoyo Local",
        description: "Visita 20 negocios",
    },
    elevation_master: {
        icon: "⛰️",
        title: "Rey de la Montaña",
        description: "Acumula 5,000m de elevación",
    },
};
