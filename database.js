import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'shop.db');

// Открываем базу данных (создаётся автоматически)
const db = new sqlite3.Database(dbPath);
db.run(`PRAGMA foreign_keys = ON;`);

// Инициализация таблиц
db.serialize(() => {
  db.run(`
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
});

console.log('✅ База данных инициализирована');

// Обёртки для удобного использования (Promise)
export function getAllProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products ORDER BY id', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function getProductById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function createProduct(product) {
  return new Promise((resolve, reject) => {
    const { name, description, price, image, photo_path, category } = product;
    db.run(
      'INSERT INTO products (name, description, price, image, photo_path, category) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, image, photo_path, category],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...product });
      }
    );
  });
}

export function updateProduct(id, product) {
  return new Promise((resolve, reject) => {
    const { name, description, price, image, photo_path, category } = product;
    db.run(
      'UPDATE products SET name = ?, description = ?, price = ?, image = ?, photo_path = ?, category = ? WHERE id = ?',
      [name, description, price, image, photo_path, category, id],
      function(err) {
        if (err) reject(err);
        else resolve({ id, ...product });
      }
    );
  });
}

export function deleteProduct(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve(true);
    });
  });
}