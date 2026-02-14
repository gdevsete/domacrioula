# 🔥 Doma Crioula - E-commerce de Produtos para Churrasco

Site catálogo e e-commerce da **Doma Crioula**, especializada em caixas térmicas, facas personalizadas e acessórios para churrasco desde 2012.

## 🚀 Tecnologias

- **Frontend**: React 19 + Vite 7
- **Pagamentos**: PodPay (PIX)
- **Backend**: Vercel Serverless Functions
- **Deploy**: Vercel (grátis)
- **Estilização**: CSS puro (sem frameworks)

## 📦 Funcionalidades

- ✅ Catálogo de produtos responsivo
- ✅ Carrinho de compras com persistência
- ✅ **Desconto automático**: 20% em 3+ caixas térmicas
- ✅ Checkout PIX com QR Code
- ✅ Verificação automática de pagamento
- ✅ Integração WhatsApp para cotações
- ✅ SEO otimizado

## 🏗️ Estrutura do Projeto

```
doma-crioula/
├── api/                      # Vercel Serverless Functions
│   └── podpay/
│       ├── create-transaction.js
│       └── get-transaction.js
├── public/
│   └── images/               # Imagens dos produtos
├── src/
│   ├── components/           # Componentes React
│   ├── contexts/             # Context API (Cart, Checkout)
│   ├── pages/                # Páginas do site
│   └── services/             # Serviços (PodPay API client)
├── vercel.json               # Configuração Vercel
├── vite.config.js            # Configuração Vite
└── package.json
```

## 🔧 Configuração Local

### 1. Clone e instale dependências

```bash
git clone <repo>
cd doma-crioula
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha o arquivo `.env.local`:

```env
PODPAY_SECRET_KEY=sk_sua_chave_secreta
```

### 3. Instale Vercel CLI (opcional, para dev local com serverless)

```bash
npm i -g vercel
vercel login
```

### 4. Execute o projeto

**Com Serverless Functions (recomendado):**
```bash
npm run dev
```

**Apenas frontend (sem pagamentos):**
```bash
npm run dev:vite
```

## 🌐 Deploy na Vercel (Grátis)

### 1. Conecte o repositório

1. Acesse [vercel.com](https://vercel.com)
2. Importe o repositório do GitHub
3. Framework preset: **Vite**

### 2. Configure variáveis de ambiente

No painel da Vercel, vá em **Settings > Environment Variables** e adicione:

| Nome | Valor |
|------|-------|
| `PODPAY_SECRET_KEY` | `sk_sua_chave_secreta` |

### 3. Deploy automático

Cada push para `main` fará deploy automático.

## 💳 Integração PodPay

### Endpoints da API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/podpay/create-transaction` | POST | Cria transação PIX |
| `/api/podpay/get-transaction` | GET | Consulta status do pagamento |

### Exemplo de requisição

```javascript
const response = await fetch('/api/podpay/create-transaction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 22999, // R$ 229,99 em centavos
    customer: { email: 'cliente@email.com', name: 'João' },
    items: [{ title: 'Caixa Térmica 30L', unitPrice: 22999, quantity: 1 }]
  })
})
```

## 🎨 Padrões de Responsividade

O projeto utiliza breakpoints consistentes:

| Breakpoint | Dispositivo |
|------------|-------------|
| `968px` | Tablet Landscape |
| `768px` | Tablet |
| `640px` | Mobile Landscape |
| `480px` | Mobile |
| `380px` | Mobile Pequeno |

## 🛒 Sistema de Desconto

Ao adicionar **3 ou mais caixas térmicas** ao carrinho, um desconto de **20%** é aplicado automaticamente no subtotal das caixas.

```javascript
// Lógica no CartContext.jsx
const hasDiscount = totalCaixas >= 3
const discountAmount = hasDiscount ? Math.round(subtotalCaixas * 0.20) : 0
```

## 📞 Contato

- **WhatsApp**: (51) 99813-7009
- **Email**: contato@domacriola.com.br
- **Local**: Sapiranga, RS

---

Desenvolvido com ❤️ por Doma Crioula LTDA
