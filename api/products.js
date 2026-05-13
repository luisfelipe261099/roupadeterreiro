const mysql = require('mysql2/promise');

let pool;
let tableReady = false;

function getDbUrl() {
    return (process.env.DATABASE_URL || process.env.TIDB_DATABASE_URL || process.env.TIDB_URL || '').trim();
}

function buildPoolConfig(dbUrl) {
    const parsed = new URL(dbUrl);
    return {
        host: parsed.hostname,
        port: Number(parsed.port || 4000),
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace(/^\//, ''),
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
    };
}

function getPool() {
    if (!pool) {
        const dbUrl = getDbUrl();
        if (!dbUrl) {
            const err = new Error('DATABASE_URL nao configurada');
            err.code = 'DB_CONFIG_MISSING';
            throw err;
        }
        pool = mysql.createPool(buildPoolConfig(dbUrl));
    }
    return pool;
}

async function ensureTable() {
    if (tableReady) return;
    const conn = getPool();
    await conn.query(`
        CREATE TABLE IF NOT EXISTS products (
            id BIGINT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            tag VARCHAR(50) DEFAULT '',
            sizes JSON NOT NULL,
            description TEXT,
            images JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    tableReady = true;
}

function normalizeRows(rows) {
    return rows.map((r) => ({
        id: Number(r.id),
        name: r.name,
        price: Number(r.price),
        tag: r.tag || '',
        sizes: typeof r.sizes === 'string' ? JSON.parse(r.sizes) : (r.sizes || []),
        desc: r.description || '',
        images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || []),
    }));
}

function readBody(req) {
    if (!req.body) return {};
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch {
            return {};
        }
    }
    return req.body;
}

module.exports = async function handler(req, res) {
    try {
        if (!getDbUrl()) {
            return res.status(503).json({
                error: 'Banco de dados nao configurado',
                code: 'DB_CONFIG_MISSING',
                hint: 'Defina DATABASE_URL nas variaveis de ambiente da Vercel com a URL de conexao do TiDB.'
            });
        }

        await ensureTable();

        if (req.method === 'GET') {
            const [rows] = await getPool().query(
                'SELECT id, name, price, tag, sizes, description, images FROM products ORDER BY created_at DESC'
            );
            return res.status(200).json(normalizeRows(rows));
        }

        if (req.method === 'POST') {
            const body = readBody(req);
            const name = String(body.name || '').trim();
            const price = Number(body.price);
            const tag = String(body.tag || '');
            const desc = String(body.desc || '');
            const sizes = Array.isArray(body.sizes) ? body.sizes : [];
            const images = Array.isArray(body.images) ? body.images.slice(0, 3) : [];

            if (!name || !Number.isFinite(price)) {
                return res.status(400).json({ error: 'Nome e preco sao obrigatorios' });
            }
            if (!images.length) {
                return res.status(400).json({ error: 'Adicione pelo menos 1 imagem' });
            }

            const id = Date.now();
            await getPool().query(
                `INSERT INTO products (id, name, price, tag, sizes, description, images)
                 VALUES (?, ?, ?, ?, CAST(? AS JSON), ?, CAST(? AS JSON))`,
                [id, name, price, tag, JSON.stringify(sizes), desc, JSON.stringify(images)]
            );

            return res.status(201).json({ success: true, id });
        }

        if (req.method === 'DELETE') {
            const id = Number(req.query && req.query.id);
            if (!id) {
                return res.status(400).json({ error: 'ID invalido' });
            }

            await getPool().query('DELETE FROM products WHERE id = ?', [id]);
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Metodo nao permitido' });
    } catch (error) {
        const message = (error && error.message) ? error.message : 'Erro interno';
        const code = error && error.code ? error.code : 'INTERNAL_ERROR';
        const isConfigError = code === 'DB_CONFIG_MISSING';

        return res.status(isConfigError ? 503 : 500).json({
            error: isConfigError ? 'Banco de dados nao configurado' : message,
            code,
            hint: isConfigError
                ? 'Configure DATABASE_URL na Vercel usando as credenciais do TiDB Cloud.'
                : 'Verifique conectividade com o TiDB e tente novamente.'
        });
    }
};
