const { Pool } = require('pg');

const pool = new Pool({
  host: '157.254.189.56',
  port: 5432,
  database: 'devisrimobiles',
  user: 'postgres',
  password: 'Ranjith@123',
});

async function seedMobileProducts() {
  try {
    console.log('Starting mobile products seeding...');

    // Clear existing products
    await pool.query('DELETE FROM products');
    console.log('Cleared existing products');

    // Mobile phones data
    const mobilePhones = [
      {
        id: 'phone-001',
        name: 'iPhone 15 Pro Max',
        price: 159900,
        stock: 15,
        image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
        category: 'phone'
      },
      {
        id: 'phone-002',
        name: 'iPhone 15 Pro',
        price: 134900,
        stock: 20,
        image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        category: 'phone'
      },
      {
        id: 'phone-003',
        name: 'iPhone 15',
        price: 79900,
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop',
        category: 'phone'
      },
      {
        id: 'phone-004',
        name: 'iPhone 14 Pro Max',
        price: 129900,
        stock: 12,
        image_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop',
        category: 'phone'
      },
      {
        id: 'phone-005',
        name: 'Samsung Galaxy S24 Ultra',
        price: 124999,
        stock: 18,
        image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
        category: 'phone'
      },
      {
        id: 'phone-006',
        name: 'Samsung Galaxy S24+',
        price: 99999,
        stock: 22,
        image_url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop',
        category: 'phone'
      },
      {
        id: 'phone-007',
        name: 'Samsung Galaxy S24',
        price: 79999,
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop',
        category: 'phone'
      },
      {
        id: 'phone-008',
        name: 'OnePlus 12',
        price: 64999,
        stock: 15,
        image_url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop',
        category: 'phone'
      },
      {
        id: 'phone-009',
        name: 'Google Pixel 8 Pro',
        price: 84999,
        stock: 10,
        image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',
        category: 'phone'
      },
      {
        id: 'phone-010',
        name: 'Xiaomi 14 Ultra',
        price: 89999,
        stock: 8,
        image_url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&h=400&fit=crop',
        category: 'phone'
      },
      {
        id: 'phone-011',
        name: 'Vivo X100 Pro',
        price: 89999,
        stock: 12,
        image_url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&h=400&fit=crop',
        category: 'phone'
      },
      {
        id: 'phone-012',
        name: 'Oppo Find X7 Ultra',
        price: 99999,
        stock: 6,
        image_url: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=400&fit=crop',
        category: 'phone'
      }
    ];

    // Mobile accessories data
    const accessories = [
      {
        id: 'acc-001',
        name: 'iPhone 15 Pro Max Clear Case',
        price: 4999,
        stock: 50,
        image_url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-002',
        name: 'Samsung Galaxy S24 Ultra Leather Case',
        price: 3999,
        stock: 45,
        image_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-003',
        name: 'Wireless Charging Pad 15W',
        price: 2999,
        stock: 35,
        image_url: 'https://images.unsplash.com/photo-1609592806596-4d3b0e2b2c6e?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-004',
        name: 'USB-C to Lightning Cable 2m',
        price: 1999,
        stock: 100,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-005',
        name: 'Power Bank 20000mAh Fast Charge',
        price: 3499,
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1609592806596-4d3b0e2b2c6e?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-006',
        name: 'Bluetooth Earbuds Pro',
        price: 8999,
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-007',
        name: 'Car Phone Mount Magnetic',
        price: 1499,
        stock: 40,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-008',
        name: 'Screen Protector Tempered Glass',
        price: 999,
        stock: 80,
        image_url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-009',
        name: 'Phone Ring Holder Stand',
        price: 599,
        stock: 60,
        image_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-010',
        name: 'Fast Charger 65W USB-C',
        price: 2499,
        stock: 35,
        image_url: 'https://images.unsplash.com/photo-1609592806596-4d3b0e2b2c6e?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-011',
        name: 'Phone Cleaning Kit',
        price: 799,
        stock: 50,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-012',
        name: 'Selfie Stick Tripod Bluetooth',
        price: 1999,
        stock: 20,
        image_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-013',
        name: 'Phone Camera Lens Kit',
        price: 2999,
        stock: 15,
        image_url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-014',
        name: 'Waterproof Phone Pouch',
        price: 1299,
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop',
        category: 'accessory'
      },
      {
        id: 'acc-015',
        name: 'Gaming Controller for Mobile',
        price: 4999,
        stock: 12,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        category: 'accessory'
      }
    ];

    // Combine all products
    const allProducts = [...mobilePhones, ...accessories];

    // Insert products
    console.log('Inserting mobile phones and accessories...');
    for (const product of allProducts) {
      await pool.query(
        'INSERT INTO products (id, name, price, stock, image_url, category) VALUES ($1, $2, $3, $4, $5, $6)',
        [product.id, product.name, product.price, product.stock, product.image_url, product.category]
      );
    }

    console.log(`Successfully inserted ${allProducts.length} products:`);
    console.log(`- ${mobilePhones.length} mobile phones`);
    console.log(`- ${accessories.length} accessories`);

    // Verify the data
    const result = await pool.query('SELECT category, COUNT(*) as count FROM products GROUP BY category');
    console.log('\nProduct count by category:');
    result.rows.forEach(row => {
      console.log(`- ${row.category}: ${row.count} products`);
    });

    console.log('\nMobile products seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding mobile products:', error);
  } finally {
    await pool.end();
  }
}

seedMobileProducts();