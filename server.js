const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Caminho do products.json dentro de dist
const PRODUCTS_FILE = path.join(__dirname, "dist", "data", "products.json");

// login simples
const ADMIN_USER = "admin";
const ADMIN_PASS = "brands123";

app.use(express.json());

// servir arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, "dist")));

// ====== UPLOAD DE IMAGEM (multer) ====== //
const uploadDir = path.join(__dirname, "dist", "img", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

// ====== FUNÇÕES AUXILIARES ====== //

function readProducts() {
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Erro ao ler products.json:", e);
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
}

// autenticação básica
function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.set("WWW-Authenticate", 'Basic realm="Admin Brands"');
    return res.status(401).send("Autenticação necessária");
  }

  const base64 = authHeader.split(" ")[1];
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  const parts = decoded.split(":");
  const user = parts[0];
  const pass = parts[1];

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return next();
  }

  res.set("WWW-Authenticate", 'Basic realm="Admin Brands"');
  return res.status(401).send("Login ou senha inválidos");
}

// ====== ROTAS PÚBLICAS ====== //

// lista produtos pro site
app.get("/api/products", function (req, res) {
  const products = readProducts();
  res.json(products);
});

// ====== ROTAS ADMIN (com basicAuth) ====== //

// testar login
app.get("/api/admin/ping", basicAuth, function (req, res) {
  res.json({ ok: true });
});

// upload de imagem
app.post("/api/upload", basicAuth, upload.single("image"), function (req, res) {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: "Nenhum arquivo recebido" });
  }

  const relativePath = "/img/uploads/" + req.file.filename;
  res.json({ ok: true, path: relativePath });
});

// cadastrar produto
app.post("/api/products", basicAuth, function (req, res) {
  const products = readProducts();
  const product = req.body;

  const newId = products.length ? products[products.length - 1].id + 1 : 1;
  product.id = newId;

  products.push(product);
  writeProducts(products);

  res.status(201).json({ ok: true, product: product });
});

// deletar produto
app.delete("/api/products/:id", basicAuth, function (req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ ok: false, message: "ID inválido" });
  }

  const products = readProducts();
  const index = products.findIndex(function (p) {
    return p.id === id;
  });

  if (index === -1) {
    return res.status(404).json({ ok: false, message: "Produto não encontrado" });
  }

  const removed = products.splice(index, 1)[0];
  writeProducts(products);

  res.json({ ok: true, removed: removed });
});

// subir servidor
app.listen(PORT, function () {
  console.log("Servidor rodando em http://localhost:" + PORT);
});
