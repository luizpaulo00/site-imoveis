# Jander Imóveis — Site Vitrine de Imóveis

## What This Is

Site catálogo/vitrine para um corretor de imóveis autônomo no Brasil. Exibe imóveis com fotos, preços, localização e botão de contato via WhatsApp. O corretor compartilha links individuais de imóveis pelo WhatsApp com seus clientes, então a experiência mobile e o link preview (Open Graph) são críticos.

## Core Value

Quando o cliente do corretor recebe um link de imóvel no WhatsApp, ele vê um preview bonito, abre num site rápido e mobile-first com fotos grandes, e consegue falar com o corretor em um toque.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. v1.0 -->

- ✓ Site mobile-first com cards de imóveis visualmente atrativos — v1.0
- ✓ Página individual do imóvel com galeria de fotos fullscreen, descrição, specs, mapa, botão WhatsApp sticky — v1.0
- ✓ Filtros: tipo de imóvel, faixa de preço, quartos — v1.0
- ✓ Open Graph tags dinâmicas por imóvel — v1.0
- ✓ Painel admin com login email/senha — v1.0
- ✓ CRUD de imóveis: título, descrição, preço, tipo, quartos, banheiros, área, endereço, localização no mapa — v1.0
- ✓ Upload de múltiplas fotos com drag-and-drop, reordenar, definir capa, deletar individual — v1.0
- ✓ Compressão/redimensionamento automático de imagens no upload — v1.0
- ✓ Status do imóvel: disponível, reservado, vendido — v1.0
- ✓ Destacar imóveis na home — v1.0
- ✓ Dashboard admin com contadores — v1.0
- ✓ Número de WhatsApp configurável pelo admin — v1.0
- ✓ Carregamento rápido, loading states, sem telas brancas — v1.0
- ✓ Mensagem pré-preenchida no WhatsApp com nome do imóvel e link — v1.0

### Active

<!-- Current scope: v1.1 — Qualidade de Imagem e Novos Campos -->

- [ ] Qualidade de imagem preservada no upload (compressão menos agressiva, resolução alta)
- [ ] Tipo "Lote" como opção de tipo de imóvel
- [ ] Status de construção do imóvel: "Em construção" ou "Pronto para morar"
- [ ] Campo de área construída separado da área total

### Out of Scope

- Multi-idioma — apenas PT-BR, sem i18n
- Multi-corretor / multi-tenant — sistema para um único corretor
- Chat em tempo real — WhatsApp é o canal de comunicação
- Agendamento de visitas online — contato é via WhatsApp
- Integração com portais (ZAP Imóveis, OLX) — apenas site próprio
- App mobile nativo — site responsivo é suficiente
- Filtro por cidade — o corretor atua em uma cidade apenas
- Cadastro de clientes / CRM — fora do escopo v1

## Context

- **Público:** clientes do corretor que recebem links pelo WhatsApp (acesso predominantemente mobile)
- **Volume:** até ~20 imóveis ativos simultâneos — catálogo enxuto
- **Região:** corretor atua em uma única cidade no Brasil
- **Orçamento de infra:** zero — usar tiers gratuitos (hosting, banco, storage)
- **Domínio:** corretor tem domínio próprio
- **Branding:** layout genérico/neutro por ora, personalização futura
- **Admin:** corretor não é técnico — interface deve ser extremamente intuitiva
- **WhatsApp:** número configurável via painel admin

## Constraints

- **Custo:** Hosting e serviços devem usar tiers gratuitos (Vercel free, Supabase free, etc.)
- **Performance:** Mobile-first, carregamento rápido via links do WhatsApp em conexões variadas
- **SEO/Social:** Open Graph tags dinâmicas obrigatórias — link preview no WhatsApp é funcionalidade crítica
- **UX Admin:** Interface óbvia para usuário não-técnico — sem jargão, sem complexidade
- **Imagens:** Fotos são a estrela do site — galeria de alta qualidade é prioridade

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Apenas PT-BR | Público é 100% brasileiro, simplifica desenvolvimento | — Pending |
| Custo zero de infra | Corretor autônomo, projeto precisa ser sustentável sem custo recorrente | — Pending |
| Único usuário admin | Apenas um corretor usa o sistema, sem necessidade de multi-tenant | — Pending |
| WhatsApp como canal de contato | É como o corretor já trabalha, clientes já estão no WhatsApp | — Pending |
| Identidade visual JV | Corretor tem branding profissional completo — usar cores, fontes e logo oficiais | — Active |

## Brand Identity

**Assets:** `JANDER VENANCIO - CORRETOR DE IMOVEIS - IDENTIDADE VISUAL/` (project root)

**Colors:**
- Primary/accent: `#FF6A15` (laranja)
- Dark teal: `#0D3B3B` (logo mark, deep backgrounds)
- Medium teal: `#2D6B6B` (secondary)
- Off-white/cream: `#F0EBE3` (light backgrounds)
- Dark: `#333333` (dark backgrounds, text)

**Typography:**
- **TT Firs Neue** — display/headlines (logo font)
- **Poppins** — body/UI (Google Fonts)

**Logo:** Monograma "JV" com silhueta de casa. Variantes: redondo, horizontal, vertical. SVGs em `SVG/`.

## Current Milestone: v1.1 Qualidade de Imagem e Novos Campos

**Goal:** Melhorar a qualidade das fotos no site e adicionar campos essenciais (lote, status de construção, área construída) para o catálogo do corretor.

**Target features:**
- Qualidade de imagem preservada no upload (compressão atual muito agressiva: 0.4MB/800px)
- Tipo "Lote" como opção de imóvel
- Status de construção (em construção / pronto para morar)
- Área construída como campo separado

---
*Last updated: 2026-03-25 after milestone v1.1 definition*
