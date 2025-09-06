import type { Product, User, Coupon, Order, ServiceOrder } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function getServiceOrders(): Promise<ServiceOrder[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-orders`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching service orders:', error);
    throw error;
  }
}

export async function getUserCoupons(mobileNumber: string): Promise<Coupon[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/user/${mobileNumber}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user coupons:', error);
    throw error;
  }
}

export async function getUserOrders(userEmail: string): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/user/${encodeURIComponent(userEmail)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

export async function validateCoupon(code: string, userMobile?: string): Promise<{ valid: boolean; coupon?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, userMobile }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { valid: false, error: errorData.error };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Failed to validate coupon' };
  }
}

export async function getExpenses(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}

export async function createExpense(expenseData: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

export async function updateExpense(id: string, expenseData: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

// CRUD Operations for Products

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: product.name,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        category: product.category,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, product: Omit<Product, 'id'>): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: product.name,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        category: product.category,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// CRUD Operations for Users

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        mobileNumber: user.mobileNumber,
        referralCode: user.referralCode,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(id: string, user: Omit<User, 'id'>): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        mobileNumber: user.mobileNumber,
        referralCode: user.referralCode,
        isAdmin: user.isAdmin,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// CRUD Operations for Coupons

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'usageCount'> & { userMobile?: string }): Promise<Coupon> {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        userMobile: coupon.userMobile,
        isActive: coupon.isActive,
        expiryDate: coupon.expiryDate,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
}

export async function updateCoupon(id: string, coupon: Omit<Coupon, 'id' | 'usageCount'>): Promise<Coupon> {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        isActive: coupon.isActive,
        expiryDate: coupon.expiryDate,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
}

// CRUD Operations for Service Orders

export async function createServiceOrder(serviceOrder: Omit<ServiceOrder, 'id' | 'createdAt'>): Promise<ServiceOrder> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: serviceOrder.customerName,
        contactNumber: serviceOrder.contactNumber,
        deviceModel: serviceOrder.deviceModel,
        serialNumber: serviceOrder.serialNumber,
        issueDescription: serviceOrder.issueDescription,
        status: serviceOrder.status,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating service order:', error);
    throw error;
  }
}

export async function updateServiceOrder(id: string, serviceOrder: Omit<ServiceOrder, 'id' | 'createdAt'>): Promise<ServiceOrder> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: serviceOrder.customerName,
        contactNumber: serviceOrder.contactNumber,
        deviceModel: serviceOrder.deviceModel,
        serialNumber: serviceOrder.serialNumber,
        issueDescription: serviceOrder.issueDescription,
        status: serviceOrder.status,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating service order:', error);
    throw error;
  }
}

export async function deleteServiceOrder(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-orders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting service order:', error);
    throw error;
  }
}
