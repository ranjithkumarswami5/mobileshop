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
      address: row.address,
      mobileNumber: row.mobile_number,
      pincode: row.pincode,
    }));
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get user-specific orders
app.get('/api/orders/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(`
      SELECT o.*, u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE u.email = $1 OR o.mobile_number IN (
        SELECT mobile_number FROM users WHERE email = $1
      )
      ORDER BY o.created_at DESC
    `, [email]);
    
    const orders = result.rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      userId: row.user_id,
      total: row.total,
      items: row.items,
      createdAt: row.created_at,
      status: row.status,
      appliedCoupon: row.applied_coupon,
      address: row.address,
      mobileNumber: row.mobile_number,
      pincode: row.pincode,
    }));
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
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
      userMobile: row.user_mobile,
      isActive: row.is_active,
      usageCount: row.usage_count,
      expiryDate: row.expiry_date,
      createdAt: row.created_at,
    }));
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Get user-specific coupons
app.get('/api/coupons/user/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    const result = await pool.query(
      'SELECT * FROM coupons WHERE user_mobile = $1 AND is_active = true ORDER BY created_at DESC',
      [mobile]
    );
    const coupons = result.rows.map(row => ({
      id: row.id,
      code: row.code,
      discountPercent: row.discount_percent,
      userMobile: row.user_mobile,
      isActive: row.is_active,
      usageCount: row.usage_count,
      expiryDate: row.expiry_date,
      createdAt: row.created_at,
    }));
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching user coupons:', error);
    res.status(500).json({ error: 'Failed to fetch user coupons' });
  }
});

// Validate coupon endpoint
app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, userMobile } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    // Check if coupon exists and is active
    const couponResult = await pool.query(
      'SELECT * FROM coupons WHERE code = $1 AND is_active = true',
      [code]
    );

    if (couponResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or inactive coupon code' });
    }

    const coupon = couponResult.rows[0];

    // Check if coupon has expiry date and if it's expired
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    // Check if coupon is user-specific
    if (coupon.user_mobile && coupon.user_mobile !== userMobile) {
      return res.status(400).json({ error: 'This coupon is not valid for your account' });
    }

    // Check if coupon has already been used in orders
    const usedInOrders = await pool.query(
      'SELECT * FROM orders WHERE applied_coupon = $1',
      [code]
    );

    // Check if coupon has already been used in service orders
    const usedInServiceOrders = await pool.query(
      'SELECT * FROM service_orders WHERE applied_coupon = $1',
      [code]
    );

    if (usedInOrders.rows.length > 0 || usedInServiceOrders.rows.length > 0) {
      return res.status(400).json({ error: 'Coupon has already been used' });
    }

    // Return valid coupon details
    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discount_percent,
        userMobile: coupon.user_mobile,
        expiryDate: coupon.expiry_date,
      }
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
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
      price: row.price ? parseFloat(row.price) : null,
      appliedCoupon: row.applied_coupon,
      status: row.status,
      createdAt: row.created_at,
    }));
    res.json(serviceOrders);
  } catch (error) {
    console.error('Error fetching service orders:', error);
    res.status(500).json({ error: 'Failed to fetch service orders' });
  }
});

// CRUD Operations for Products

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, stock, imageUrl, category } = req.body;
    const id = require('crypto').randomUUID();
    const result = await pool.query(
      'INSERT INTO products (id, name, price, stock, image_url, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, name, price, stock, imageUrl, category]
    );
    const product = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      price: result.rows[0].price,
      stock: result.rows[0].stock,
      imageUrl: result.rows[0].image_url,
      category: result.rows[0].category,
    };
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, imageUrl, category } = req.body;
    const result = await pool.query(
      'UPDATE products SET name = $1, price = $2, stock = $3, image_url = $4, category = $5 WHERE id = $6 RETURNING *',
      [name, price, stock, imageUrl, category, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      price: result.rows[0].price,
      stock: result.rows[0].stock,
      imageUrl: result.rows[0].image_url,
      category: result.rows[0].category,
    };
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// CRUD Operations for Users

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const { email, mobileNumber, referralCode, isAdmin, createdAt } = req.body;
    const id = require('crypto').randomUUID();
    const result = await pool.query(
      'INSERT INTO users (id, email, mobile_number, referral_code, is_admin, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, email, mobileNumber, referralCode, isAdmin, createdAt]
    );
    const user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      mobileNumber: result.rows[0].mobile_number,
      referralCode: result.rows[0].referral_code,
      isAdmin: result.rows[0].is_admin,
      createdAt: result.rows[0].created_at,
    };
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, mobileNumber, referralCode, isAdmin } = req.body;
    const result = await pool.query(
      'UPDATE users SET email = $1, mobile_number = $2, referral_code = $3, is_admin = $4 WHERE id = $5 RETURNING *',
      [email, mobileNumber, referralCode, isAdmin, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      mobileNumber: result.rows[0].mobile_number,
      referralCode: result.rows[0].referral_code,
      isAdmin: result.rows[0].is_admin,
      createdAt: result.rows[0].created_at,
    };
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// CRUD Operations for Coupons

// Create coupon
app.post('/api/coupons', async (req, res) => {
  try {
    const { code, discountPercent, userMobile, isActive, expiryDate } = req.body;
    const id = require('crypto').randomUUID();
    const result = await pool.query(
      'INSERT INTO coupons (id, code, discount_percent, user_mobile, is_active, expiry_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, code, discountPercent, userMobile, isActive, expiryDate]
    );
    const coupon = {
      id: result.rows[0].id,
      code: result.rows[0].code,
      discountPercent: result.rows[0].discount_percent,
      userMobile: result.rows[0].user_mobile,
      isActive: result.rows[0].is_active,
      usageCount: result.rows[0].usage_count,
      expiryDate: result.rows[0].expiry_date,
      createdAt: result.rows[0].created_at,
    };
    res.status(201).json(coupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// Update coupon
app.put('/api/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountPercent, isActive, expiryDate } = req.body;
    const result = await pool.query(
      'UPDATE coupons SET code = $1, discount_percent = $2, is_active = $3, expiry_date = $4 WHERE id = $5 RETURNING *',
      [code, discountPercent, isActive, expiryDate, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    const coupon = {
      id: result.rows[0].id,
      code: result.rows[0].code,
      discountPercent: result.rows[0].discount_percent,
      isActive: result.rows[0].is_active,
      usageCount: result.rows[0].usage_count,
      expiryDate: result.rows[0].expiry_date,
    };
    res.json(coupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// Delete coupon
app.delete('/api/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM coupons WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// CRUD Operations for Service Orders

// Create service order
app.post('/api/service-orders', async (req, res) => {
  try {
    const { customerName, contactNumber, deviceModel, serialNumber, issueDescription, price, appliedCoupon, status } = req.body;
    const id = require('crypto').randomUUID();

    // Validate coupon if provided
    if (appliedCoupon) {
      const couponResult = await pool.query('SELECT * FROM coupons WHERE code = $1 AND is_active = true', [appliedCoupon]);
      if (couponResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or inactive coupon code' });
      }

      // Check if coupon has already been used in service orders
      const usedCoupon = await pool.query('SELECT * FROM service_orders WHERE applied_coupon = $1', [appliedCoupon]);
      if (usedCoupon.rows.length > 0) {
        return res.status(400).json({ error: 'Coupon has already been used' });
      }

      // Check if coupon has expiry date and if it's expired
      const coupon = couponResult.rows[0];
      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        return res.status(400).json({ error: 'Coupon has expired' });
      }
    }

    const result = await pool.query(
      'INSERT INTO service_orders (id, customer_name, contact_number, device_model, serial_number, issue_description, price, applied_coupon, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [id, customerName, contactNumber, deviceModel, serialNumber, issueDescription, price, appliedCoupon, status]
    );

    // If coupon was used, mark it as inactive (expired after use)
    if (appliedCoupon) {
      await pool.query(
        'UPDATE coupons SET is_active = false, usage_count = usage_count + 1 WHERE code = $1',
        [appliedCoupon]
      );
    }
    const serviceOrder = {
      id: result.rows[0].id,
      customerName: result.rows[0].customer_name,
      contactNumber: result.rows[0].contact_number,
      deviceModel: result.rows[0].device_model,
      serialNumber: result.rows[0].serial_number,
      issueDescription: result.rows[0].issue_description,
      price: result.rows[0].price ? parseFloat(result.rows[0].price) : null,
      appliedCoupon: result.rows[0].applied_coupon,
      status: result.rows[0].status,
      createdAt: result.rows[0].created_at,
    };
    res.status(201).json(serviceOrder);
  } catch (error) {
    console.error('Error creating service order:', error);
    res.status(500).json({ error: 'Failed to create service order' });
  }
});

// Update service order
app.put('/api/service-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, contactNumber, deviceModel, serialNumber, issueDescription, price, appliedCoupon, status } = req.body;
    const result = await pool.query(
      'UPDATE service_orders SET customer_name = $1, contact_number = $2, device_model = $3, serial_number = $4, issue_description = $5, price = $6, applied_coupon = $7, status = $8 WHERE id = $9 RETURNING *',
      [customerName, contactNumber, deviceModel, serialNumber, issueDescription, price, appliedCoupon, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service order not found' });
    }
    const serviceOrder = {
      id: result.rows[0].id,
      customerName: result.rows[0].customer_name,
      contactNumber: result.rows[0].contact_number,
      deviceModel: result.rows[0].device_model,
      serialNumber: result.rows[0].serial_number,
      issueDescription: result.rows[0].issue_description,
      price: result.rows[0].price ? parseFloat(result.rows[0].price) : null,
      appliedCoupon: result.rows[0].applied_coupon,
      status: result.rows[0].status,
      createdAt: result.rows[0].created_at,
    };
    res.json(serviceOrder);
  } catch (error) {
    console.error('Error updating service order:', error);
    res.status(500).json({ error: 'Failed to update service order' });
  }
});

// Delete service order
app.delete('/api/service-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM service_orders WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service order not found' });
    }
    res.json({ message: 'Service order deleted successfully' });
  } catch (error) {
    console.error('Error deleting service order:', error);
    res.status(500).json({ error: 'Failed to delete service order' });
  }
});

// ORDER CRUD Operations

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    console.log('Order request received:', req.body);
    const { customerName, userId, total, items, appliedCoupon, address, mobileNumber, pincode } = req.body;

    // Validate and handle coupon if provided
    if (appliedCoupon) {
      console.log('Validating coupon:', appliedCoupon);
      const couponResult = await pool.query(
        'SELECT * FROM coupons WHERE code = $1 AND is_active = true',
        [appliedCoupon]
      );

      console.log('Coupon query result:', couponResult.rows);

      if (couponResult.rows.length === 0) {
        console.log('Coupon not found or inactive');
        return res.status(400).json({ error: 'Invalid or inactive coupon code' });
      }

      // Check if coupon has already been used in orders
      const usedCouponInOrders = await pool.query(
        'SELECT * FROM orders WHERE applied_coupon = $1',
        [appliedCoupon]
      );

      console.log('Used coupon check result:', usedCouponInOrders.rows);

      if (usedCouponInOrders.rows.length > 0) {
        console.log('Coupon already used');
        return res.status(400).json({ error: 'Coupon has already been used' });
      }

      // Check if coupon has expiry date and if it's expired
      const coupon = couponResult.rows[0];
      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        console.log('Coupon expired');
        return res.status(400).json({ error: 'Coupon has expired' });
      }
    }

    const id = require('crypto').randomUUID();
    const result = await pool.query(
      'INSERT INTO orders (id, customer_name, user_id, total, items, applied_coupon, address, mobile_number, pincode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [id, customerName, userId, total, JSON.stringify(items), appliedCoupon, address, mobileNumber, pincode]
    );

    // If coupon was used, mark it as inactive (expired after use)
    if (appliedCoupon) {
      await pool.query(
        'UPDATE coupons SET is_active = false, usage_count = usage_count + 1 WHERE code = $1',
        [appliedCoupon]
      );
    }

    const order = {
      id: result.rows[0].id,
      customerName: result.rows[0].customer_name,
      userId: result.rows[0].user_id,
      total: result.rows[0].total,
      items: result.rows[0].items,
      createdAt: result.rows[0].created_at,
      status: result.rows[0].status,
      appliedCoupon: result.rows[0].applied_coupon,
      address: result.rows[0].address,
      mobileNumber: result.rows[0].mobile_number,
      pincode: result.rows[0].pincode,
    };

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// CART CRUD Operations

// Get cart items for a user/session
app.get('/api/cart', async (req, res) => {
  try {
    const { userEmail, sessionId } = req.query;

    if (!userEmail && !sessionId) {
      return res.status(400).json({ error: 'userEmail or sessionId is required' });
    }

    // Ensure proper isolation: if userEmail is provided, only get user cart; if sessionId is provided, only get session cart
    let query, params;
    if (userEmail) {
      query = 'SELECT c.*, p.name, p.price, p.image_url, p.category FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_email = $1 AND c.session_id IS NULL ORDER BY c.created_at';
      params = [userEmail];
    } else {
      query = 'SELECT c.*, p.name, p.price, p.image_url, p.category FROM cart c JOIN products p ON c.product_id = p.id WHERE c.session_id = $1 AND c.user_email IS NULL ORDER BY c.created_at';
      params = [sessionId];
    }

    const result = await pool.query(query, params);

    const cartItems = result.rows.map(row => ({
      id: row.id,
      product: {
        id: row.product_id,
        name: row.name,
        price: row.price,
        imageUrl: row.image_url,
        category: row.category,
      },
      quantity: row.quantity,
    }));

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
app.post('/api/cart', async (req, res) => {
  try {
    const { productId, quantity = 1, userEmail, sessionId } = req.body;

    if (!productId || (!userEmail && !sessionId)) {
      return res.status(400).json({ error: 'productId and userEmail/sessionId are required' });
    }

    const id = require('crypto').randomUUID();

    // Ensure proper isolation: check for existing items with proper null constraints
    let existingQuery, existingParams;
    if (userEmail) {
      existingQuery = 'SELECT id, quantity FROM cart WHERE user_email = $1 AND product_id = $2 AND session_id IS NULL';
      existingParams = [userEmail, productId];
    } else {
      existingQuery = 'SELECT id, quantity FROM cart WHERE session_id = $1 AND product_id = $2 AND user_email IS NULL';
      existingParams = [sessionId, productId];
    }

    const existing = await pool.query(existingQuery, existingParams);

    if (existing.rows.length > 0) {
      // Update quantity
      const newQuantity = existing.rows[0].quantity + quantity;
      const updateResult = await pool.query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [newQuantity, existing.rows[0].id]
      );

      const result = await pool.query(
        'SELECT c.*, p.name, p.price, p.image_url, p.category FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = $1',
        [existing.rows[0].id]
      );

      const cartItem = {
        id: result.rows[0].id,
        product: {
          id: result.rows[0].product_id,
          name: result.rows[0].name,
          price: result.rows[0].price,
          imageUrl: result.rows[0].image_url,
          category: result.rows[0].category,
        },
        quantity: result.rows[0].quantity,
      };

      res.json(cartItem);
    } else {
      // Insert new item with proper null constraints for isolation
      let insertQuery, insertParams;
      if (userEmail) {
        insertQuery = 'INSERT INTO cart (id, user_email, session_id, product_id, quantity) VALUES ($1, $2, NULL, $3, $4) RETURNING *';
        insertParams = [id, userEmail, productId, quantity];
      } else {
        insertQuery = 'INSERT INTO cart (id, user_email, session_id, product_id, quantity) VALUES ($1, NULL, $2, $3, $4) RETURNING *';
        insertParams = [id, sessionId, productId, quantity];
      }

      const result = await pool.query(insertQuery, insertParams);

      const itemResult = await pool.query(
        'SELECT c.*, p.name, p.price, p.image_url, p.category FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = $1',
        [id]
      );

      const cartItem = {
        id: itemResult.rows[0].id,
        product: {
          id: itemResult.rows[0].product_id,
          name: itemResult.rows[0].name,
          price: itemResult.rows[0].price,
          imageUrl: itemResult.rows[0].image_url,
          category: itemResult.rows[0].category,
        },
        quantity: itemResult.rows[0].quantity,
      };

      res.status(201).json(cartItem);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
app.put('/api/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await pool.query('DELETE FROM cart WHERE id = $1', [id]);
      res.json({ message: 'Item removed from cart' });
    } else {
      const result = await pool.query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [quantity, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      const itemResult = await pool.query(
        'SELECT c.*, p.name, p.price, p.image_url, p.category FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = $1',
        [id]
      );

      const cartItem = {
        id: itemResult.rows[0].id,
        product: {
          id: itemResult.rows[0].product_id,
          name: itemResult.rows[0].name,
          price: itemResult.rows[0].price,
          imageUrl: itemResult.rows[0].image_url,
          category: itemResult.rows[0].category,
        },
        quantity: itemResult.rows[0].quantity,
      };

      res.json(cartItem);
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cart WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear entire cart for user/session
app.delete('/api/cart', async (req, res) => {
  try {
    const { userEmail, sessionId } = req.query;

    if (!userEmail && !sessionId) {
      return res.status(400).json({ error: 'userEmail or sessionId is required' });
    }

    // Ensure proper isolation when clearing cart
    let query, params;
    if (userEmail) {
      query = 'DELETE FROM cart WHERE user_email = $1 AND session_id IS NULL';
      params = [userEmail];
    } else {
      query = 'DELETE FROM cart WHERE session_id = $1 AND user_email IS NULL';
      params = [sessionId];
    }

    await pool.query(query, params);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// EXPENSES CRUD Operations

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
    const expenses = result.rows.map(row => ({
      id: row.id,
      description: row.description,
      amount: parseFloat(row.amount),
      category: row.category,
      date: row.date,
      createdAt: row.created_at,
    }));
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    const id = require('crypto').randomUUID();
    const result = await pool.query(
      'INSERT INTO expenses (id, description, amount, category, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, description, amount, category, date]
    );
    const expense = {
      id: result.rows[0].id,
      description: result.rows[0].description,
      amount: parseFloat(result.rows[0].amount),
      category: result.rows[0].category,
      date: result.rows[0].date,
      createdAt: result.rows[0].created_at,
    };
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date } = req.body;
    const result = await pool.query(
      'UPDATE expenses SET description = $1, amount = $2, category = $3, date = $4 WHERE id = $5 RETURNING *',
      [description, amount, category, date, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    const expense = {
      id: result.rows[0].id,
      description: result.rows[0].description,
      amount: parseFloat(result.rows[0].amount),
      category: result.rows[0].category,
      date: result.rows[0].date,
      createdAt: result.rows[0].created_at,
    };
    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
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
