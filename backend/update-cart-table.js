const { Pool } = require('pg');

const pool = new Pool({
  host: '157.254.189.56',
  port: 5432,
  database: 'devisrimobiles',
  user: 'postgres',
  password: 'Ranjith@123',
});

async function updateCartTable() {
  try {
    console.log('🔄 Updating cart table to include email column...\n');

    // Add email column to cart table
    try {
      await pool.query('ALTER TABLE cart ADD COLUMN IF NOT EXISTS user_email VARCHAR(255)');
      console.log('✅ Added user_email column to cart table');
    } catch (error) {
      console.log('ℹ️  user_email column may already exist:', error.message);
    }

    // Create index for better performance on email lookups
    try {
      await pool.query('CREATE INDEX IF NOT EXISTS idx_cart_user_email ON cart(user_email)');
      console.log('✅ Created index on user_email column');
    } catch (error) {
      console.log('ℹ️  Index may already exist:', error.message);
    }

    // Update existing cart items with email from users table
    console.log('\n🔄 Migrating existing cart data to use email...');
    
    const updateResult = await pool.query(`
      UPDATE cart 
      SET user_email = users.email 
      FROM users 
      WHERE cart.user_id = users.id 
      AND cart.user_email IS NULL
    `);
    
    console.log(`✅ Updated ${updateResult.rowCount} existing cart items with email`);

    // Show current cart table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'cart' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Updated cart table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Show sample data
    const sampleData = await pool.query('SELECT id, user_id, user_email, session_id, product_id, quantity FROM cart LIMIT 5');
    if (sampleData.rows.length > 0) {
      console.log('\n📊 Sample cart data:');
      sampleData.rows.forEach(row => {
        console.log(`  - ID: ${row.id}, User ID: ${row.user_id}, Email: ${row.user_email}, Session: ${row.session_id}, Product: ${row.product_id}, Qty: ${row.quantity}`);
      });
    } else {
      console.log('\n📊 No cart data found (table is empty)');
    }

    console.log('\n🎉 Cart table update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating cart table:', error);
  } finally {
    await pool.end();
  }
}

updateCartTable();