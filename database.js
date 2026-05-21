// database.js - работа с базой данных SQLite (better-sqlite3)
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Подключаемся к базе данных (файл shop.db в папке проекта)
const db = new Database(path.join(__dirname, 'shop.db'));

// Создаём таблицу товаров (если её нет)
db.exec(`
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

// Получить все товары
export function getAllProducts() {
  return db.prepare('SELECT * FROM products ORDER BY id').all();
}

// Получить товар по ID
export function getProductById(id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

// Создать товар
export function createProduct(product) {
  const stmt = db.prepare(
    'INSERT INTO products (name, description, price, image, photo_path, category) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(product.name, product.description, product.price, product.image, product.photo_path, product.category);
  return { id: result.lastInsertRowid, ...product };
}

// Обновить товар
export function updateProduct(id, product) {
  const stmt = db.prepare(
    'UPDATE products SET name = ?, description = ?, price = ?, image = ?, photo_path = ?, category = ? WHERE id = ?'
  );
  stmt.run(product.name, product.description, product.price, product.image, product.photo_path, product.category, id);
  return { id, ...product };
}

// Удалить товар
export function deleteProduct(id) {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run(id);
  return true;
}

export { db };