import { faker } from '@faker-js/faker';
import type { Product, User, Coupon, Order, CartItem, ServiceOrder } from '../types';

// Products
export const mockProducts: Product[] = [];
for (let i = 1; i <= 20; i++) {
  mockProducts.push({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    price: parseInt(faker.commerce.price({ min: 5000, max: 150000 })),
    stock: faker.number.int({ min: 0, max: 100 }),
    imageUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/400`,
    category: faker.helpers.arrayElement(['phone', 'accessory'])
  });
}

// Users
export const mockUsers: User[] = [
  {
    id: 'admin',
    email: 'admin@example.com',
    mobileNumber: '9999999999',
    referralCode: 'REF-ADMIN001',
    isAdmin: true,
    createdAt: faker.date.past().toISOString(),
  },
  {
    id: 'user1',
    email: 'user@example.com',
    mobileNumber: '9876543210',
    referralCode: 'REF-ABCD1234',
    isAdmin: false,
    createdAt: faker.date.past().toISOString(),
  }
];
for (let i = 0; i < 10; i++) {
  mockUsers.push({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    mobileNumber: faker.phone.number('##########'),
    referralCode: `REF-${faker.string.alphanumeric(8).toUpperCase()}`,
    isAdmin: false,
    createdAt: faker.date.past().toISOString(),
  });
}

// Export specific users for auth simulation
export const mockAdminUser: User = mockUsers[0];
export const mockUser: User = mockUsers[1];

// Coupons
export const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME10',
    discountPercent: 10,
    isActive: true,
    usageCount: faker.number.int({ min: 5, max: 50 }),
    expiryDate: faker.date.future().toISOString(),
  },
  {
    id: '2',
    code: 'REFER10',
    discountPercent: 10,
    isActive: true,
    usageCount: faker.number.int({ min: 5, max: 50 }),
  },
  {
    id: '3',
    code: 'SUMMER20',
    discountPercent: 20,
    isActive: false,
    usageCount: faker.number.int({ min: 5, max: 50 }),
    expiryDate: faker.date.past().toISOString(),
    isUsed: true,
  }
];

// Orders
export const mockOrders: Order[] = [];
for (let i = 0; i < 15; i++) {
  const numItems = faker.number.int({ min: 1, max: 3 });
  const items: CartItem[] = [];
  let total = 0;
  for (let j = 0; j < numItems; j++) {
    const product = faker.helpers.arrayElement(mockProducts);
    const quantity = faker.number.int({ min: 1, max: 2 });
    items.push({ product, quantity });
    total += product.price * quantity;
  }
  
  mockOrders.push({
    id: faker.string.uuid(),
    customerName: faker.person.fullName(),
    userId: faker.helpers.arrayElement(mockUsers).id,
    total,
    items,
    createdAt: faker.date.past().toISOString(),
    status: faker.helpers.arrayElement(['Pending', 'Shipped', 'Delivered', 'Cancelled']),
    appliedCoupon: faker.helpers.maybe(() => faker.helpers.arrayElement(mockCoupons).code),
    address: faker.location.streetAddress(),
    mobileNumber: faker.phone.number('##########'),
    pincode: faker.location.zipCode(),
  });
}

// Service Orders
export const mockServiceOrders: ServiceOrder[] = [];
for (let i = 0; i < 8; i++) {
  mockServiceOrders.push({
    id: faker.string.uuid(),
    customerName: faker.person.fullName(),
    contactNumber: faker.phone.number('##########'),
    deviceModel: `${faker.company.name()} ${faker.lorem.word()}`,
    serialNumber: faker.string.alphanumeric(12).toUpperCase(),
    issueDescription: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(['Pending', 'In Progress', 'Completed', 'Cancelled']),
    createdAt: faker.date.past().toISOString(),
  });
}
