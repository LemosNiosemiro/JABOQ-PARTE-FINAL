# 🔒 SISTEMA DE LICENÇAS SEGURO - JABOQUE

## Situação
Você implementou um modelo de negócio onde **você (programador)** é o único que pode controlar as licenças dos seus clientes. Se um cliente não pagar, a licença dele termina. A renovação só pode ser feita por você através do backend com uma chave secreta.

---

## ✅ Solução Implementada

### 1️⃣ Backend Seguro com Autenticação Admin
**Arquivo:** `backend/src/server.ts`

O backend agora possui dois tipos de endpoints:

#### 📖 Públicos (clientes podem ler):
- `GET /api/health` — Status do servidor
- `GET /api/license` — Ver se sua licença está ativa/expirada  
- `GET /api/financial` — Ver resumo financeiro
- `GET /api/permissions/:role` — Ver permissões
- `GET /api/operations` — Ver tarefas operacionais

**Resposta quando licença está expirada:**
```json
{
  "license": {
    "status": "active",
    "isExpired": false,
    "isBlocked": false
  }
}
```

#### 🔐 Admin-Only (requerem sua chave secreta):
- `POST /api/license/renew` — Renovar licença
- `PATCH /api/license/block` — Bloquear licença
- `PATCH /api/invoices/:id/status` — Atualizar fatura

**Exemplo: Renovar licença de cliente**
```bash
curl -X POST http://localhost:4000/api/license/renew \
  -H "Authorization: Bearer sua-chave-admin-secreta" \
  -H "Content-Type: application/json" \
  -d '{"plan": "growth", "days": 365}'
```

---

### 2️⃣ Frontend Protegido
**Arquivo:** `src/pages/dashboard/admin/license.tsx`

- ❌ **Removido** botão "Renovar licença" que qualquer cliente podia apertar
- ✅ **Adicionado** aviso: *"A renovação de licença deve ser feita apenas pelo programador/administrador através do backend"*
- ✅ Clientes agora veem mensagem para "contactar suporte"

**Antes:**
```
[Renovar licença] [Ver histórico]  ← Cliente podia clicar (PERIGOSO!)
```

**Depois:**
```
🔒 Renovação Segura
   A renovação de licença deve ser feita apenas pelo programador/administrador 
   através do backend com chave secreta. Contacte o suporte para solicitar renovação.
```

---

### 3️⃣ Middleware de Autenticação
**Como funciona:**

1. Cliente tenta renovar ligando para `/api/license/renew` **SEM** header `Authorization`
2. Backend responde com **401 Unauthorized**:
```json
{
  "ok": false,
  "error": "UNAUTHORIZED",
  "message": "Chave de administrador inválida ou ausente"
}
```

3. Você (admin) chama com a chave secreta:
```bash
Authorization: Bearer jaboque-admin-secret-key-change-me
```

4. Backend autentica e renova a licença ✅

---

## 🚀 Como Usar

### Iniciar o Backend
```bash
cd backend
npm run dev
```

**Saída esperada:**
```
✅ JABOQUE Backend rodando em http://localhost:4000
📝 Chave admin: jaboque-admin-secret-key-change-me
🔒 Use header 'Authorization: Bearer <chave>' para endpoints admin
```

### Mudar a Chave Admin (IMPORTANTE!)
**Arquivo:** `backend/.env`
```
PORT=4000
NODE_ENV=development
ADMIN_KEY=sua-chave-longa-e-segura-aqui
```

**Em produção, use uma chave forte:**
```
ADMIN_KEY=nUfAa3jK9$mL#qR@tV2xYzWpBlCdEfGhIjKlMnOpQrStUvWxYz
```

---

## 📋 Fluxo de Pagamento Recomendado

```
1. CLIENTE SOLICITA RENOVAÇÃO
   ↓
   Frontend mostra: "Contacte o suporte"
   
2. CLIENTE PAGA
   ↓ (você recebe pagamento)
   
3. VOCÊ RENOVA NO BACKEND
   ↓
   curl -X POST http://localhost:4000/api/license/renew \
     -H "Authorization: Bearer <sua-chave>" \
     -d '{"plan": "growth", "days": 365}'
   
4. CLIENTE VÊ LICENÇA RENOVADA
   ↓
   Frontend lê GET /api/license → isExpired: false
```

---

## 🛡️ Segurança Implementada

| Recurso | Status |
|---------|--------|
| Clientes podem ler status da licença | ✅ Permitido |
| Clientes podem renovar sem chave | ❌ Bloqueado |
| Você pode renovar com chave | ✅ Permitido |
| Backend valida chave | ✅ Middleware |
| Chave armazenada em .env (segura) | ✅ Sim |
| Botão de renovação no frontend | ❌ Removido |

---

## ⚠️ Se Cliente Tentar Burlar

**Cliente tenta:**
```bash
curl -X POST http://localhost:4000/api/license/renew \
  -d '{"plan": "enterprise", "days": 1000}'
  # Sem Authorization header!
```

**Resposta do backend:**
```json
{
  "ok": false,
  "error": "UNAUTHORIZED",
  "message": "Chave de administrador inválida ou ausente"
}
```

Cliente não consegue renovar. Ponto.

---

## 🔧 Próximas Melhorias

- [ ] Conectar a base de dados para persistência
- [ ] Sistema de pagamento (Stripe, PayPal)
- [ ] Webhooks para eventos de licença
- [ ] Notificações por email quando licença expira
- [ ] Painel de admin para gerenciar clientes
- [ ] Logs de auditoria de todas as renovações

---

## 📞 FAQ

**P: E se eu perder a chave admin?**  
R: Está em `backend/.env`. Se perder, mude para uma nova e reinicie o backend.

**P: Posso dar a chave a alguém de confiança?**  
R: Sim, mas cuidado. Qualquer um com a chave pode renovar/bloquear licenças.

**P: O cliente pode descobrir a chave?**  
R: Não, porque:
1. Está em `.env` no backend (não no frontend)
2. Cliente só vê endpoints públicos
3. Chave nunca é enviada ao cliente

**P: Posso bloquear uma licença manualmente?**  
R: Sim! `PATCH /api/license/block` com a chave.

---

## 📝 Status

| Componente | Status |
|-----------|--------|
| Backend (server.ts) | ✅ Compilado e rodando |
| Middleware de auth | ✅ Implementado |
| Frontend (license.tsx) | ✅ Modificado |
| Botão de renovação | ✅ Removido |
| Documentação | ✅ Completa |

---

**Desenvolvido:** 2026-09-02  
**Modelo:** Admin-only license control  
**Segurança:** Autenticação com chave secreta
