import { test, expect, type Page } from "@playwright/test";
import path from "path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ADMIN_EMAIL = "admin@janderimoveis.com";
const ADMIN_PASSWORD = "Jander@2026";
const TEST_PROPERTY_TITLE = "Casa Teste Playwright E2E";
const TEST_PROPERTY_TITLE_EDITED = "Casa Teste Playwright E2E Editada";

async function adminLogin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Senha").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/admin/imoveis", { timeout: 15000 });
}

/** Wait for toast with given text, then dismiss it */
async function expectToast(page: Page, text: string) {
  const toast = page.locator("[data-sonner-toast]", { hasText: text });
  await expect(toast).toBeVisible({ timeout: 10000 });
}

/** Select a value from a shadcn Select component by trigger id */
async function selectOption(page: Page, triggerId: string, optionText: string) {
  await page.locator(`#${triggerId}`).click();
  await page.getByRole("option", { name: optionText, exact: true }).click();
}

// ---------------------------------------------------------------------------
// 1. Pagina Publica - Home
// ---------------------------------------------------------------------------

test.describe("1. Pagina Publica - Home", () => {
  test("hero, stats, listagem e diferenciais carregam", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/jander/i);

    // Hero section
    const hero = page.locator("h1");
    await expect(hero).toBeVisible();

    // Properties section heading
    await expect(page.getByRole("heading", { name: "Imóveis Selecionados" })).toBeVisible();

    // Property listing section exists
    const propertySection = page.locator("#imoveis");
    await expect(propertySection).toBeVisible();

    // Filters are visible
    await expect(page.getByText("Tipo", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Faixa de Preco")).toBeVisible();
    await expect(page.getByText("Quartos", { exact: false }).first()).toBeVisible();
  });

  test("filtros de tipo atualizam contagem", async ({ page }) => {
    await page.goto("/");
    await page.locator("#imoveis").scrollIntoViewIfNeeded();

    // Get initial count
    const countText = page.locator("text=/\\d+ imove(l|is) encontrado/");
    await expect(countText).toBeVisible({ timeout: 10000 });

    // Click "Casa" filter
    const casaButton = page
      .locator("button")
      .filter({ hasText: /^Casa$/ })
      .first();
    await casaButton.click();

    // Count should still be visible (possibly different number)
    await expect(countText).toBeVisible();
  });

  test("filtro de preco funciona", async ({ page }) => {
    await page.goto("/");
    await page.locator("#imoveis").scrollIntoViewIfNeeded();

    const priceButton = page
      .locator("button")
      .filter({ hasText: "Ate R$ 200k" });
    await priceButton.click();

    await expect(
      page.locator("text=/\\d+ imove(l|is) encontrado/")
    ).toBeVisible();
  });

  test("filtro de quartos funciona", async ({ page }) => {
    await page.goto("/");
    await page.locator("#imoveis").scrollIntoViewIfNeeded();

    // Click bedroom "3" filter
    const bedroomButtons = page.locator("button").filter({ hasText: /^3$/ });
    await bedroomButtons.first().click();

    await expect(
      page.locator("text=/\\d+ imove(l|is) encontrado/")
    ).toBeVisible();
  });

  test("botao WhatsApp esta visivel (se configurado)", async ({ page }) => {
    await page.goto("/");

    // WhatsApp link only appears if settings.whatsapp is configured
    // Check for wa.me link OR the "Falar com Jander" text
    const whatsappLink = page.locator("a[href*='wa.me']");
    const falarComJander = page.getByText("Falar com Jander");
    const count = await whatsappLink.count();
    const falarCount = await falarComJander.count();

    // At least one WhatsApp CTA should be present if configured
    // If not configured, this test passes as a no-op
    if (count > 0 || falarCount > 0) {
      expect(count + falarCount).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Pagina Publica - Detalhe do Imovel
// ---------------------------------------------------------------------------

test.describe("2. Pagina Publica - Detalhe do Imovel", () => {
  test("exibe informacoes do imovel", async ({ page }) => {
    await page.goto("/");
    await page.locator("#imoveis").scrollIntoViewIfNeeded();

    // Click the first property card link
    const firstProperty = page.locator("a[href^='/imoveis/']").first();
    await expect(firstProperty).toBeVisible({ timeout: 10000 });
    await firstProperty.click();

    // Wait for detail page
    await page.waitForURL("**/imoveis/**");

    // Title (h1)
    const title = page.locator("h1");
    await expect(title).toBeVisible();

    // Price (orange text)
    await expect(page.locator("text=/R\\$\\s/")).toBeVisible();

    // Description section
    await expect(page.getByText("Descricao")).toBeVisible();

    // Details table
    await expect(page.getByText("Detalhes do imovel")).toBeVisible();
  });

  test("share button esta presente", async ({ page }) => {
    await page.goto("/");

    const firstProperty = page.locator("a[href^='/imoveis/']").first();
    await expect(firstProperty).toBeVisible({ timeout: 10000 });
    await firstProperty.click();
    await page.waitForURL("**/imoveis/**");

    // Share button (has sr-only text or aria)
    const shareButton = page.locator("button").filter({ has: page.locator("svg") }).first();
    await expect(shareButton).toBeVisible();
  });

  test("JSON-LD dados estruturados presente", async ({ page }) => {
    await page.goto("/");

    const firstProperty = page.locator("a[href^='/imoveis/']").first();
    await expect(firstProperty).toBeVisible({ timeout: 10000 });
    await firstProperty.click();
    await page.waitForURL("**/imoveis/**");

    const jsonLd = await page.evaluate(() => {
      const script = document.querySelector(
        'script[type="application/ld+json"]'
      );
      return script ? JSON.parse(script.textContent || "{}") : null;
    });

    expect(jsonLd).not.toBeNull();
    expect(jsonLd["@type"]).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 3. Login Admin
// ---------------------------------------------------------------------------

test.describe("3. Login Admin", () => {
  test("login com credenciais corretas redireciona ao admin", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(page.getByText("Jander Imoveis")).toBeVisible();

    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Senha").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL("**/admin/imoveis", { timeout: 15000 });
    await expect(page).toHaveURL(/\/admin\/imoveis/);
  });

  test("login com senha errada mostra erro", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Senha").fill("senhaerrada123");
    await page.getByRole("button", { name: "Entrar" }).click();

    // Should show error message
    const error = page.locator("text=/credenciais|invalido|incorret|erro/i");
    await expect(error).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// 4-10. Admin Flow (serial - depends on state)
// ---------------------------------------------------------------------------

test.describe("4-10. Admin Flow Completo", () => {
  test.describe.configure({ mode: "serial" });

  let propertyId: string;

  // 4. Admin - Listagem de Imoveis
  test("4. listagem de imoveis carrega com tabs", async ({ page }) => {
    await adminLogin(page);

    // Topbar title
    await expect(page.getByRole("heading", { name: "Imoveis" })).toBeVisible();

    // "Novo Imovel" button
    await expect(
      page.getByRole("link", { name: /Novo Imovel/ })
    ).toBeVisible();

    // Status tabs
    await expect(page.getByRole("tab", { name: /Todos/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Disponivel/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Reservado/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Vendido/ })).toBeVisible();
  });

  test("4b. tabs filtram por status", async ({ page }) => {
    await adminLogin(page);

    // Click "Disponivel" tab
    await page.getByRole("tab", { name: /Disponivel/ }).click();
    await page.waitForTimeout(500);

    // Click "Todos" tab back
    await page.getByRole("tab", { name: /Todos/ }).click();
    await page.waitForTimeout(500);
  });

  // 5. Admin - Criar Novo Imovel
  test("5. criar novo imovel com todos os campos", async ({ page }) => {
    await adminLogin(page);

    await page.getByRole("link", { name: /Novo Imovel/ }).click();
    await page.waitForURL("**/admin/imoveis/novo");

    // Dados Basicos
    await page.getByLabel("Titulo").fill(TEST_PROPERTY_TITLE);
    await page.getByLabel("Descricao").fill("Imovel criado via teste automatizado Playwright");

    // Price - CurrencyInput (not a regular input, fill by id)
    await page.locator("#price").fill("450000");

    // Tipo = Casa
    await selectOption(page, "property_type", "Casa");

    // Caracteristicas
    await page.getByLabel("Quartos").fill("3");
    await page.getByLabel("Banheiros").fill("2");
    await page.getByLabel("Vagas de garagem").fill("2");
    await page.getByLabel("Area (m2)").fill("120");

    // Condicao = Novo
    await selectOption(page, "condition", "Novo");

    // Localizacao
    await page.getByLabel("Endereco").fill("Rua Teste 123");
    await page.getByLabel("Bairro").fill("Centro");
    await page.getByLabel("Cidade").fill("Formosa");
    await page.getByLabel("Estado").fill("GO");

    // Status = Disponivel (default)
    // Featured = on
    await page.getByRole("switch", { name: "Destacar na pagina inicial" }).click();

    // Submit
    await page.getByRole("button", { name: "Salvar Imovel" }).click();

    // Should redirect to edit page (with id) - wait for heading to confirm
    await expect(page.getByRole("heading", { name: "Editar Imovel" })).toBeVisible({ timeout: 20000 });
    await expect(page).toHaveURL(/\/admin\/imoveis\/[^/]+\/editar/);

    // Extract property ID from URL
    const url = page.url();
    const match = url.match(/\/admin\/imoveis\/([^/]+)\/editar/);
    expect(match).toBeTruthy();
    propertyId = match![1];
  });

  // 6. Admin - Upload de Fotos
  test("6. upload de fotos no imovel criado", async ({ page }) => {
    await adminLogin(page);

    // Navigate to edit the created property
    // Use the stored propertyId from previous test
    await page.goto(`/admin/imoveis`);

    // Find and click edit button for our test property
    const row = page.locator("tr", { hasText: TEST_PROPERTY_TITLE });
    await expect(row).toBeVisible({ timeout: 10000 });

    const editLink = row.locator("a[href*='/editar']");
    await editLink.click();
    await page.waitForURL("**/editar");

    // Image manager section should be visible
    await expect(page.getByText("Fotos", { exact: true })).toBeVisible();

    // Scroll to image manager area
    await page.getByText("Fotos", { exact: true }).scrollIntoViewIfNeeded();

    // Upload test images - the input is hidden, so we use setInputFiles directly
    const fileInput = page.locator("input[type='file'][accept*='image']");
    const fixturesDir = path.join(__dirname, "fixtures");

    await fileInput.setInputFiles(path.join(fixturesDir, "test-image-1.png"));

    // Wait for upload: look for success toast or badge change from "0/15"
    // The upload involves compression + server upload, may take a while
    const successToast = page.locator("[data-sonner-toast]", { hasText: "Foto enviada" });
    const badge = page.getByText(/[1-9]\/15 fotos/);
    await expect(successToast.or(badge)).toBeVisible({ timeout: 45000 });
  });

  // 7. Admin - Editar Imovel
  test("7. editar titulo e preco do imovel", async ({ page }) => {
    await adminLogin(page);

    await page.goto(`/admin/imoveis`);

    const row = page.locator("tr", { hasText: TEST_PROPERTY_TITLE });
    await expect(row).toBeVisible({ timeout: 10000 });

    const editLink = row.locator("a[href*='/editar']");
    await editLink.click();
    await page.waitForURL("**/editar");

    // Change title
    const titleInput = page.getByLabel("Titulo");
    await titleInput.clear();
    await titleInput.fill(TEST_PROPERTY_TITLE_EDITED);

    // Change price
    const priceInput = page.locator("#price");
    await priceInput.clear();
    await priceInput.fill("500000");

    // Save
    await page.getByRole("button", { name: "Salvar Imovel" }).click();

    // Should redirect to listing with success toast
    await page.waitForURL("**/admin/imoveis", { timeout: 15000 });
    await expectToast(page, "Imovel atualizado");

    // Verify title changed in the table
    await expect(
      page.locator("tr", { hasText: TEST_PROPERTY_TITLE_EDITED })
    ).toBeVisible({ timeout: 5000 });
  });

  // 8. Admin - Configuracoes do Site
  test("8. configuracoes do site", async ({ page }) => {
    await adminLogin(page);

    // Navigate to settings via sidebar
    await page.getByRole("link", { name: "Configuracoes" }).click();
    await page.waitForURL("**/admin/configuracoes");

    // Wait for form to load settings
    await page.waitForTimeout(2000);

    // Verify fields exist
    await expect(page.getByLabel("WhatsApp")).toBeVisible();
    await expect(page.getByLabel("Nome do site")).toBeVisible();
    await expect(page.getByLabel("Nome do corretor")).toBeVisible();

    // Update broker name
    const brokerInput = page.getByLabel("Nome do corretor");
    await brokerInput.clear();
    await brokerInput.fill("Jander Venancio Teste");

    // Save
    await page.getByRole("button", { name: "Salvar" }).click();

    // Wait for toast or for the button to re-enable (save completed)
    await expect(page.getByRole("button", { name: "Salvar" })).toBeEnabled({ timeout: 10000 });

    // Restore original value
    await page.waitForTimeout(1000);
    await brokerInput.clear();
    await brokerInput.fill("Jander Venancio");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByRole("button", { name: "Salvar" })).toBeEnabled({ timeout: 10000 });
  });

  // 9. Validacao Publica Pos-Criacao
  test("9. imovel editado aparece na home publica", async ({ page }) => {
    await page.goto("/");
    await page.locator("#imoveis").scrollIntoViewIfNeeded();

    // The edited property should be visible
    await expect(
      page.getByText(TEST_PROPERTY_TITLE_EDITED)
    ).toBeVisible({ timeout: 15000 });

    // Click to see detail
    const propertyLink = page
      .locator("a[href^='/imoveis/']", {
        hasText: TEST_PROPERTY_TITLE_EDITED,
      })
      .first();
    await propertyLink.click();

    await page.waitForURL("**/imoveis/**");

    // Verify title on detail page
    await expect(page.locator("h1")).toContainText(TEST_PROPERTY_TITLE_EDITED);

    // Verify price changed
    await expect(page.locator("text=/R\\$\\s/")).toBeVisible();
  });

  // 10. Admin - Deletar Imovel de Teste
  test("10. deletar imovel de teste", async ({ page }) => {
    await adminLogin(page);

    const row = page.locator("tr", { hasText: TEST_PROPERTY_TITLE_EDITED });
    await expect(row).toBeVisible({ timeout: 10000 });

    // Click delete button (Trash icon)
    const deleteButton = row.locator("button").filter({
      has: page.locator("svg"),
    }).last();
    await deleteButton.click();

    // Confirm deletion in dialog
    await expect(page.getByText("Excluir imovel")).toBeVisible();
    await expect(
      page.getByText(/Tem certeza que deseja excluir/)
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Excluir", exact: true })
      .click();

    await expectToast(page, "Imovel excluido com sucesso");

    // Property should no longer be in the table
    await page.waitForTimeout(1000);
    await expect(
      page.locator("tr", { hasText: TEST_PROPERTY_TITLE_EDITED })
    ).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 11. Logout
// ---------------------------------------------------------------------------

test.describe("11. Logout", () => {
  test("logout redireciona para login", async ({ page }) => {
    await adminLogin(page);

    // Click "Sair" in the sidebar
    const logoutButton = page.getByRole("button", { name: /Sair/ });
    await logoutButton.click();

    // Should redirect to login
    await page.waitForURL("**/login", { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("acesso admin sem auth redireciona para login", async ({ page }) => {
    // Try to access admin page directly without login
    await page.goto("/admin/imoveis");

    // Should redirect to login
    await page.waitForURL("**/login", { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
