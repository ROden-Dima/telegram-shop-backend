import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { initDb, getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ========== НАСТРОЙКА ЗАГРУЗКИ ФАЙЛОВ ==========
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('📁 Папка uploads создана');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));

// ========== НАСТРОЙКИ УВЕДОМЛЕНИЙ ==========
// ⚠️ ЗАМЕНИТЕ НА СВОИ ДАННЫЕ
const BOT_TOKEN = '8724530279:AAHnfsUApQ7K9zbiPhgK0qw7KaA-LKnxHxg';   // Токен от @BotFather
const CHAT_ID = '967598901';    // Ваш ID от @userinfobot

// ========== API ЭНДПОИНТЫ ==========

// Загрузка фото
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Файл не загружен' });
    }
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Получить все товары (из БД)
app.get('/api/products', async (req, res) => {
  const products = await getAllProducts();
  res.json({ success: true, products, totalRows: products.length });
});

// Получить товар по ID
app.get('/api/products/:id', async (req, res) => {
  const product = await getProductById(parseInt(req.params.id));
  if (product) {
    res.json({ success: true, product });
  } else {
    res.status(404).json({ success: false, message: 'Товар не найден' });
  }
});

// Создать товар
app.post('/api/products', async (req, res) => {
  const { product_name, description, price, photos, category_ids } = req.body;
  const imageUrl = photos && photos.length > 0 ? photos[0] : '';
  const category = category_ids && category_ids.length > 0 ? category_ids[0] : 'other';
  
  const newProduct = await createProduct({
    name: product_name,
    description,
    price,
    image: imageUrl,
    photo_path: imageUrl,
    category: category.toString()
  });
  
  res.json({ success: true, message: 'Товар создан', product: newProduct });
});

// Обновить товар
app.put('/api/products/:id', async (req, res) => {
  const { product_name, description, price, photos, category_ids } = req.body;
  const imageUrl = photos && photos.length > 0 ? photos[0] : '';
  const category = category_ids && category_ids.length > 0 ? category_ids[0] : 'other';
  
  const updated = await updateProduct(parseInt(req.params.id), {
    name: product_name,
    description,
    price,
    image: imageUrl,
    photo_path: imageUrl,
    category: category.toString()
  });
  
  res.json({ success: true, message: 'Товар обновлён', product: updated });
});

// Удалить товар
app.delete('/api/products/:id', async (req, res) => {
  await deleteProduct(parseInt(req.params.id));
  res.json({ success: true, message: 'Товар удалён' });
});

// Категории
app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: [
    { id: 1, name: "Макароны", slug: "pasta" },
    { id: 2, name: "Свинина", slug: "pork" },
    { id: 3, name: "Бройлер", slug: "chicken" }
  ]});
});

app.get('/api/main_slider', (req, res) => {
  res.json({ success: true, data: [] });
});

// Заказ с уведомлением
app.post('/api/orders', async (req, res) => {
  const order = req.body;
  console.log('📦 Новый заказ:', order);
  
  const message = `
🛒 *НОВЫЙ ЗАКАЗ!*

👤 *Клиент:* ${order.customer?.name || 'Не указан'}
📞 *Телефон:* ${order.customer?.phone || 'Не указан'}
📍 *Адрес:* ${order.customer?.address || 'Не указан'}

📦 *Товары:*
${order.items?.map(item => `  • ${item.name} — ${item.quantity} шт. x ${item.price} ₽ = ${item.quantity * item.price} ₽`).join('\n') || 'Нет товаров'}

💰 *Итого:* ${order.totalPrice} ₽
📅 *Дата:* ${new Date().toLocaleString()}
  `;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' })
    });
    console.log('✅ Уведомление отправлено');
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления:', error.message);
  }

  res.json({ success: true, message: 'Заказ принят' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Запуск сервера
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`✅ Server on http://localhost:${PORT}`);
  });
}

startServer();