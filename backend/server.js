const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: '157.254.189.56',
  port: 5432,
  database: 'devisrimobiles',
  user: 'postgres',
  password: 'Ranjith@123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

let dbConnected = false;

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
  dbConnected = true;
});

pool.on('error', (err) => {
  console.error('Database connection error:', err.message);
  dbConnected = false;
});

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    const products = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      stock: row.stock,
      imageUrl: row.image_url,
      category: row.category,
    }));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      mobileNumber: row.mobile_number,
      referralCode: row.referral_code,
      isAdmin: row.is_admin,
      createdAt: row.created_at,
    }));
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = result.rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      userId: row.user_id,
      total: row.total,
      items: row.items,
      createdAt: row.created_at,
      status: row.status,
      appliedCoupon: row.applied_coupon,
    }));
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all coupons
app.get('/api/coupons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coupons ORDER BY id');
    const coupons = result.rows.map(row => ({
      id: row.id,
      code: row.code,
      discountPercent: row.discount_percent,
      isActive: row.is_active,
      usageCount: row.usage_count,
      expiryDate: row.expiry_date,
    }));
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Get all service orders
app.get('/api/service-orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM service_orders ORDER BY created_at DESC');
    const serviceOrders = result.rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      contactNumber: row.contact_number,
      deviceModel: row.device_model,
      serialNumber: row.serial_number,
      issueDescription: row.issue_description,
      status: row.status,
      createdAt: row.created_at,
    }));
    res.json(serviceOrders);
  } catch (error) {
    console.error('Error fetching service orders:', error);
    res.status(500).json({ error: 'Failed to fetch service orders' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
