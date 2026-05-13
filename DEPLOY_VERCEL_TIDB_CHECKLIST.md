# Checklist de Deploy - Vercel Gratis + TiDB Gratis

## 1. Projeto na Vercel

- Framework Preset: Other
- Root Directory: .
- Build Command: npm run build
- Output Directory: vazio
- Install Command: npm install
- Node.js Runtime: 20.x

## 2. Variaveis de Ambiente

Defina em Vercel (Project Settings > Environment Variables):

- DATABASE_URL = mysql://USER:PASSWORD@HOST:4000/DB_NAME?ssl=%7B%22rejectUnauthorized%22%3Atrue%7D

Variaveis alternativas aceitas pela API:

- TIDB_DATABASE_URL
- TIDB_URL

## 3. TiDB Cloud (Free Tier)

- Cluster ativo (nao pausado)
- Usuario/senha validos
- IP Allowlist inclui Vercel (ou 0.0.0.0/0 temporariamente para teste)
- Banco (schema) existe e corresponde ao nome na URL

## 4. Estrutura do Projeto

- API serverless: /api/products.js
- Healthcheck: /api/health.js
- Config Vercel: /vercel.json
- Nao depender de escrita local em disco em producao

## 5. Testes apos deploy

- GET /api/health deve retornar ok=true
- GET /api/products deve retornar lista (mesmo vazia)
- POST /api/products deve criar item
- DELETE /api/products?id=... deve remover item

## 6. Erros comuns

- Missing script build: faltava script build no package.json
- DATABASE_URL ausente: API retorna DB_CONFIG_MISSING
- Falha de conexao TiDB: revisar URL e allowlist
- Timeout de funcao: reduzir operacoes pesadas e verificar latencia
