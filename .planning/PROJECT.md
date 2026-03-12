# Jander Imóveis — Site Vitrine de Imóveis

## What This Is

Site catálogo/vitrine para um corretor de imóveis autônomo no Brasil. Exibe imóveis com fotos, preços, localização e botão de contato via WhatsApp. O corretor compartilha links individuais de imóveis pelo WhatsApp com seus clientes, então a experiência mobile e o link preview (Open Graph) são críticos.

## Core Value

Quando o cliente do corretor recebe um link de imóvel no WhatsApp, ele vê um preview bonito, abre num site rápido e mobile-first com fotos grandes, e consegue falar com o corretor em um toque.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Site mobile-first com cards de imóveis visualmente atrativos (foto, preço, localização, specs)
- [ ] Página individual do imóvel com galeria de fotos fullscreen, descrição, specs, mapa, botão WhatsApp sticky
- [ ] Filtros: tipo de imóvel, faixa de preço, quartos
- [ ] Open Graph tags dinâmicas por imóvel (preview no WhatsApp com foto + título + preço)
- [ ] Painel admin com login email/senha (único usuário)
- [ ] CRUD de imóveis: título, descrição, preço, tipo, quartos, banheiros, área, endereço, localização no mapa
- [ ] Upload de múltiplas fotos (até 15) com drag-and-drop, reordenar, definir capa, deletar individual
- [ ] Compressão/redimensionamento automático de imagens no upload
- [ ] Status do imóvel: disponível, reservado, vendido
- [ ] Destacar imóveis na home
- [ ] Dashboard admin com contadores (total, disponíveis, vendidos)
- [ ] Número de WhatsApp configurável pelo admin
- [ ] Carregamento rápido, loading states, sem telas brancas
- [ ] Mensagem pré-preenchida no WhatsApp com nome do imóvel e link

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

---
*Last updated: 2026-03-11 after initialization*
