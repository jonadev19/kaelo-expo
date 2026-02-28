import { z } from "zod";

const envSchema = z.object({
  MAPBOX_ACCESS_TOKEN: z.string().min(1, "MAPBOX_ACCESS_TOKEN es requerido"),
  SUPABASE_URL: z
    .string()
    .refine(
      (val) => val.startsWith("http://") || val.startsWith("https://"),
      "SUPABASE_URL debe ser una URL válida",
    ),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY es requerido"),
  STRIPE_PUBLISHABLE_KEY: z.string().optional().default(""),
});

type Environment = z.infer<typeof envSchema>;

declare const process: { env: Record<string, string | undefined> };

const ENV: Environment = envSchema.parse({
  MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

export default ENV;
