# Landing Page - Atelier Roupas de Terreiro

## Como usar
- Abra o arquivo `index.html` no navegador.
- A pagina foi refeita em modelo mobile-first (foco em celular).
- O visual esta mais limpo, com menos informacao por bloco.

## Arquivos de imagem
Arquivos visuais ja incluidos no projeto:

- `logo.svg` (logo principal)
- `hero-vestido.svg` (imagem de destaque da capa)
- `sob-medida.svg` (imagem da secao sob medida)
- `catalogo.svg` (imagem da secao catalogo)

Se quiser trocar por fotos reais, mantenha os mesmos nomes e substitua os arquivos em `assets/images/`.

## SEO local ja implementado
- Meta tags para Google e redes sociais (Open Graph/Twitter).
- Dados estruturados `LocalBusiness` com area de atendimento em Curitiba/PR.
- Canonical configurado para `https://www.roupasdeterreiro.com.br/`.

## Personalizacoes rapidas
- WhatsApp: alterar links `wa.me` em `index.html`.
- Textos: editar direto no `index.html`.
- Cores: ajustar variaveis CSS em `style.css` na secao `:root`.
- Logo: se tiver uma versao final em PNG/JPG, substitua o arquivo `logo.svg`.

## Publicacao no dominio proprio (passo a passo)
1. Compre o dominio `roupasdeterreiro.com.br` no Registro.br.
2. Hospede os arquivos em um provedor estatico (Hostinger, Netlify, Vercel ou similar).
3. Publique o conteudo desta pasta na raiz do site.
4. No painel DNS do dominio, configure:
	- `www` apontando para o host da hospedagem (CNAME ou A, conforme o provedor).
	- raiz (`@`) apontando para o destino indicado pela hospedagem.
5. Ative SSL/HTTPS no provedor.
6. Depois que o dominio estiver ativo, valide:
	- `https://www.roupasdeterreiro.com.br`
	- botao do WhatsApp funcionando
	- imagens carregando

## Proximo ajuste recomendado
- Quando o e-mail comercial estiver pronto, substitua `roupasdeterreiro@gmail.com` no JSON-LD dentro de `index.html`.
