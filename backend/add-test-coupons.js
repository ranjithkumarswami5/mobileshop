const { Pool } = require('pg');

const pool = new Pool({
  host: '157.254.189.56',
  port: 5432,
  database: 'devisrimobiles',
  user: 'postgres',
  password: 'Ranjith@123',
});

async function addTestCoupons() {
  try {
    console.log('🎫 Adding test coupons for cart display...\n');

    // Add some active coupons for testing
    const testCoupons = [
      {
        id: require('crypto').randomUUID(),
        code: 'WELCOME10',
        discount_percent: 10,
        is_active: true,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      },
      {
        id: require('crypto').randomUUID(),
        code: 'SAVE15',
        discount_percent: 15,
        is_active: true,
        expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      },
      {
        id: require('crypto').randomUUID(),
        code: 'MOBILE20',
        discount_percent: 20,
        is_active: true,
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      },
      {
        id: require('crypto').randomUUID(),
        code: 'FIRSTBUY',
        discount_percent: 25,
        is_active: true,
        expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
      },
      {
        id: require('crypto').randomUUID(),
        code: 'ACCESSORIES5',
        discount_percent: 5,
        is_active: true,
        expiry_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
      }
    ];

    // Clear existing test coupons first
    await pool.query("DELETE FROM coupons WHERE code IN ('WELCOME10', 'SAVE15', 'MOBILE20', 'FIRSTBUY', 'ACCESSORIES5')");
    console.log('✓ Cleared existing test coupons');

    // Insert new test coupons
    for (const coupon of testCoupons) {
      await pool.query(
        'INSERT INTO coupons (id, code, discount_percent, is_active, expiry_date, usage_count) VALUES ($1, $2, $3, $4, $5, $6)',
        [coupon.id, coupon.code, coupon.discount_percent, coupon.is_active, coupon.expiry_date, 0]
      );
      console.log(`✓ Added coupon: ${coupon.code} (${coupon.discount_percent}% off)`);
    }

    // Verify coupons were added
    const result = await pool.query('SELECT code, discount_percent, is_active, expiry_date FROM coupons WHERE is_active = true ORDER BY discount_percent DESC');
    
    console.log('\n📋 Active coupons in database:');
    result.rows.forEach(row => {
      const expiryDate = new Date(row.expiry_date).toLocaleDateString();
      console.log(`  - ${row.code}: ${row.discount_percent}% off (expires: ${expiryDate})`);
    });

    console.log(`\n🎉 Successfully added ${testCoupons.length} test coupons!`);
    console.log('These coupons will now be visible in the cart Order Summary.');

  } catch (error) {
    console.error('❌ Error adding test coupons:', error);
  } finally {
    await pool.end();
  }
}

addTestCoupons();