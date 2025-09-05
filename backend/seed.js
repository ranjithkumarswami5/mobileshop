const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

const pool = new Pool({
  host: '157.254.189.56',
  port: 5432,
  database: 'devisrimobiles',
  user: 'postgres',
  password: 'Ranjith@123',
});

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await pool.query('DELETE FROM service_orders');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM coupons');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM products');

    console.log('Cleared existing data');

    // Seed products
    console.log('Seeding products...');
    for (let i = 1; i <= 20; i++) {
      const product = {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        price: parseInt(faker.commerce.price({ min: 5000, max: 150000 })),
        stock: faker.number.int({ min: 0, max: 100 }),
        image_url: `https://picsum.photos/seed/${faker.string.uuid()}/400/400`,
        category: faker.helpers.arrayElement(['phone', 'accessory'])
      };

      await pool.query(
        'INSERT INTO products (id, name, price, stock, image_url, category) VALUES ($1, $2, $3, $4, $5, $6)',
        [product.id, product.name, product.price, product.stock, product.image_url, product.category]
      );
    }

    // Seed users
    console.log('Seeding users...');
    const users = [
      {
        id: 'admin',
        email: 'admin@example.com',
        mobile_number: '9999999999',
        referral_code: 'REF-ADMIN001',
        is_admin: true,
        created_at: faker.date.past().toISOString(),
      },
      {
        id: 'user1',
        email: 'user@example.com',
        mobile_number: '9876543210',
        referral_code: 'REF-ABCD1234',
        is_admin: false,
        created_at: faker.date.past().toISOString(),
      }
    ];

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (id, email, mobile_number, referral_code, is_admin, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [user.id, user.email, user.mobile_number, user.referral_code, user.is_admin, user.created_at]
      );
    }

    // Add more random users
    for (let i = 0; i < 10; i++) {
      const user = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        mobile_number: faker.string.numeric(10), // Generate exactly 10 digits
        referral_code: `REF-${faker.string.alphanumeric(8).toUpperCase()}`,
        is_admin: false,
        created_at: faker.date.past().toISOString(),
      };

      await pool.query(
        'INSERT INTO users (id, email, mobile_number, referral_code, is_admin, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [user.id, user.email, user.mobile_number, user.referral_code, user.is_admin, user.created_at]
      );
    }

    // Seed coupons
    console.log('Seeding coupons...');
    const coupons = [
      {
        id: '1',
        code: 'WELCOME10',
        discount_percent: 10,
        is_active: true,
        usage_count: faker.number.int({ min: 5, max: 50 }),
        expiry_date: faker.date.future().toISOString(),
      },
      {
        id: '2',
        code: 'REFER10',
        discount_percent: 10,
        is_active: true,
        usage_count: faker.number.int({ min: 5, max: 50 }),
      },
      {
        id: '3',
        code: 'SUMMER20',
        discount_percent: 20,
        is_active: false,
        usage_count: faker.number.int({ min: 5, max: 50 }),
        expiry_date: faker.date.past().toISOString(),
      }
    ];

    for (const coupon of coupons) {
      await pool.query(
        'INSERT INTO coupons (id, code, discount_percent, is_active, usage_count, expiry_date) VALUES ($1, $2, $3, $4, $5, $6)',
        [coupon.id, coupon.code, coupon.discount_percent, coupon.is_active, coupon.usage_count, coupon.expiry_date]
      );
    }

    // Seed orders
    console.log('Seeding orders...');
    const products = await pool.query('SELECT * FROM products');
    const allUsers = await pool.query('SELECT * FROM users');

    for (let i = 0; i < 15; i++) {
      const numItems = faker.number.int({ min: 1, max: 3 });
      const items = [];
      let total = 0;

      for (let j = 0; j < numItems; j++) {
        const product = faker.helpers.arrayElement(products.rows);
        const quantity = faker.number.int({ min: 1, max: 2 });
        items.push({ product: { id: product.id, name: product.name, price: product.price }, quantity });
        total += product.price * quantity;
      }

      const order = {
        id: faker.string.uuid(),
        customer_name: faker.person.fullName(),
        user_id: faker.helpers.arrayElement(allUsers.rows).id,
        total,
        items: JSON.stringify(items),
        created_at: faker.date.past().toISOString(),
        status: faker.helpers.arrayElement(['Pending', 'Shipped', 'Delivered', 'Cancelled']),
        applied_coupon: faker.helpers.maybe(() => faker.helpers.arrayElement(coupons).code)
      };

      await pool.query(
        'INSERT INTO orders (id, customer_name, user_id, total, items, created_at, status, applied_coupon) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [order.id, order.customer_name, order.user_id, order.total, order.items, order.created_at, order.status, order.applied_coupon]
      );
    }

    // Seed service orders
    console.log('Seeding service orders...');
    for (let i = 0; i < 8; i++) {
      const serviceOrder = {
        id: faker.string.uuid(),
        customer_name: faker.person.fullName(),
        contact_number: faker.string.numeric(10), // Generate exactly 10 digits
        device_model: `${faker.company.name()} ${faker.lorem.word()}`,
        serial_number: faker.string.alphanumeric(12).toUpperCase(),
        issue_description: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(['Pending', 'In Progress', 'Completed', 'Cancelled']),
        created_at: faker.date.past().toISOString(),
      };

      await pool.query(
        'INSERT INTO service_orders (id, customer_name, contact_number, device_model, serial_number, issue_description, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [serviceOrder.id, serviceOrder.customer_name, serviceOrder.contact_number, serviceOrder.device_model, serviceOrder.serial_number, serviceOrder.issue_description, serviceOrder.status, serviceOrder.created_at]
      );
    }

    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();