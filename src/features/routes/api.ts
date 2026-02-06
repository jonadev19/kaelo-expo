import { supabase } from "@/lib/supabase";
import { Database } from "../../types/database.types";

export type Route = Database["public"]["Tables"]["routes"]["Row"];

export const fetchRoutes = async (): Promise<Route[]> => {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};
