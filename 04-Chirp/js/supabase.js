const SUPABASE_URL = "https://ussgutjxzxqcwiujurrv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_t6rH2436bu_hTv5npqDA_Q_cpMKLSe4";


/* ============================================================
   CREATE SUPABASE CLIENT
   ============================================================ */

let supabaseClient = null;


if (
  window.supabase &&
  SUPABASE_URL &&
  SUPABASE_ANON_KEY
) {

  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );

}


/* ============================================================
   MAKE CLIENT AVAILABLE TO APP
   ============================================================ */

window.appSupabase =
  supabaseClient;


/* ============================================================
   CHECK WHETHER SUPABASE IS CONFIGURED
   ============================================================ */

window.isSupabaseConfigured =
  !!supabaseClient;