import type { Product, User, Coupon, Order, ServiceOrder } from '../types';
import { mockProducts, mockUsers, mockCoupons, mockOrders, mockServiceOrders } from './mockData';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProducts(): Promise<Product[]> {
  await delay(300); // Simulate network latency
  console.log("Returning mock products from src/lib/database.ts");
  return mockProducts;
}

export async function getUsers(): Promise<User[]> {
  await delay(300);
  console.log("Returning mock users from src/lib/database.ts");
  return mockUsers;
}

export async function getCoupons(): Promise<Coupon[]> {
  await delay(300);
  console.log("Returning mock coupons from src/lib/database.ts");
  return mockCoupons;
}

export async function getOrders(): Promise<Order[]> {
  await delay(300);
  console.log("Returning mock orders from src/lib/database.ts");
  return mockOrders;
}

export async function getServiceOrders(): Promise<ServiceOrder[]> {
  await delay(300);
  console.log("Returning mock service orders from src/lib/database.ts");
  return mockServiceOrders;
}

// Add more functions as needed, like insert, update, etc.
