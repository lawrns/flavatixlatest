const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDevUser() {
  try {
    console.log('Creating dev user...');

    // Create user with email and password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'han@han.com',
      password: 'hennie12',
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: 'Han Account'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Create profile entry
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        full_name: 'Han Account',
        username: 'han',
        bio: 'Development test user',
        email_confirmed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return;
    }

    console.log('Profile created successfully');
    console.log('✅ Dev user created with credentials:');
    console.log('   Email: han@han.com');
    console.log('   Password: hennie12');
    console.log('   User ID:', authData.user.id);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createDevUser();
