# Arquitetura prática do JABOQUE

## Visão geral

A arquitetura atual do projeto já está em uma boa base para evoluir do MVP para um sistema funcional e escalável. O objetivo é manter a experiência do usuário do front em pleno funcionamento enquanto organizamos o domínio por features e deixamos o módulo de licença e faturação como parte central da operação.

## Estrutura recomendada

```text
src/
├── app/
│   ├── config/
│   ├── providers/
│   └── router/
├── core/
│   ├── auth/
│   ├── errors/
│   ├── license/
│   ├── permissions/
│   ├── types/
│   └── validation/
├── features/
│   ├── auth/
│   ├── users/
│   ├── companies/
│   ├── services/
│   ├── products/
│   ├── packages/
│   ├── events/
│   ├── bookings/
│   ├── orders/
│   ├── payments/
│   ├── licensing/
│   ├── billing/
│   ├── logistics/
│   ├── reviews/
│   ├── messages/
│   ├── favorites/
│   ├── reports/
│   └── dashboard/
├── components/
│   ├── layout/
│   ├── shared/
│   └── ui/
├── pages/
│   ├── public/
│   ├── client/
│   ├── company/
│   └── admin/
├── infrastructure/
│   ├── api/
│   ├── storage/
│   └── supabase/
├── lib/
│   ├── constants/
│   └── utils/
└── styles/
```

## Módulos reais do projeto hoje

O sistema já tem a base funcional para estes módulos:

- Auth e perfil
- Empresas
- Categorias
- Serviços e pacotes
- Eventos e reservas
- Clientes e favoritos
- Mensagens
- Relatórios
- Painel administrativo
- Painel da empresa
- Painel do cliente

## Módulos que faltam para sair do MVP

Esses módulos devem entrar na próxima camada para deixar o negócio mais sério:

1. Licensing
   - estado da licença
   - expiração
   - bloqueio do admin
   - plano e seats
   - cronograma de renovação

2. Billing / faturação
   - facturas
   - status de pagamento
   - histórico financeiro
   - módulos incluídos por plano

3. Payments
   - integração com pagamento
   - status financeiro por evento ou pedido
   - cobrança recorrente

4. Logistics
   - gestão de entrega
   - logística e rastreio
   - envio de documentos e materiais

5. Operations
   - agenda operacional
   - tarefas e follow-up
   - gestão de equipe e disponibilidade

6. Roles e permissions
   - permissões explícitas por papel
   - gating por licença e por empresa

7. Audit e compliance
   - registro de ações administrativas
   - histórico de mudanças sensíveis

## Regra de negócio da licença

A licença deve funcionar em duas camadas:

- Frontend: apresentar status, avisar e bloquear UX do admin
- Backend: validar a licença antes de aceitar ações críticas

A lógica de proteção não pode depender só do cliente. O usuário não deve conseguir passar por cima do bloqueio acessando diretamente a base.

## Estratégia para evitar fuga de pagamento

- O admin só pode operar se a licença estiver ativa
- A área pública e o cliente continuam acessíveis
- O painel administrativo bloqueia quando a licença expira
- A faturação e o status do pagamento ficam em módulo dedicado
- As ações sensíveis passam por validação server-side

## Rumo para produção real

Para sair do MVP, o próximo passo não é reinventar tudo, e sim:

1. manter a estrutura do frontend atual
2. centralizar regras de licença e permissões
3. definir módulos em features
4. criar backend real para validação de negócio
5. adicionar faturação e integração de pagamento
6. evoluir UI com microanimações e design premium

## Resumo prático

A arquitetura atual está correta em princípio, mas a implementação ideal para o JABOQUE deve seguir uma lógica modular por domínio, com licença e faturação como módulos centrais, e com backend como fonte da verdade.
