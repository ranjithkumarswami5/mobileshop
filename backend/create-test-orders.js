const { Pool } = require('pg');

const pool = new Pool({
  host: '157.254.189.56',
  port: 5432,
  database: 'devisrimobiles',
  user: 'postgres',
  password: 'Ranjith@123',
});

async function createTestOrders() {
  try {
    console.log('📦 Creating test orders for order history...\n');

    // Get test user and products
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['user@example.com']);
    if (userResult.rows.length === 0) {
      console.log('❌ Test user not found. Creating test user...');
      const userId = require('crypto').randomUUID();
      await pool.query(
        'INSERT INTO users (id, email, mobile_number, referral_code, is_admin) VALUES ($1, $2, $3, $4, $5)',
        [userId, 'user@example.com', '9876543210', 'REF-TEST123', false]
      );
      console.log('✅ Created test user: user@example.com');
    }

    const user = await pool.query('SELECT * FROM users WHERE email = $1', ['user@example.com']);
    const products = await pool.query('SELECT * FROM products LIMIT 5');

    if (products.rows.length === 0) {
      console.log('❌ No products found. Please run the mobile products seed script first.');
      return;
    }

    // Create test orders
    const testOrders = [
      {
        id: require('crypto').randomUUID(),
        customer_name: 'Test User',
        user_id: user.rows[0].id,
        total: 89999,
        items: JSON.stringify([
          {
            product: {
              id: products.rows[0].id,
              name: products.rows[0].name,
              price: products.rows[0].price
            },
            quantity: 1
          }
        ]),
        status: 'Delivered',
        applied_coupon: 'WELCOME10',
        address: '123 Test Street, Test City, Test State',
        mobile_number: '9876543210',
        pincode: '123456',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      },
      {
        id: require('crypto').randomUUID(),
        customer_name: 'Test User',
        user_id: user.rows[0].id,
        total: 124999,
        items: JSON.stringify([
          {
            product: {
              id: products.rows[1].id,
              name: products.rows[1].name,
              price: products.rows[1].price
            },
            quantity: 1
          }
        ]),
        status: 'Shipped',
        applied_coupon: 'SAVE15',
        address: '123 Test Street, Test City, Test State',
        mobile_number: '9876543210',
        pincode: '123456',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        id: require('crypto').randomUUID(),
        customer_name: 'Test User',
        user_id: user.rows[0].id,
        total: 4999,
        items: JSON.stringify([
          {
            product: {
              id: products.rows[2].id,
              name: products.rows[2].name,
              price: products.rows[2].price
            },
            quantity: 1
          }
        ]),
        status: 'Pending',
        address: '123 Test Street, Test City, Test State',
        mobile_number: '9876543210',
        pincode: '123456',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: require('crypto').randomUUID(),
        customer_name: 'Test User',
        user_id: user.rows[0].id,
        total: 159900,
        items: JSON.stringify([
          {
            product: {
              id: products.rows[3].id,
              name: products.rows[3].name,
              price: products.rows[3].price
            },
            quantity: 1
          }
        ]),
        status: 'Delivered',
        applied_coupon: 'MOBILE20',
        address: '456 Another Street, Another City, Another State',
        mobile_number: '9876543210',
        pincode: '654321',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
      }
    ];

    // Clear existing test orders for this user
    await pool.query('DELETE FROM orders WHERE user_id = $1', [user.rows[0].id]);
    console.log('✓ Cleared existing test orders');

    // Insert test orders
    for (const order of testOrders) {
      await pool.query(
        'INSERT INTO orders (id, customer_name, user_id, total, items, status, applied_coupon, address, mobile_number, pincode, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [
          order.id,
          order.customer_name,
          order.user_id,
          order.total,
          order.items,
          order.status,
          order.applied_coupon,
          order.address,
          order.mobile_number,
          order.pincode,
          order.created_at
        ]
      );
      
      const orderDate = new Date(order.created_at).toLocaleDateString();
      const totalFormatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(order.total);
      
      console.log(`✓ Created order: ${order.status} - ${totalFormatted} (${orderDate})`);
    }

    // Verify orders were created
    const orderCount = await pool.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [user.rows[0].id]);
    console.log(`\n📋 Total orders for test user: ${orderCount.rows[0].count}`);

    // Show order summary
    const orderSummary = await pool.query(`
      SELECT status, COUNT(*) as count, SUM(total) as total_amount 
      FROM orders 
      WHERE user_id = $1 
      GROUP BY status 
      ORDER BY count DESC
    `, [user.rows[0].id]);

    console.log('\n📊 Order Summary:');
    orderSummary.rows.forEach(row => {
      const amount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(row.total_amount);
      console.log(`  - ${row.status}: ${row.count} orders (${amount})`);
    });

    console.log('\n🎉 Test orders created successfully!');
    console.log('You can now view the order history in the Profile page when logged in as user@example.com');

  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  } finally {
    await pool.end();
  }
}

createTestOrders();