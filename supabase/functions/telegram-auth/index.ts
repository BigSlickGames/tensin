import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { telegramData } = await req.json();

    if (!telegramData || !telegramData.hash) {
      return new Response(
        JSON.stringify({ error: "Invalid Telegram data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify Telegram data authenticity
    const { hash, ...dataToCheck } = telegramData;
    const checkString = Object.keys(dataToCheck)
      .sort()
      .map((key) => `${key}=${dataToCheck[key]}`)
      .join("\n");

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      return new Response(
        JSON.stringify({ error: "Telegram bot token not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const secretKey = createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    const calculatedHash = createHmac("sha256", secretKey)
      .update(checkString)
      .digest("hex");

    if (calculatedHash !== hash) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication data" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user exists
    const telegramId = `telegram_${telegramData.id}`;
    const { data: existingUser } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("telegram_id", telegramId)
      .maybeSingle();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const email = `${telegramId}@telegram.local`;
      const password = crypto.randomUUID();

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          telegram_id: telegramData.id,
          username: telegramData.username || "",
          first_name: telegramData.first_name,
          last_name: telegramData.last_name || "",
        },
      });

      if (authError || !authData.user) {
        throw new Error("Failed to create user");
      }

      userId = authData.user.id;

      // Create user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: userId,
          telegram_id: telegramId,
          username: telegramData.username || `user_${telegramData.id}`,
          first_name: telegramData.first_name,
          last_name: telegramData.last_name || "",
          experience: 0,
          bankroll: 1000,
          total_score: 0,
          total_wins: 0,
          rank: 0,
          achievements: [],
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin
      .generateLink({
        type: "magiclink",
        email: `${telegramId}@telegram.local`,
      });

    if (sessionError || !sessionData) {
      throw new Error("Failed to generate session");
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: sessionData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Telegram auth error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Authentication failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
