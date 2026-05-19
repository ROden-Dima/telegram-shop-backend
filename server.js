// Подключаем необходимые библиотеки
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();

// Порт берётся из переменной окружения (Render задаёт сам)
// Для локальной разработки используется порт 3001
const PORT = process.env.PORT || 3001;

// Разрешаем запросы с любых адресов (нужно для работы с разных доменов)
app.use(cors());
app.use(express.json());

// ========== НАСТРОЙКА ЗАГРУЗКИ ФАЙЛОВ ==========

// Создаём папку для фото (если её нет)
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('📁 Папка uploads создана');
}

// Настройка хранения загруженных файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Уникальное имя = время_оригинальное_имя
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});

// Разрешённые типы файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: fileFilter
});

// Раздаём папку с фото как статические файлы
app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));

// ========== ДАННЫЕ (ТОВАРЫ) ==========

// В продакшене нужно будет подключить базу данных
// Пока используем массив (при перезапуске данные сбрасываются)
const products = [
  { id: 1, name: "Макароны", description: "500г", price: 120, image: "", photo_path: "", category: "pasta" },
  { id: 2, name: "Спагетти", description: "450г", price: 150, image: "", photo_path: "", category: "pasta" },
  { id: 3, name: "Лапша", description: "400г", price: 180, image: "", photo_path: "", category: "pasta" },
  { id: 4, name: "Свинина вырезка", description: "1кг", price: 450, image: "", photo_path: "", category: "pork" },
  { id: 5, name: "Свинина лопатка", description: "1кг", price: 420, image: "", photo_path: "", category: "pork" },
  { id: 6, name: "Грудинка", description: "1кг", price: 480, image: "", photo_path: "", category: "pork" }
];

// ========== API ЭНДПОИНТЫ ==========

// Загрузка фото
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Файл не загружен' });
    }
    // Формируем полный URL для доступа к фото
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl: imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Получить все товары
app.get('/api/products', (req, res) => {
  res.json({ success: true, products: products, totalRows: products.length });
});

// Создать новый товар
app.post('/api/products', (req, res) => {
  const { product_name, description, price, photos } = req.body;
  
  const newId = products.length + 1;
  const imageUrl = photos && photos.length > 0 ? photos[0] : "";
  
  const newProduct = {
    id: newId,
    name: product_name,
    description: description,
    price: price,
    image: imageUrl,
    photo_path: imageUrl,
    category: "other"
  };
  
  products.push(newProduct);
  res.json({ success: true, message: 'Товар создан', product: newProduct });
});

// Удалить товар
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  
  if (index !== -1) {
    products.splice(index, 1);
    res.json({ success: true, message: 'Товар удалён' });
  } else {
    res.status(404).json({ success: false, message: 'Товар не найден' });
  }
});

// Получить категории
app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: [
    { id: 1, name: "Макароны", slug: "pasta" },
    { id: 2, name: "Свинина", slug: "pork" },
    { id: 3, name: "Бройлер", slug: "chicken" }
  ]});
});

// Слайдер (пока пустой)
app.get('/api/main_slider', (req, res) => {
  res.json({ success: true, data: [] });
});

// Приём заказов
app.post('/api/orders', (req, res) => {
  console.log('Заказ:', req.body);
  res.json({ success: true, message: 'Заказ принят' });
});

// Проверка работоспособности
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Server on https://your-render-app.onrender.com`);
  console.log(`📁 Загруженные изображения сохраняются в папку: ${uploadDir}`);
});