# Phase 2: Property Management - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

CRUD de imóveis no admin — criar, editar, deletar imóveis com todos os campos. Gerenciar status (disponível/reservado/vendido) e marcar como destaque. Visualizar lista de imóveis com status, título, contagem de fotos e ações. Upload de fotos é Phase 3 — aqui apenas o CRUD dos dados textuais e localização.

Escopo: somente venda (sem aluguel). Tipos: Casa e Apartamento (novos e usados).

</domain>

<decisions>
## Implementation Decisions

### Layout do formulário
- Página única com seções organizadas em cards (mesmo padrão do settings-form.tsx)
- Seções: Dados Básicos, Características, Localização, Status
- Botão "Salvar Imóvel" no final da página
- Mesmo formulário para criar e editar (pré-preenchido na edição)

### Campos do imóvel
- **Dados Básicos:** título (text), descrição (textarea livre), preço com máscara R$ (ex: R$ 350.000,00), tipo (select: Casa / Apartamento)
- **Características:** quartos (number), banheiros (number), vagas de garagem (number — campo novo, não existe no schema atual), área em m² (number), condição (select: Novo / Usado — campo novo)
- **Localização:** endereço (text), bairro (text), mapa interativo com clique para posicionar pin (opcional — imóvel pode ser salvo sem localização)
- **Status:** status (select: Disponível / Reservado / Vendido), toggle de destaque (boolean)
- Campos novos a adicionar no banco: `parking_spaces INT`, `condition TEXT CHECK (condition IN ('novo', 'usado'))`

### Preço com máscara
- Campo com máscara automática de moeda brasileira: ao digitar 350000, exibe R$ 350.000,00
- Pesquisar melhor biblioteca gratuita para máscara de R$ (nota do STATE.md: library ainda não validada)

### Design da lista de imóveis
- Tabela com colunas: Título, Tipo, Preço (formatado R$), Status (badge colorido), Fotos (contagem), Ações (editar/deletar)
- Botão "+ Novo Imóvel" no topo da página
- Ordenação: mais recentes primeiro (created_at DESC)
- Filtro por status: abas ou dropdown (Todos / Disponível / Reservado / Vendido)
- Badges de status coloridos: 🟢 Disponível, 🟡 Reservado, 🔴 Vendido

### Exclusão de imóvel
- Dialog de confirmação: "Tem certeza que deseja excluir [título]? Esta ação não pode ser desfeita."
- Botões: Cancelar / Excluir (vermelho)

### Status e destaque
- Gerenciados dentro do formulário de edição (seção "Status")
- Sem ações rápidas na lista — tudo pelo formulário

### Picker de localização (mapa)
- Leaflet + OpenStreetMap (100% gratuito, sem API key)
- Interação: clique no mapa para posicionar pin, arraste para ajustar
- Lat/lng preenchidos automaticamente ao clicar
- Mapa centralizado em Formosa-GO por padrão
- Localização é opcional — se não marcada, página pública não exibe mapa

### Tipos de imóvel
- Lista fixa: Casa, Apartamento (somente esses 2)
- Somente venda — sem aluguel
- Campo de condição: Novo / Usado

### Claude's Discretion
- Biblioteca de máscara de moeda R$ (pesquisar a melhor opção gratuita)
- Biblioteca de mapa (Leaflet é a recomendação, mas pode avaliar alternativas)
- Responsividade da tabela em telas menores
- Validação exata dos campos (quais obrigatórios, min/max)
- Toast de feedback após criar/editar/deletar
- Empty state da lista quando não há imóveis
- Zoom inicial e nível do mapa

</decisions>

<specifics>
## Specific Ideas

- Sites de referência para o design público (Fase 4): imobueno.com.br, vitoriaimoveisformosa.com.br, pedrovazcorretor.com.br
- Todos os 3 sites usam cards em grid com foto, preço formatado R$, quartos, banheiros, vagas, área m², bairro
- ImoBueno usa azul corporativo (#016ecd), os outros dois usam preto/branco clean com Montserrat
- Corretor atua em Formosa-GO — mapa deve começar centrado lá
- Admin otimizado para desktop/tablet (decisão da Fase 1), mas funcional em mobile

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `settings-form.tsx`: padrão de formulário com cards por seção, React Hook Form + Zod, Server Actions, toast de sucesso
- shadcn/ui: Button, Card, Input, Label, Skeleton, Sonner (toasts), Dropdown Menu, Separator
- `AdminTopbar`: componente de topbar com título da página
- `AppSidebar`: sidebar com navegação (já tem link para /admin/imoveis)
- `src/lib/utils/phone.ts`: padrão de formatação/máscara (pode inspirar máscara de preço)

### Established Patterns
- React Hook Form + Zod para validação de formulários
- Server Actions para operações de banco
- Supabase client (server-side) para queries
- Toast (sonner) para feedback de ações
- PT-BR em toda a interface

### Integration Points
- `supabase/schema.sql`: tabela `properties` já existe com todos os campos base (adicionar `parking_spaces` e `condition`)
- `src/app/admin/imoveis/page.tsx`: página placeholder existente — será substituída pela lista
- RLS policies já configuradas (public read, authenticated write)
- Layout admin com sidebar já engloba /admin/imoveis/*

</code_context>

<deferred>
## Deferred Ideas

- Dashboard com contadores (total, disponíveis, vendidos) — v2 (ADM2-01)
- Busca por texto na lista admin — desnecessário para ~20 imóveis
- Ações rápidas de status na lista (sem abrir formulário) — simplificar v1

</deferred>

---

*Phase: 02-property-management*
*Context gathered: 2026-03-12*
