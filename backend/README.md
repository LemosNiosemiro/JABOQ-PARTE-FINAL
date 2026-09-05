# Backend de Licenças - JABOQUE

## 🔒 Segurança: Controle de Licenças Apenas para Admin

Este backend implementa um sistema seguro onde **apenas você (programador/admin)** pode:
- Renovar licenças de clientes
- Bloquear licenças  
- Atualizar status de faturas
- Consultar licenças ativas, pagamentos e datas de expiração

Os clientes **NÃO têm acesso** a estes endpoints.

---

## 🚀 Como Executar

```bash
cd backend
npm install
npm run dev
```

O backend estará disponível em `http://localhost:4000`

Na aplicação, o link **Programador** no rodapé abre `/programador`. Essa área pede a
`PROGRAMMER_KEY` e permite consultar e renovar a licença da plataforma e as licenças
institucionais.

---

## 📋 Endpoints Públicos (Cliente pode ler)

### 1. Health Check
```bash
curl http://localhost:4000/api/health
```

**Resposta:**
```json
{
  "ok": true,
  "service": "jaboque-backend",
  "timestamp": "2026-09-02T...",
  "environment": "development"
}
```

### 2. Obter Status da Licença
```bash
curl http://localhost:4000/api/license
```

**Resposta:**
```json
{
  "ok": true,
  "license": {
    "status": "active",
    "plan": "growth",
    "companyName": "JABOQUE Festas",
    "expiresAt": "2030-12-31T00:00:00.000Z",
    "isBlocked": false,
    "isExpired": false,
    ...
  }
}
```

### 3. Obter Resumo Financeiro
```bash
curl http://localhost:4000/api/financial
```

### 4. Obter Permissões por Perfil
```bash
curl http://localhost:4000/api/permissions/admin
curl http://localhost:4000/api/permissions/company
curl http://localhost:4000/api/permissions/client
```

### 5. Obter Tarefas Operacionais
```bash
curl http://localhost:4000/api/operations
```

---

## 🔐 Endpoints Admin-Only (REQUER CHAVE SECRETA)

Para usar estes endpoints, você **deve** enviar a chave de admin no header:

```

### Área privada do programador

Use a chave definida em `PROGRAMMER_KEY` no cabeçalho `Authorization: Bearer ...`:

```bash
curl http://localhost:4000/api/programmer/licenses \
  -H "Authorization: Bearer sua-programmer-key"

curl -X POST http://localhost:4000/api/programmer/license/renew \
  -H "Authorization: Bearer sua-programmer-key" \
  -H "Content-Type: application/json" \
  -d '{"plan":"growth","days":365}'
```

O painel administrativo mostra um aviso quando faltam 30 dias ou menos, quando o
pagamento está pendente ou quando a licença foi encerrada.
Authorization: Bearer sua-chave-admin-secreta
```

### 1. Renovar Licença (APENAS VOCÊ)
```bash
curl -X POST http://localhost:4000/api/license/renew \
  -H "Authorization: Bearer seu-admin-key" \
  -H "Content-Type: application/json" \
  -d '{"plan": "growth", "days": 365}'
```

**Resposta:**
```json
{
  "ok": true,
  "message": "Licença renovada com sucesso pelo administrador",
  "license": {
    "status": "active",
    "expiresAt": "2027-09-02T..."
  }
}
```

### 2. Bloquear Licença (se cliente não pagar)
```bash
curl -X PATCH http://localhost:4000/api/license/block \
  -H "Authorization: Bearer seu-admin-key" \
  -H "Content-Type: application/json"
```

### 3. Atualizar Status de Fatura (APENAS VOCÊ)
```bash
curl -X PATCH http://localhost:4000/api/invoices/inv-001/status \
  -H "Authorization: Bearer seu-admin-key" \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'
```

---

## 🛡️ Segurança

### Chave de Admin
- Definida em `.env` como `ADMIN_KEY`
- **Nunca exponha** esta chave no frontend ou em repositórios públicos
- Use variáveis de ambiente em produção

### Em Desenvolvimento
```
ADMIN_KEY=seu-chave-admin-secreta-aqui-mude-em-producao
```

### Em Produção
```
ADMIN_KEY=<gere-uma-chave-longa-e-aleatória-forte>
```

### Chave do programador

```env
PROGRAMMER_KEY=<gere-uma-chave-longa-e-aleatória-forte-e-diferente>
```

Essa chave nunca deve ser colocada no código frontend nem partilhada com clientes.

---

## ❌ Se Não Tiver Chave de Admin

Se um cliente tentar renovar licença sem a chave:

```bash
curl -X POST http://localhost:4000/api/license/renew \
  -H "Content-Type: application/json" \
  -d '{"plan": "growth"}'
```

**Erro (401 Unauthorized):**
```json
{
  "ok": false,
  "error": "UNAUTHORIZED",
  "message": "Chave de administrador inválida ou ausente"
}
```

---

## 🔄 Fluxo de Pagamento Sugerido

1. **Cliente solicita renovação** → Frontend mostra formulário (UI apenas, sem Submit funcional)
2. **Você (admin) recebe solicitação** → Backend
3. **Você renova com chave admin** → POST `/api/license/renew`
4. **Cliente vê nova licença ativa** → Frontend lê GET `/api/license`

---

## 📝 Próximos Passos

- [ ] Implementar autenticação real (JWT, sessions)
- [ ] Conectar licenças e faturas a uma base de dados para persistência (o estado atual do backend reinicia em memória)
- [ ] Implementar sistema de pagamento (Stripe, Paypal)
- [ ] Logs de auditoria para renovações
- [ ] Webhooks para eventos de licença
- [ ] Notificações por email

---

## 🆘 Troubleshooting

### Backend não arranca
```bash
npm install
npm run build
npm run start
```

### Erro "Cannot find module express"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Porta 4000 já está em uso
```bash
# Altere em .env
PORT=4001
```

---

**Desenvolvido por:** você  
**Data:** 2026-09-02  
**Segurança:** Admin-only licensing control
