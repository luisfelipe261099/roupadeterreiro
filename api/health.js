const mysql = require('mysql2/promise');

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
        connectionLimit: 2,
        queueLimit: 0,
    };
}

module.exports = async function health(req, res) {
    const dbUrl = getDbUrl();

    if (!dbUrl) {
        return res.status(503).json({
            ok: false,
            service: 'api',
            dbConfigured: false,
            dbConnected: false,
            code: 'DB_CONFIG_MISSING',
            hint: 'Defina DATABASE_URL na Vercel com a conexao do TiDB Cloud.'
        });
    }

    let pool;
    try {
        pool = mysql.createPool(buildPoolConfig(dbUrl));
        await pool.query('SELECT 1');

        return res.status(200).json({
            ok: true,
            service: 'api',
            dbConfigured: true,
            dbConnected: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(503).json({
            ok: false,
            service: 'api',
            dbConfigured: true,
            dbConnected: false,
            code: error && error.code ? error.code : 'DB_CONNECTION_ERROR',
            error: 'Falha de conexao com TiDB',
            hint: 'Revise DATABASE_URL, IP allowlist do TiDB Cloud e status do cluster.'
        });
    } finally {
        if (pool) {
            await pool.end();
        }
    }
};
