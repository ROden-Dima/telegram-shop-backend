// database.js - работа с базой данных SQLite

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Открываем соединение с базой данных
export async function openDb() {
  return open({
    filename: './shop.db',      // файл базы данных
    driver: sqlite3.Database
  });
}

// Создаём таблицы (если их нет)
export async function initDb() {
  const db = await openDb();
  
  // Таблица товаров
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
  
  console.log('✅ База данных инициализирована');
  return db;
}

// Получить все товары
export async function getAllProducts() {
  const db = await openDb();
  return await db.all('SELECT * FROM products ORDER BY id');
}

// Получить товар по ID
export async function getProductById(id) {
  const db = await openDb();
  return await db.get('SELECT * FROM products WHERE id = ?', id);
}

// Создать товар
export async function createProduct(product) {
  const db = await openDb();
  const result = await db.run(
    'INSERT INTO products (name, description, price, image, photo_path, category) VALUES (?, ?, ?, ?, ?, ?)',
    [product.name, product.description, product.price, product.image, product.photo_path, product.category]
  );
  return { id: result.lastID, ...product };
}

// Обновить товар
export async function updateProduct(id, product) {
  const db = await openDb();
  await db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, image = ?, photo_path = ?, category = ? WHERE id = ?',
    [product.name, product.description, product.price, product.image, product.photo_path, product.category, id]
  );
  return { id, ...product };
}

// Удалить товар
export async function deleteProduct(id) {
  const db = await openDb();
  await db.run('DELETE FROM products WHERE id = ?', id);
  return true;
}