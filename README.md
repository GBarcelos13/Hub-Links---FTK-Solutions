# 🔗 Hub Links — FTK Solutions

Hub de links personalizado com **autenticação, painel administrativo e integração com Stripe** — desenvolvido para a FTK Solutions como alternativa ao Linktree com controle total dos dados.

🌐 **Demo ao vivo:** [hub-links-ftk-solutions.vercel.app](https://hub-links-ftk-solutions.vercel.app)

## Funcionalidades

- **Hub público** de links personalizados
- **Painel admin** protegido por autenticação
- **Gerenciamento de links** com drag-and-drop
- **Integração Stripe** para funcionalidades premium
- **Deploy automático** na Vercel

## Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=flat-square&logo=stripe&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

## Estrutura

```
src/
├── pages/          # Auth, Dashboard, Admin
├── components/     # UI components e rotas protegidas
├── contexts/       # Auth e Links context
├── hooks/          # Custom hooks para data fetching
└── integrations/
    └── supabase/   # Client e types gerados
supabase/
├── functions/      # Edge functions (Stripe checkout, webhook, portal)
└── migrations/     # Schema versionado
```

## Como Rodar Localmente

```bash
# 1. Clone e instale dependências
git clone https://github.com/GBarcelos13/Hub-Links---FTK-Solutions.git
cd Hub-Links---FTK-Solutions
npm install

# 2. Configure variáveis de ambiente
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY

# 3. Rode em desenvolvimento
npm run dev
```

---

Desenvolvido por [Gabriel Barcelos](https://www.linkedin.com/in/gabriel-barcelos-voip/) · [MUG Solutions](https://github.com/GBarcelos13)
