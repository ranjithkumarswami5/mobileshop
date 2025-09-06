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

      // Check if coupon has already been used
      const usedCoupon = await pool.query('SELECT * FROM service_orders WHERE applied_coupon = $1', [appliedCoupon]);
      if (usedCoupon.rows.length > 0) {
        return res.status(400).json({ error: 'Coupon has already been used' });
      }
    }

    const result = await pool.query(
      'INSERT INTO service_orders (id, customer_name, contact_number, device_model, serial_number, issue_description, price, applied_coupon, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [id, customerName, contactNumber, deviceModel, serialNumber, issueDescription, price, appliedCoupon, status]
    );
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
    const { customerName, userId, total, items, appliedCoupon, address, mobileNumber, pincode } = req.body;

    const id = require('crypto').randomUUID();
    const result = await pool.query(
      'INSERT INTO orders (id, customer_name, user_id, total, items, applied_coupon, address, mobile_number, pincode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [id, customerName, userId, total, JSON.stringify(items), appliedCoupon, address, mobileNumber, pincode]
    );

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
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// CART CRUD Operations

// Get cart items for a user/session
app.get('/api/cart', async (req, res) => {
  try {
    const { userId, sessionId } = req.query;

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'userId or sessionId is required' });
    }

    const query = userId
      ? 'SELECT c.*, p.name, p.price, p.image_url, p.category FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1 ORDER BY c.created_at'
      : 'SELECT c.*, p.name, p.price, p.image_url, p.category FROM cart c JOIN products p ON c.product_id = p.id WHERE c.session_id = $1 ORDER BY c.created_at';

    const result = await pool.query(query, [userId || sessionId]);

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
    const { productId, quantity = 1, userId, sessionId } = req.body;

    if (!productId || (!userId && !sessionId)) {
      return res.status(400).json({ error: 'productId and userId/sessionId are required' });
    }

    const id = require('crypto').randomUUID();

    // Check if item already exists in cart
    const existingQuery = userId
      ? 'SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2'
      : 'SELECT id, quantity FROM cart WHERE session_id = $1 AND product_id = $2';

    const existing = await pool.query(existingQuery, [userId || sessionId, productId]);

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
      // Insert new item
      const insertQuery = userId
        ? 'INSERT INTO cart (id, user_id, product_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *'
        : 'INSERT INTO cart (id, session_id, product_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *';

      const result = await pool.query(insertQuery, [id, userId || sessionId, productId, quantity]);

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
    const { userId, sessionId } = req.query;

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'userId or sessionId is required' });
    }

    const query = userId
      ? 'DELETE FROM cart WHERE user_id = $1'
      : 'DELETE FROM cart WHERE session_id = $1';

    await pool.query(query, [userId || sessionId]);
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
