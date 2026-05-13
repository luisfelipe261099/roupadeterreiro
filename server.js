const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));
app.use(express.static('public'));

// Criar diretórios se não existirem
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// Arquivo de produtos
const productsFile = path.join(__dirname, 'products.json');

// GET - Buscar todos os produtos
app.get('/api/products', (req, res) => {
    try {
        if (fs.existsSync(productsFile)) {
            const data = fs.readFileSync(productsFile, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// POST - Adicionar novo produto
app.post('/api/products', (req, res) => {
    try {
        const { name, price, tag, sizes, desc, images } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Nome e preco sao obrigatorios' });
        }

        const safeImages = Array.isArray(images) ? images.slice(0, 3) : [];
        if (!safeImages.length) {
            return res.status(400).json({ error: 'Adicione pelo menos uma imagem' });
        }
        
        const newProduct = {
            id: Date.now(),
            name,
            price: parseFloat(price),
            images: safeImages,
            tag,
            sizes: Array.isArray(sizes) ? sizes : [],
            desc
        };

        // Ler produtos existentes
        let products = [];
        if (fs.existsSync(productsFile)) {
            const data = fs.readFileSync(productsFile, 'utf8');
            products = JSON.parse(data);
        }

        // Adicionar novo produto
        products.push(newProduct);

        // Salvar no arquivo
        fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

        res.json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao salvar produto', details: err.message });
    }
});

// DELETE - Remover produto
app.delete('/api/products', (req, res) => {
    try {
        const id = Number(req.query.id);
        if (!id) {
            return res.status(400).json({ error: 'ID invalido' });
        }
        let products = [];
        
        if (fs.existsSync(productsFile)) {
            const data = fs.readFileSync(productsFile, 'utf8');
            products = JSON.parse(data);
        }

        // Remover produto da lista
        products = products.filter(p => Number(p.id) !== id);

        fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📁 Imagens salvas em: ${uploadDir}`);
});
