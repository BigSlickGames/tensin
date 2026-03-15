import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envContent = readFileSync(join(__dirname, '.env'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  console.log('Setting up admin user...');

  try {
    const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers();

    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return;
    }

    const adminExists = existingUser.users.find(u => u.email === 'admin@tensin.com');

    if (adminExists) {
      console.log('Admin user already exists:', adminExists.id);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', 'admin@tensin.com')
        .maybeSingle();

      if (!profile) {
        console.log('Creating admin profile...');
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: adminExists.id,
            username: 'admin',
            first_name: 'Admin',
            last_name: 'Tensin',
            email: 'admin@tensin.com',
            is_admin: true,
            experience: 0,
            bankroll: 999999,
            total_score: 0,
            total_wins: 0,
            rank: 0,
            achievements: []
          });

        if (profileError) {
          console.error('Error creating admin profile:', profileError);
        } else {
          console.log('Admin profile created successfully!');
        }
      } else if (!profile.is_admin) {
        console.log('Updating existing profile to admin...');
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ is_admin: true, bankroll: 999999 })
          .eq('id', adminExists.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        } else {
          console.log('Profile updated to admin!');
        }
      } else {
        console.log('Admin profile already exists and is configured correctly.');
      }

      return;
    }

    console.log('Creating new admin user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@tensin.com',
      password: 'Tensin@6',
      email_confirm: true,
      user_metadata: {
        username: 'admin',
        first_name: 'Admin',
        last_name: 'Tensin'
      }
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
      return;
    }

    console.log('Admin user created:', authData.user.id);

    console.log('Creating admin profile...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        username: 'admin',
        first_name: 'Admin',
        last_name: 'Tensin',
        email: 'admin@tensin.com',
        is_admin: true,
        experience: 0,
        bankroll: 999999,
        total_score: 0,
        total_wins: 0,
        rank: 0,
        achievements: []
      });

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      return;
    }

    console.log('✅ Admin setup complete!');
    console.log('Email: admin@tensin.com');
    console.log('Password: Tensin@6');
    console.log('This is the ONLY account with admin access.');

  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupAdmin();
