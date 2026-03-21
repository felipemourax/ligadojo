import { expect, test } from "playwright/test"
import { appUrl, appUrlPattern, tenantUrl, tenantUrlPattern } from "./test-urls"

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`
}

test.describe("Núcleo de identidade e acesso", () => {
  test("tenant errado não entra", async ({ page }) => {
    await page.goto(tenantUrl("dojo-centro", "/login"))
    await page.getByLabel("E-mail").fill("admin.fightlab@email.com")
    await page.getByLabel("Senha").fill("12345678")
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page.getByText("Esta conta não possui acesso a esta academia")).toBeVisible()
    await expect(page).toHaveURL(tenantUrlPattern("dojo-centro", "/login"))
  })

  test("admin errado não entra em outro tenant", async ({ page }) => {
    await page.goto(tenantUrl("fight-lab", "/login"))
    await page.getByLabel("E-mail").fill("maria@email.com")
    await page.getByLabel("Senha").fill("12345678")
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page.getByText("Esta conta não possui acesso a esta academia")).toBeVisible()
  })

  test("aluno entra direto", async ({ page }) => {
    const email = uniqueEmail("student")

    await page.goto(tenantUrl("dojo-centro", "/cadastro"))
    await page.getByRole("button", { name: "Sou aluno" }).click()
    await page.getByLabel("Nome", { exact: true }).fill("Aluno")
    await page.getByLabel("Sobrenome", { exact: true }).fill("Teste")
    await page.getByLabel("E-mail").fill(email)
    await page.getByLabel("WhatsApp").fill("11999990000")
    await page.getByLabel("Data de nascimento").fill("2000-01-01")
    await page.getByRole("button", { name: "Selecione as atividades" }).click()
    await page.getByText("Jiu-Jitsu", { exact: true }).click()
    await page.keyboard.press("Escape")
    await page.getByLabel("Senha").fill("12345678")
    await page.getByRole("button", { name: "Continuar" }).click()
    await page.getByLabel("CEP").fill("01310-100")
    await page.getByRole("button", { name: "Buscar" }).click()
    await page.getByRole("button", { name: "Criar meu acesso" }).click()

    await expect(page).toHaveURL(tenantUrlPattern("dojo-centro", "/app/student"))
    await expect(page.getByRole("heading", { name: /Olá,/ })).toBeVisible()
  })

  test("professor entra pendente", async ({ page }) => {
    const email = uniqueEmail("teacher")

    await page.goto(tenantUrl("dojo-centro", "/cadastro"))
    await page.getByLabel("Nome", { exact: true }).fill("Professor")
    await page.getByLabel("Sobrenome", { exact: true }).fill("Pendente")
    await page.getByLabel("E-mail").fill(email)
    await page.getByLabel("WhatsApp").fill("11999990001")
    await page.getByLabel("Data de nascimento").fill("1995-05-05")
    await page.getByRole("button", { name: "Sou professor" }).click()
    await page.getByRole("button", { name: "Selecione as atividades" }).click()
    await page.getByText("Jiu-Jitsu", { exact: true }).click()
    await page.keyboard.press("Escape")
    await page.getByLabel("Senha").fill("12345678")
    await page.getByRole("button", { name: "Continuar" }).click()
    await page.getByLabel("CEP").fill("01310-100")
    await page.getByRole("button", { name: "Buscar" }).click()
    await page.getByRole("button", { name: "Criar meu acesso" }).click()

    await expect(page).toHaveURL(tenantUrlPattern("dojo-centro", "/app"))
    await expect(page.getByText("Seu acesso ainda não está ativo para usar o app da academia.")).toBeVisible()
  })

  test("professor já cadastrado pela academia ativa o acesso sem duplicar cadastro", async ({ page }) => {
    await page.goto(tenantUrl("dojo-centro", "/cadastro"))
    await page.getByLabel("Nome", { exact: true }).fill("Professor")
    await page.getByLabel("Sobrenome", { exact: true }).fill("Cadastrado")
    await page.getByLabel("E-mail").fill("prof.cadastrado@email.com")
    await page.getByLabel("WhatsApp").fill("11999990004")
    await page.getByLabel("Data de nascimento").fill("1992-08-08")
    await page.getByRole("button", { name: "Sou professor" }).click()
    await page.getByRole("button", { name: "Selecione as atividades" }).click()
    await page.getByText("Jiu-Jitsu", { exact: true }).click()
    await page.keyboard.press("Escape")
    await page.getByLabel("Senha").fill("12345678")
    await page.getByRole("button", { name: "Continuar" }).click()
    await page.getByLabel("CEP").fill("01310-100")
    await page.getByRole("button", { name: "Buscar" }).click()
    await page.getByRole("button", { name: "Criar meu acesso" }).click()

    await expect(page).toHaveURL(tenantUrlPattern("dojo-centro", "/app/teacher"))
    await expect(page.getByRole("heading", { name: /Olá,|Resumo/i })).toBeVisible()
  })

  test("aprovação muda o estado real", async ({ browser, page }) => {
    const email = uniqueEmail("teacherapproval")

    await page.goto(tenantUrl("dojo-centro", "/cadastro"))
    await page.getByLabel("Nome", { exact: true }).fill("Professor")
    await page.getByLabel("Sobrenome", { exact: true }).fill("Aprovacao")
    await page.getByLabel("E-mail").fill(email)
    await page.getByLabel("WhatsApp").fill("11999990002")
    await page.getByLabel("Data de nascimento").fill("1990-03-10")
    await page.getByRole("button", { name: "Sou professor" }).click()
    await page.getByRole("button", { name: "Selecione as atividades" }).click()
    await page.getByText("Jiu-Jitsu", { exact: true }).click()
    await page.keyboard.press("Escape")
    await page.getByLabel("Senha").fill("12345678")
    await page.getByRole("button", { name: "Continuar" }).click()
    await page.getByLabel("CEP").fill("01310-100")
    await page.getByRole("button", { name: "Buscar" }).click()
    await page.getByRole("button", { name: "Criar meu acesso" }).click()
    await expect(page.getByText("Seu acesso ainda não está ativo para usar o app da academia.")).toBeVisible()

    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()
    await adminPage.goto(tenantUrl("dojo-centro", "/login"))
    await adminPage.getByLabel("E-mail").fill("joao@academia.com")
    await adminPage.getByLabel("Senha").fill("12345678")
    await adminPage.getByRole("button", { name: "Entrar" }).click()
    await expect(adminPage).toHaveURL(tenantUrlPattern("dojo-centro", "/dashboard"))
    await adminPage.goto(tenantUrl("dojo-centro", "/dashboard/settings/users"))
    const requestCard = adminPage.locator(`[data-request-email="${email}"]`)
    await requestCard.waitFor()
    const [approvalResponse] = await Promise.all([
      adminPage.waitForResponse(
        (response) =>
          response.url().includes("/api/enrollment-requests/") &&
          response.request().method() === "PATCH"
      ),
      requestCard.getByTestId(/approve-enrollment-request-/).click(),
    ])
    expect(approvalResponse.ok()).toBeTruthy()
    await expect(requestCard.getByText("Aprovado")).toBeVisible()
    await adminContext.close()

    await page.reload()
    await expect(page).toHaveURL(tenantUrlPattern("dojo-centro", "/app/teacher"))
    await expect(page.getByRole("heading", { name: /Olá,|Resumo/i })).toBeVisible()
  })

  test("convite de professor funciona", async ({ page }) => {
    await page.goto(tenantUrl("dojo-centro", "/aceitar-convite/invite-teacher-dojo-centro"))
    await expect(await page.getByLabel("E-mail").inputValue()).toBe("prof.ricardo@email.com")
    await page.getByLabel("Nome").fill("Prof. Ricardo")
    await page.getByLabel("Telefone").fill("11999990003")
    await page.getByLabel("Senha").fill("12345678")
    await page.getByRole("button", { name: "Entrar com este convite" }).click()

    await expect(page).toHaveURL(tenantUrlPattern("dojo-centro", "/app/teacher"))
  })

  test("troca de tenant funciona", async ({ page }) => {
    await page.goto(tenantUrl("dojo-centro", "/login"))
    await page.getByLabel("E-mail").fill("joao@academia.com")
    await page.getByLabel("Senha").fill("12345678")
    await page.getByRole("button", { name: "Entrar" }).click()

    await page.goto(tenantUrl("fight-lab", "/app"))
    await expect(page).toHaveURL(tenantUrlPattern("fight-lab", "/app"))
  })

  test("reset de senha funciona", async ({ page }) => {
    await page.goto(appUrl("/recuperar-senha"))
    await page.getByLabel("E-mail").fill("outsider@email.com")
    await page.getByRole("button", { name: "Gerar link" }).click()
    await page.getByRole("link", { name: "Abrir link de redefinição" }).click()

    await page.getByLabel("Nova senha").fill("87654321")
    await page.getByLabel("Confirmar senha").fill("87654321")
    await page.getByRole("button", { name: "Atualizar senha" }).click()

    await expect(page).toHaveURL(appUrlPattern("/login"))
    await page.getByLabel("E-mail").fill("outsider@email.com")
    await page.getByLabel("Senha").fill("87654321")
    await page.getByRole("button", { name: "Entrar" }).click()
    await expect(page.getByText("Sua conta ainda não possui acesso liberado a nenhuma academia.")).toBeVisible()
  })
})
