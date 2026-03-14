# Phase 3: Image Pipeline - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Upload e gerenciamento de fotos dos imóveis no admin — drag-and-drop, compressão client-side, reordenação, seleção de capa, exclusão individual, progresso de upload, e geração de variantes otimizadas (thumbnail, card, detail, OG). Bucket `property-images` e tabela `property_images` já existem. A galeria pública é Phase 4 — aqui apenas o pipeline de upload/gerenciamento no admin.

</domain>

<decisions>
## Implementation Decisions

### Experiência de upload
- Seção inline no formulário de edição do imóvel (não modal) — abaixo dos campos existentes, nova seção "Fotos" com card
- Dropzone com drag-and-drop e botão "Selecionar fotos" como fallback — aceita múltiplos arquivos de uma vez
- Preview instantâneo das fotos selecionadas (thumbnail grid) antes do upload iniciar
- Progresso individual por foto (barra de progresso em cada thumbnail) — feedback claro para o corretor
- Upload disponível apenas após salvar o imóvel (precisa do property_id) — na criação, salvar primeiro e depois redirecionar para edição com seção de fotos habilitada
- Limite visual: mostrar contador "3/15 fotos" com aviso ao se aproximar do limite
- Aceitar JPEG, PNG, WebP — converter HEIC para JPEG no client-side antes do upload

### Gerenciamento de fotos
- Grid de thumbnails (3 colunas desktop, 2 mobile) com as fotos do imóvel
- Reordenar via drag-and-drop no grid (usar biblioteca leve como @dnd-kit/sortable)
- Foto de capa: estrela/ícone no canto do thumbnail — clicar para definir como capa. Capa tem borda destacada (primary color)
- Deletar: ícone X no canto do thumbnail com confirmação via dialog (mesmo padrão de delete do property-list)
- Ao reordenar ou mudar capa, salvar automaticamente (sem botão "salvar ordem")

### Variantes e otimização
- Compressão client-side com browser-image-compression antes do upload — target 800px largura máxima, qualidade 0.8, formato JPEG
- Upload do arquivo comprimido para Supabase Storage (uma única versão otimizada)
- Sem geração de múltiplas variantes server-side no v1 — Supabase free tier não tem Edge Functions com processamento de imagem pesado
- Para diferentes tamanhos, usar Supabase Storage Image Transformation (render-time, URL params: width, height, quality) — zero processamento server-side, zero storage extra
- Se Image Transformation não estiver disponível no free tier: servir a imagem comprimida diretamente e usar CSS/next-image para redimensionar no client
- Formato: manter JPEG após compressão (compatibilidade universal, bom para fotos)
- OG image (1200x630): gerar via URL params do Supabase ou redimensionar client-side antes do upload como arquivo separado se necessário

### Integração com formulário
- Seção "Fotos" integrada na mesma página de edição do imóvel (property-form.tsx), mas como componente separado `<ImageManager propertyId={id} />`
- Na criação: formulário salva o imóvel, redireciona para edição onde a seção de fotos aparece habilitada
- Na edição: seção de fotos visível e funcional desde o carregamento da página
- Upload e gerenciamento de fotos são independentes do formulário de dados — fotos usam Server Actions próprias, não fazem parte do submit do formulário principal
- Atualizar contagem de fotos na lista de imóveis (property-list.tsx já mostra count via subquery)

### Claude's Discretion
- Biblioteca exata de compressão client-side (browser-image-compression é a recomendação, avaliar alternativas se necessário)
- Biblioteca de drag-and-drop para reordenação (@dnd-kit é leve, mas avaliar hello-pangea/dnd se melhor integração com grid)
- Estratégia de Supabase Storage Transformation vs client-side resize — pesquisar disponibilidade no free tier
- Tamanho exato dos thumbnails no grid
- Animações/transições durante upload e reordenação
- Tratamento de erros de upload (retry automático ou manual)
- Placeholder/skeleton durante carregamento das fotos existentes

</decisions>

<specifics>
## Specific Ideas

- Corretor não é técnico — upload deve ser óbvio. Arrastar fotos ou clicar para selecionar, ver preview, ver progresso, pronto
- Site não pode ficar pesado — compressão client-side é essencial, imagens otimizadas antes de subir
- ~20 imóveis com até 15 fotos = ~300 fotos máximo — volume baixo, não precisa de otimização para escala
- Free tier Supabase Storage: 1GB — com compressão a ~400KB por foto, cabe ~2500 fotos tranquilo
- Fotos são a estrela do site (PROJECT.md) — qualidade visual importa, mas balanceado com peso

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `property-form.tsx`: formulário existente com 4 seções em cards — adicionar 5ª seção "Fotos" (ou componente separado montado na mesma página)
- `property-status-badge.tsx`: padrão de badge visual — pode inspirar badge de "capa" na foto
- shadcn/ui: Card, Button, AlertDialog (para confirmação de delete), Skeleton, sonner (toasts)
- `src/actions/properties.ts`: padrão de Server Actions com Supabase client — replicar para image actions
- `src/lib/validations/property.ts`: padrão de Zod schema — criar image validation schema

### Established Patterns
- React Hook Form + Zod para validação
- Server Actions para operações de banco (createProperty, updateProperty, deleteProperty)
- `createClient()` para Supabase server-side
- Toast (sonner) para feedback de ações
- PT-BR em toda a interface

### Integration Points
- `property_images` table: já existe com id, property_id, storage_path, position, is_cover
- Supabase Storage bucket `property-images`: já criado com RLS policies
- `src/app/admin/imoveis/[id]/editar/page.tsx`: página de edição — onde ImageManager será montado
- `src/app/admin/imoveis/novo/page.tsx`: página de criação — redirecionar para edição após salvar para habilitar fotos
- `listProperties` action: já usa `property_images(count)` subquery — contagem de fotos na lista já funciona

</code_context>

<deferred>
## Deferred Ideas

- Galeria pública com swipe e fullscreen — Phase 4 (DETL-02, DETL-03)
- OG image com overlay de preço/specs — v2 (VIS2-01)
- Crop/rotate de fotos no admin — desnecessário para v1, corretor pode usar ferramentas do celular

</deferred>

---

*Phase: 03-image-pipeline*
*Context gathered: 2026-03-13*
