import ENV from "@/config/env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
<<<<<<< HEAD
import { Database } from "../../database.types";
=======
import { Database } from "../types/database.types";
>>>>>>> 6641b1a67348778d6d81cb4e018da3214ab4d1fc

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient<Database>(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
