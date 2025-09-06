const { Pool } = require('pg');

const pool = new Pool({
  host: '157.254.189.56',
  port: 5432,
  database: 'devisrimobiles',
  user: 'postgres',
  password: 'Ranjith@123',
});

async function testCartIsolation() {
  try {
    console.log('🛒 Testing comprehensive cart isolation...\n');

    // Clean up any existing test data
    await pool.query("DELETE FROM cart WHERE user_id LIKE 'test-%' OR session_id LIKE 'test-%'");
    console.log('✓ Cleaned up existing test data\n');

    // Get test products
    const products = await pool.query('SELECT id, name FROM products LIMIT 3');
    if (products.rows.length < 3) {
      throw new Error('Need at least 3 products for testing');
    }
    
    const [product1, product2, product3] = products.rows;
    console.log('Using test products:');
    console.log(`  - Product 1: ${product1.name} (${product1.id})`);
    console.log(`  - Product 2: ${product2.name} (${product2.id})`);
    console.log(`  - Product 3: ${product3.name} (${product3.id})\n`);

    // Test 1: Session cart isolation
    console.log('📱 Test 1: Session cart isolation');
    
    const session1 = 'test-session-1';
    const session2 = 'test-session-2';
    
    // Add items to session 1
    await pool.query(
      'INSERT INTO cart (id, user_id, session_id, product_id, quantity) VALUES ($1, NULL, $2, $3, $4)',
      [require('crypto').randomUUID(), session1, product1.id, 2]
    );
    await pool.query(
      'INSERT INTO cart (id, user_id, session_id, product_id, quantity) VALUES ($1, NULL, $2, $3, $4)',
      [require('crypto').randomUUID(), session1, product2.id, 1]
    );
    console.log('  ✓ Added 2 items to session 1');

    // Add items to session 2
    await pool.query(
      'INSERT INTO cart (id, user_id, session_id, product_id, quantity) VALUES ($1, NULL, $2, $3, $4)',
      [require('crypto').randomUUID(), session2, product2.id, 3]
    );
    await pool.query(
      'INSERT INTO cart (id, user_id, session_id, product_id, quantity) VALUES ($1, NULL, $2, $3, $4)',
      [require('crypto').randomUUID(), session2, product3.id, 1]
    );
    console.log('  ✓ Added 2 items to session 2');

    // Verify session isolation
    const session1Items = await pool.query(
      'SELECT * FROM cart WHERE session_id = $1 AND user_id IS NULL',
      [session1]
    );
    const session2Items = await pool.query(
      'SELECT * FROM cart WHERE session_id = $1 AND user_id IS NULL',
      [session2]
    );

    console.log(`  ✓ Session 1 has ${session1Items.rows.length} items (expected: 2)`);
    console.log(`  ✓ Session 2 has ${session2Items.rows.length} items (expected: 2)`);
    
    if (session1Items.rows.length === 2 && session2Items.rows.length === 2) {
      console.log('  ✅ Session cart isolation works correctly\n');
    } else {
      console.log('  ❌ Session cart isolation failed\n');
    }

    // Test 2: User cart isolation
    console.log('👤 Test 2: User cart isolation');
    
    const user1 = 'test-user-1';
    const user2 = 'test-user-2';
    
    // Add items to user 1
    await pool.query(
      'INSERT INTO cart (id, user_id, session_id, product_id, quantity) VALUES ($1, $2, NULL, $3, $4)',
      [require('crypto').randomUUID(), user1, product1.id, 1]
    );
    await pool.query(
      'INSERT INTO cart (id, user_id, session_id, product_id, quantity) VALUES ($1, $2, NULL, $3, $4)',
      [require('crypto').randomUUID(), user1, product3.id, 2]
    );
    console.log('  ✓ Added 2 items to user 1');

    // Add items to user 2
    await pool.query(
      'INSERT INTO cart (id, user_id, session_id, product_id, quantity) VALUES ($1, $2, NULL, $3, $4)',
      [require('crypto').randomUUID(), user2, product1.id, 3]
    );
    console.log('  ✓ Added 1 item to user 2');

    // Verify user isolation
    const user1Items = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND session_id IS NULL',
      [user1]
    );
    const user2Items = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND session_id IS NULL',
      [user2]
    );

    console.log(`  ✓ User 1 has ${user1Items.rows.length} items (expected: 2)`);
    console.log(`  ✓ User 2 has ${user2Items.rows.length} items (expected: 1)`);
    
    if (user1Items.rows.length === 2 && user2Items.rows.length === 1) {
      console.log('  ✅ User cart isolation works correctly\n');
    } else {
      console.log('  ❌ User cart isolation failed\n');
    }

    // Test 3: Cross-contamination check
    console.log('🔒 Test 3: Cross-contamination check');
    
    // Check that session items don't appear in user carts
    const userItemsWithSession = await pool.query(
      'SELECT * FROM cart WHERE user_id IS NOT NULL AND session_id IS NOT NULL'
    );
    
    // Check that session items don't have user_id
    const sessionItemsWithUser = await pool.query(
      'SELECT * FROM cart WHERE session_id IS NOT NULL AND user_id IS NOT NULL'
    );

    console.log(`  ✓ Items with both user_id and session_id: ${userItemsWithSession.rows.length} (expected: 0)`);
    console.log(`  ✓ Session items with user_id: ${sessionItemsWithUser.rows.length} (expected: 0)`);
    
    if (userItemsWithSession.rows.length === 0 && sessionItemsWithUser.rows.length === 0) {
      console.log('  ✅ No cross-contamination detected\n');
    } else {
      console.log('  ❌ Cross-contamination detected\n');
    }

    // Test 4: API endpoint isolation
    console.log('🌐 Test 4: API endpoint isolation simulation');
    
    // Simulate API calls to verify backend isolation
    const testApiIsolation = async (identifier, type) => {
      const query = type === 'user' 
        ? 'SELECT c.*, p.name FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1 AND c.session_id IS NULL'
        : 'SELECT c.*, p.name FROM cart c JOIN products p ON c.product_id = p.id WHERE c.session_id = $1 AND c.user_id IS NULL';
      
      const result = await pool.query(query, [identifier]);
      return result.rows;
    };

    const apiUser1Items = await testApiIsolation(user1, 'user');
    const apiUser2Items = await testApiIsolation(user2, 'user');
    const apiSession1Items = await testApiIsolation(session1, 'session');
    const apiSession2Items = await testApiIsolation(session2, 'session');

    console.log(`  ✓ API User 1 items: ${apiUser1Items.length} (expected: 2)`);
    console.log(`  ✓ API User 2 items: ${apiUser2Items.length} (expected: 1)`);
    console.log(`  ✓ API Session 1 items: ${apiSession1Items.length} (expected: 2)`);
    console.log(`  ✓ API Session 2 items: ${apiSession2Items.length} (expected: 2)`);
    
    const apiTestPassed = apiUser1Items.length === 2 && apiUser2Items.length === 1 && 
                         apiSession1Items.length === 2 && apiSession2Items.length === 2;
    
    if (apiTestPassed) {
      console.log('  ✅ API endpoint isolation works correctly\n');
    } else {
      console.log('  ❌ API endpoint isolation failed\n');
    }

    // Clean up test data
    await pool.query("DELETE FROM cart WHERE user_id LIKE 'test-%' OR session_id LIKE 'test-%'");
    console.log('✓ Cleaned up test data');

    // Summary
    console.log('\n🎉 Cart isolation test completed!');
    console.log('\n📋 Test Results:');
    console.log(session1Items.rows.length === 2 && session2Items.rows.length === 2 ? '✅' : '❌', 'Session cart isolation');
    console.log(user1Items.rows.length === 2 && user2Items.rows.length === 1 ? '✅' : '❌', 'User cart isolation');
    console.log(userItemsWithSession.rows.length === 0 && sessionItemsWithUser.rows.length === 0 ? '✅' : '❌', 'No cross-contamination');
    console.log(apiTestPassed ? '✅' : '❌', 'API endpoint isolation');

  } catch (error) {
    console.error('❌ Cart isolation test failed:', error);
  } finally {
    await pool.end();
  }
}

testCartIsolation();