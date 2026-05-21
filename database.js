import sqlite3 from 'node:sqlite3';
import { Database } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export async function initDb() {
  const dbPath = path.join(__dirname, 'shop.db');
  console.log('📁 Путь к БД:', dbPath);
  
  db = await Database.open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER,
      image TEXT,
      photo_path TEXT,
      category TEXT
    )
  `);
  
  // Переносим существующие товары из старого массива (если есть)
  const existing = await db.all('SELECT COUNT(*) as count FROM products');
  if (existing[0].count === 0) {
    console.log('📦 База пуста, можно будет добавить товары через админку');
  }
  
  console.log('✅ База данных инициализирована');
  return db;
}

export async function getAllProducts() {
  if (!db) await initDb();
  return await db.all('SELECT * FROM products ORDER BY id');
}

export async function getProductById(id) {
  if (!db) await initDb();
  return await db.get('SELECT * FROM products WHERE id = ?', id);
}

export async function createProduct(product) {
  if (!db) await initDb();
  const result = await db.run(
    'INSERT INTO products (name, description, price, image, photo_path, category) VALUES (?, ?, ?, ?, ?, ?)',
    [product.name, product.description, product.price, product.image, product.photo_path, product.category]
  );
  return { id: result.lastID, ...product };
}

export async function updateProduct(id, product) {
  if (!db) await initDb();
  await db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, image = ?, photo_path = ?, category = ? WHERE id = ?',
    [product.name, product.description, product.price, product.image, product.photo_path, product.category, id]
  );
  return { id, ...product };
}

export async function deleteProduct(id) {
  if (!db) await initDb();
  await db.run('DELETE FROM products WHERE id = ?', id);
  return true;
}