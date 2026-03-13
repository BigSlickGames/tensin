import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ezenrsowgzktjkabvalm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW5yc293Z3prdGprYWJ2YWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTIwNjcsImV4cCI6MjA4ODk4ODA2N30.rP_cpA-oNHiqFE13pYOf9v3LoRD7E_6JqfxVuVBe1D4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const users = [
  { username: 'john', password: 'tensin26', firstName: 'John', lastName: 'Doe' },
  { username: 'jenny', password: 'tensin26', firstName: 'Jenny', lastName: 'Smith' },
  { username: 'jack', password: 'tensin26', firstName: 'Jack', lastName: 'Johnson' }
];

async function createUser(user) {
  try {
    console.log(`Creating user: ${user.username}...`);

    const email = `${user.username}@tensins.local`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: user.password,
      options: {
        data: {
          username: user.username,
          first_name: user.firstName,
          last_name: user.lastName
        },
        emailRedirectTo: undefined
      }
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        console.log(`User ${user.username} already exists, skipping...`);
        return;
      }
      throw authError;
    }

    if (authData.user) {
      console.log(`Created auth user: ${user.username} (${authData.user.id})`);

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          username: user.username,
          first_name: user.firstName,
          last_name: user.lastName,
          level: 1,
          total_score: 0,
          total_wins: 0,
          rank: 0,
          achievements: []
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.username}:`, profileError.message);
      } else {
        console.log(`✓ Created profile for ${user.username}`);
      }

      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error(`Error creating user ${user.username}:`, error.message);
  }
}

async function setup() {
  console.log('Setting up test users...\n');

  for (const user of users) {
    await createUser(user);
  }

  console.log('\nSetup complete!');
  console.log('\nTest accounts created:');
  console.log('- Username: john, Password: tensin26');
  console.log('- Username: jenny, Password: tensin26');
  console.log('- Username: jack, Password: tensin26');
}

setup();
