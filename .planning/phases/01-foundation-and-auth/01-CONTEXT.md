# Phase 1: Foundation and Auth - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffolding (Next.js + Supabase), database schema, authentication (email/password single admin), admin route protection, settings page (WhatsApp number, site/broker name), and infrastructure guardrails (keep-alive cron, RLS policies, pre-optimized image handling).

</domain>

<decisions>
## Implementation Decisions

### Stack do Frontend
- **Framework:** Next.js 15 com App Router — SSR nativo para OG tags na Fase 4, deploy nativo no Vercel free tier
- **CSS:** Tailwind CSS — utility-first, prototipagem rápida, responsivo sem boilerplate
- **Componentes UI:** shadcn/ui — acessível, customizável, integra com Tailwind, não adiciona bundle size (copia componentes ao invés de importar pacote)
- **Database/Auth/Storage:** Supabase — auth com email/senha, PostgreSQL, Storage para fotos, RLS para segurança
- **Linguagem:** TypeScript — type safety no projeto inteiro
- **Validação de forms:** React Hook Form + Zod — validação declarativa, boa DX, mensagens de erro em PT-BR

### Layout do Admin
- **Estrutura:** Sidebar fixa à esquerda (colapsável em telas menores) + área de conteúdo principal à direita
- **Sidebar:** Logo/nome do site no topo, navegação vertical com ícones + labels (Imóveis, Configurações), botão de logout no rodapé da sidebar
- **Topbar:** Dentro da área de conteúdo — mostra título da página atual e breadcrumb quando aplicável
- **Estilo visual:** Limpo, branco com sidebar em tom neutro escuro (slate/zinc do Tailwind). Sem cores vibrantes no admin — cores usadas apenas para status e ações
- **Responsividade admin:** Otimizado para desktop/tablet (o corretor gerencia pelo computador). Em mobile, sidebar vira menu hambúrguer com drawer

### Tela de Login
- **Layout:** Card centralizado vertical e horizontalmente, fundo neutro claro (gray-50)
- **Elementos:** Logo/nome do site acima do card, campos de email e senha com labels claros em PT-BR, botão "Entrar" em destaque (primary color)
- **Feedback de erros:** Mensagem inline abaixo do formulário em vermelho sutil — texto claro: "Email ou senha incorretos" (sem expor qual está errado, por segurança)
- **Loading state:** Botão mostra spinner + "Entrando..." enquanto autentica (evita cliques duplos)
- **Sem "esqueci a senha"** no v1 — admin único, pode resetar via dashboard do Supabase se necessário. Simplifica a tela
- **Redirect após login:** Vai direto para a lista de imóveis (/admin/imoveis) — é a tela mais usada

### Página de Settings
- **Layout:** Formulário simples com seções visuais separadas por cards
- **Seção "Contato":** Campo de WhatsApp com máscara brasileira (XX) XXXXX-XXXX, validação de formato
- **Seção "Site":** Campos para nome do site e nome do corretor
- **Comportamento:** Botão "Salvar" fixo no rodapé da página. Ao salvar: toast de sucesso "Configurações salvas" (verde, desaparece após 3s)
- **Validação:** WhatsApp é obrigatório (sem número = sem botão de contato no site público). Validação em tempo real com Zod
- **UX:** Dados pré-preenchidos ao abrir a página (carrega do banco). Campos com placeholder explicativo ("(61) 99999-9999")

### Claude's Discretion
- Esquema exato de cores (primary, accent) — será definido durante implementação
- Estrutura de pastas do projeto (src/app, src/components, etc.)
- Configuração de ESLint/Prettier
- Schema exato das tabelas no Supabase (colunas, tipos, constraints)
- Implementação do cron keep-alive (Edge Function ou GitHub Action)
- Estratégia de RLS policies

</decisions>

<specifics>
## Specific Ideas

- Referência visual: ImoBueno (imobueno.com.br) — site de imobiliária com design limpo, azul corporativo, cards com sombra. Usar como inspiração geral de estilo para o site público (Fase 4), mas o admin deve ser mais neutro/funcional
- O corretor não é técnico — toda a UX admin deve ser óbvia, sem jargão, com feedback visual claro para cada ação
- PT-BR em todas as labels, mensagens de erro, e textos da interface

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Nenhum — projeto greenfield, sem código existente

### Established Patterns
- Nenhum — padrões serão definidos nesta fase como base para todas as fases seguintes

### Integration Points
- Supabase Client: será criado nesta fase e reutilizado em todas as fases
- Auth Context/Provider: proteção de rotas reutilizada em Fases 2-3
- Layout Admin (sidebar + content): reutilizado em todas as páginas admin (Fases 2-3)
- Settings (WhatsApp number): consumido pelo botão WhatsApp na Fase 4

</code_context>

<deferred>
## Deferred Ideas

- Dashboard com contadores (total, disponíveis, vendidos) — movido para v2 (ADM2-01)
- Personalização visual (logo, cores) — v2 (VIS2-02)

</deferred>

---

*Phase: 01-foundation-and-auth*
*Context gathered: 2026-03-12*
