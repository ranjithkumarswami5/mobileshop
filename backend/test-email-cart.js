const { Pool } = require('pg');

const pool = new Pool({
  host: '157.254.189.56',
  port: 5432,
  database: 'devisrimobiles',
  user: 'postgres',
  password: 'Ranjith@123',
});

async function testEmailBasedCart() {
  try {
    console.log('📧 Testing email-based cart functionality...\n');

    // Clean up any existing test data
    await pool.query("DELETE FROM cart WHERE user_email LIKE '%test%' OR session_id LIKE 'test-%'");
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

    // Test 1: Email-based cart isolation
    console.log('📧 Test 1: Email-based cart isolation');
    
    const email1 = 'user1@test.com';
    const email2 = 'user2@test.com';
    const session1 = 'test-session-1';
    
    // Add items to email1 cart
    await pool.query(
      'INSERT INTO cart (id, user_email, session_id, product_id, quantity) VALUES ($1, $2, NULL, $3, $4)',
      [require('crypto').randomUUID(), email1, product1.id, 2]
    );
    await pool.query(
      'INSERT INTO cart (id, user_email, session_id, product_id, quantity) VALUES ($1, $2, NULL, $3, $4)',
      [require('crypto').randomUUID(), email1, product2.id, 1]
    );
    console.log('  ✓ Added 2 items to user1@test.com cart');

    // Add items to email2 cart
    await pool.query(
      'INSERT INTO cart (id, user_email, session_id, product_id, quantity) VALUES ($1, $2, NULL, $3, $4)',
      [require('crypto').randomUUID(), email2, product2.id, 3]
    );
    console.log('  ✓ Added 1 item to user2@test.com cart');

    // Add items to session cart
    await pool.query(
      'INSERT INTO cart (id, user_email, session_id, product_id, quantity) VALUES ($1, NULL, $2, $3, $4)',
      [require('crypto').randomUUID(), session1, product3.id, 1]
    );
    console.log('  ✓ Added 1 item to session cart');

    // Test isolation
    const email1Items = await pool.query(
      'SELECT * FROM cart WHERE user_email = $1 AND session_id IS NULL',
      [email1]
    );
    const email2Items = await pool.query(
      'SELECT * FROM cart WHERE user_email = $1 AND session_id IS NULL',
      [email2]
    );
    const sessionItems = await pool.query(
      'SELECT * FROM cart WHERE session_id = $1 AND user_email IS NULL',
      [session1]
    );

    console.log(`  ✓ Email1 cart has ${email1Items.rows.length} items (expected: 2)`);
    console.log(`  ✓ Email2 cart has ${email2Items.rows.length} items (expected: 1)`);
    console.log(`  ✓ Session cart has ${sessionItems.rows.length} items (expected: 1)`);
    
    if (email1Items.rows.length === 2 && email2Items.rows.length === 1 && sessionItems.rows.length === 1) {
      console.log('  ✅ Email-based cart isolation works correctly\n');
    } else {
      console.log('  ❌ Email-based cart isolation failed\n');
    }

    // Test 2: API simulation with email
    console.log('🌐 Test 2: API simulation with email');
    
    // Simulate API calls
    const simulateGetCart = async (userEmail, sessionId) => {
      let query, params;
      if (userEmail) {
        query = 'SELECT c.*, p.name FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_email = $1 AND c.session_id IS NULL';
        params = [userEmail];
      } else {
        query = 'SELECT c.*, p.name FROM cart c JOIN products p ON c.product_id = p.id WHERE c.session_id = $1 AND c.user_email IS NULL';
        params = [sessionId];
      }
      const result = await pool.query(query, params);
      return result.rows;
    };

    const apiEmail1Items = await simulateGetCart(email1, null);
    const apiEmail2Items = await simulateGetCart(email2, null);
    const apiSessionItems = await simulateGetCart(null, session1);

    console.log(`  ✓ API Email1 items: ${apiEmail1Items.length} (expected: 2)`);
    console.log(`  ✓ API Email2 items: ${apiEmail2Items.length} (expected: 1)`);
    console.log(`  ✓ API Session items: ${apiSessionItems.length} (expected: 1)`);
    
    const apiTestPassed = apiEmail1Items.length === 2 && apiEmail2Items.length === 1 && apiSessionItems.length === 1;
    
    if (apiTestPassed) {
      console.log('  ✅ API email-based cart works correctly\n');
    } else {
      console.log('  ❌ API email-based cart failed\n');
    }

    // Test 3: Cross-contamination check
    console.log('🔒 Test 3: Cross-contamination check');
    
    // Check that email items don't appear in session carts
    const emailItemsWithSession = await pool.query(
      'SELECT * FROM cart WHERE user_email IS NOT NULL AND session_id IS NOT NULL'
    );
    
    // Check that session items don't have email
    const sessionItemsWithEmail = await pool.query(
      'SELECT * FROM cart WHERE session_id IS NOT NULL AND user_email IS NOT NULL'
    );

    console.log(`  ✓ Items with both email and session_id: ${emailItemsWithSession.rows.length} (expected: 0)`);
    console.log(`  ✓ Session items with email: ${sessionItemsWithEmail.rows.length} (expected: 0)`);
    
    if (emailItemsWithSession.rows.length === 0 && sessionItemsWithEmail.rows.length === 0) {
      console.log('  ✅ No cross-contamination detected\n');
    } else {
      console.log('  ❌ Cross-contamination detected\n');
    }

    // Test 4: Email uniqueness
    console.log('👤 Test 4: Email uniqueness test');
    
    // Check that different emails have separate carts
    const allEmailCarts = await pool.query(
      'SELECT user_email, COUNT(*) as item_count FROM cart WHERE user_email IS NOT NULL GROUP BY user_email'
    );
    
    console.log('  ✓ Cart items by email:');
    allEmailCarts.rows.forEach(row => {
      console.log(`    - ${row.user_email}: ${row.item_count} items`);
    });
    
    const uniqueEmails = allEmailCarts.rows.length;
    if (uniqueEmails >= 2) {
      console.log('  ✅ Email uniqueness works correctly\n');
    } else {
      console.log('  ❌ Email uniqueness failed\n');
    }

    // Clean up test data
    await pool.query("DELETE FROM cart WHERE user_email LIKE '%test%' OR session_id LIKE 'test-%'");
    console.log('✓ Cleaned up test data');

    // Summary
    console.log('\n🎉 Email-based cart test completed!');
    console.log('\n📋 Test Results:');
    console.log(email1Items.rows.length === 2 && email2Items.rows.length === 1 && sessionItems.rows.length === 1 ? '✅' : '❌', 'Email-based cart isolation');
    console.log(apiTestPassed ? '✅' : '❌', 'API email-based functionality');
    console.log(emailItemsWithSession.rows.length === 0 && sessionItemsWithEmail.rows.length === 0 ? '✅' : '❌', 'No cross-contamination');
    console.log(uniqueEmails >= 2 ? '✅' : '❌', 'Email uniqueness');

  } catch (error) {
    console.error('❌ Email-based cart test failed:', error);
  } finally {
    await pool.end();
  }
}

testEmailBasedCart();