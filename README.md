# HUB Links

Central privada de links de trabalho — organize ferramentas, IAs, docs e qualquer link num hub rápido e bonito.

## Stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Postgres, Realtime, Edge Functions)
- Stripe (pagamentos e assinaturas)

## Desenvolvimento local

```sh
# 1. Clone o repositório
git clone https://github.com/GBarcelos13/Hub-Links---FTK-Solutions.git
cd Hub-Links---FTK-Solutions

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Preencha os valores no .env

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

## Variáveis de ambiente

Consulte `.env.example` para a lista completa de variáveis necessárias.

## Extensão do navegador

A pasta `browser-extension/` contém uma extensão Chrome/Edge para salvar links com 1 clique.

**Instalar em modo desenvolvedor:**
1. Abra `chrome://extensions`
2. Ative o **Modo desenvolvedor**
3. Clique em **Carregar sem compactação**
4. Selecione a pasta `browser-extension/`
