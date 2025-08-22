import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';
import bcrypt from "npm:bcryptjs@2.4.3";
import * as jwt from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service key
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const JWT_SECRET = "your-super-secret-jwt-key-change-in-production";
const DEV_MODE = true; // Set to false in production

interface JWTPayload {
  sub: string;
  email: string;
  nome: string;
  perfil: string;
  municipio_id?: string;
  role: 'authenticated';
  scopes: string[];
  iat?: number;
  exp?: number;
}

// Utility functions
function generateOTPCode(): string {
  if (DEV_MODE) {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOTPExpiry(): string {
  return new Date(Date.now() + 5 * 60 * 1000).toISOString();
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp' | 'role' | 'scopes'>): Promise<string> {
  const fullPayload: JWTPayload = {
    ...payload,
    role: 'authenticated',
    scopes: ['read', 'write'],
  };
  
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  return await jwt.create({ alg: "HS256", typ: "JWT" }, fullPayload, key);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Route: /auth/request-code
    if (path.endsWith('/request-code') && req.method === 'POST') {
      const { email } = await req.json();
      
      const neutralMessage = "Se existir uma conta com este e-mail, enviamos um código. Verifique sua caixa de entrada e spam.";
      
      if (!isValidEmail(email)) {
        return new Response(JSON.stringify({ message: neutralMessage }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .rpc('get_usuario_by_email', { user_email: email });
      
      if (userError || !userData || userData.length === 0) {
        return new Response(JSON.stringify({ message: neutralMessage }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const user = userData[0];
      const code = generateOTPCode();
      console.log(`[DEBUG] Generated OTP code: ${code} for user: ${email}`);
      
      let codeHash: string;
      if (DEV_MODE) {
        // In dev mode, use simple hash for testing
        codeHash = `dev_${code}`;
        console.log(`[DEV_MODE] Using simple hash: ${codeHash}`);
      } else {
        try {
          codeHash = bcrypt.hashSync(code, 10);
          console.log(`[PROD] Generated hash successfully`);
        } catch (hashError) {
          console.error('Error hashing code:', hashError);
          return new Response(JSON.stringify({ message: neutralMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      const expiresAt = getOTPExpiry();
      
      // Clean up existing OTP
      await supabase.from('auth_otp').delete().eq('usuario_id', user.id);
      
      // Insert new OTP
      const { error: otpError } = await supabase.from('auth_otp').insert({
        usuario_id: user.id,
        code_hash: codeHash,
        expires_at: expiresAt,
        attempts: 0,
      });
      
      if (otpError) {
        console.error('Error inserting OTP:', otpError);
        return new Response(JSON.stringify({ message: neutralMessage }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log(`[SUCCESS] OTP saved to database for user: ${user.id}`);
      
      console.log(`[${DEV_MODE ? 'DEV_MODE' : 'PROD'}] OTP for ${email}: ${code}`);
      
      return new Response(JSON.stringify({ message: neutralMessage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Route: /auth/verify
    if (path.endsWith('/verify') && req.method === 'POST') {
      const { email, code } = await req.json();
      
      if (!email || !code) {
        return new Response(JSON.stringify({ error: 'Email e código são obrigatórios' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Get user by email
      const { data: userData, error: userError } = await supabase
        .rpc('get_usuario_by_email', { user_email: email });
      
      if (userError || !userData || userData.length === 0) {
        return new Response(JSON.stringify({ error: 'Código incorreto, tente novamente.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const user = userData[0];
      
      // Get OTP record
      const { data: otpData, error: otpError } = await supabase
        .from('auth_otp')
        .select('*')
        .eq('usuario_id', user.id)
        .single();
      
      if (otpError || !otpData) {
        return new Response(JSON.stringify({ error: 'Código expirado, solicite um novo.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Check if expired
      if (new Date() > new Date(otpData.expires_at)) {
        await supabase.from('auth_otp').delete().eq('usuario_id', user.id);
        return new Response(JSON.stringify({ error: 'Código expirado, solicite um novo.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Check attempts limit
      if (otpData.attempts >= 5) {
        return new Response(JSON.stringify({ error: 'Código expirado, solicite um novo.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Verify code
      console.log(`[DEBUG] Verifying code: ${code} against stored hash`);
      let isValidCode: boolean;
      
      if (DEV_MODE) {
        // In dev mode, check against simple hash or direct comparison
        isValidCode = otpData.code_hash === `dev_${code}` || code === '123456';
        console.log(`[DEV_MODE] Code validation result: ${isValidCode}`);
      } else {
        try {
          isValidCode = bcrypt.compareSync(code, otpData.code_hash);
          console.log(`[PROD] Code validation result: ${isValidCode}`);
        } catch (compareError) {
          console.error('Error comparing code:', compareError);
          isValidCode = false;
        }
      }
      
      if (!isValidCode) {
        await supabase.from('auth_otp')
          .update({ attempts: otpData.attempts + 1 })
          .eq('id', otpData.id);
        
        return new Response(JSON.stringify({ error: 'Código incorreto, tente novamente.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Code is valid - generate JWT
      const token = await signJWT({
        sub: user.id,
        email: user.email,
        nome: user.nome,
        perfil: user.perfil_nome,
        municipio_id: user.municipio_id,
      });
      
      // Clean up OTP
      await supabase.from('auth_otp').delete().eq('usuario_id', user.id);
      
      return new Response(JSON.stringify({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          perfil: user.perfil_nome,
          municipio_id: user.municipio_id,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Route: /auth/logout
    if (path.endsWith('/logout') && req.method === 'POST') {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response('Not Found', { status: 404 });
    
  } catch (error) {
    console.error('Error in auth function:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});