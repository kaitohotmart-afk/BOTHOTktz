import dotenv from 'dotenv';
dotenv.config();

import { supabase, testConnection } from '../src/config/supabase.js';

console.log('🔧 Setting up Supabase database...\n');

async function setupDatabase() {
    // Test connection first
    const connected = await testConnection();

    if (!connected) {
        console.error('❌ Failed to connect to Supabase. Please check your credentials.');
        process.exit(1);
    }

    console.log('✅ Supabase connection successful!\n');
    console.log('📊 Checking tables...\n');

    // Check if tables exist
    const tables = ['tickets', 'customers', 'transactions', 'staff_actions'];

    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`⚠️  Table "${table}" might not exist or has issues`);
            } else {
                console.log(`✅ Table "${table}" exists (${count || 0} rows)`);
            }
        } catch (err) {
            console.log(`❌ Error checking table "${table}":`, err.message);
        }
    }

    console.log('\n✅ Database setup check complete!');
    console.log('\nNote: If tables don\'t exist, they should have been created via Supabase MCP.');
    console.log('If you see errors, please check the Supabase dashboard.\n');
}

setupDatabase()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Setup failed:', err);
        process.exit(1);
    });
