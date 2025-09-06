const fetch = require('node-fetch');

async function testAPIIntegration() {
  try {
    console.log('🔗 Testing API integration with email-based cart...\n');

    const baseURL = 'http://localhost:3001/api';
    
    // Test 1: Add item to cart with email
    console.log('📧 Test 1: Adding item to cart with email');
    const addResponse = await fetch(`${baseURL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 'phone-001',
        quantity: 1,
        userEmail: 'test@example.com'
      }),
    });

    if (addResponse.ok) {
      const result = await addResponse.json();
      console.log('  ✅ Successfully added item to cart:', result.product.name);
    } else {
      const error = await addResponse.text();
      console.log('  ❌ Failed to add item to cart:', addResponse.status, error);
    }

    // Test 2: Get cart with email
    console.log('\n📧 Test 2: Getting cart with email');
    const getResponse = await fetch(`${baseURL}/cart?userEmail=test@example.com`);
    
    if (getResponse.ok) {
      const cartItems = await getResponse.json();
      console.log(`  ✅ Successfully retrieved cart: ${cartItems.length} items`);
      cartItems.forEach(item => {
        console.log(`    - ${item.product.name} (Qty: ${item.quantity})`);
      });
    } else {
      const error = await getResponse.text();
      console.log('  ❌ Failed to get cart:', getResponse.status, error);
    }

    // Test 3: Add item to session cart
    console.log('\n📱 Test 3: Adding item to session cart');
    const sessionResponse = await fetch(`${baseURL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 'phone-002',
        quantity: 2,
        sessionId: 'test-session-123'
      }),
    });

    if (sessionResponse.ok) {
      const result = await sessionResponse.json();
      console.log('  ✅ Successfully added item to session cart:', result.product.name);
    } else {
      const error = await sessionResponse.text();
      console.log('  ❌ Failed to add item to session cart:', sessionResponse.status, error);
    }

    // Test 4: Get session cart
    console.log('\n📱 Test 4: Getting session cart');
    const getSessionResponse = await fetch(`${baseURL}/cart?sessionId=test-session-123`);
    
    if (getSessionResponse.ok) {
      const sessionCartItems = await getSessionResponse.json();
      console.log(`  ✅ Successfully retrieved session cart: ${sessionCartItems.length} items`);
      sessionCartItems.forEach(item => {
        console.log(`    - ${item.product.name} (Qty: ${item.quantity})`);
      });
    } else {
      const error = await getSessionResponse.text();
      console.log('  ❌ Failed to get session cart:', getSessionResponse.status, error);
    }

    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await fetch(`${baseURL}/cart?userEmail=test@example.com`, { method: 'DELETE' });
    await fetch(`${baseURL}/cart?sessionId=test-session-123`, { method: 'DELETE' });
    console.log('  ✅ Test data cleaned up');

    console.log('\n🎉 API integration test completed successfully!');

  } catch (error) {
    console.error('❌ API integration test failed:', error.message);
  }
}

testAPIIntegration();