import express from 'express';
import cors from 'cors';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Получить все товары
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Запуск сервера
function startServer() {
  app.listen(PORT, () => {
    console.log(`✅ Server on http://localhost:${PORT}`);
  });
}

startServer();