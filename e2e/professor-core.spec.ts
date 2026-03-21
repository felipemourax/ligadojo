import { expect, type Locator, type Page, test } from "playwright/test"
import { tenantUrl, tenantUrlPattern } from "./test-urls"

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`
}

async function createAndApproveTeacher(page: Page, email: string) {
  await page.goto(tenantUrl("dojo-centro", "/cadastro"))
  await page.getByLabel("Nome", { exact: true }).fill("Professor")
  await page.getByLabel("Sobrenome", { exact: true }).fill("Core")
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("WhatsApp").fill("11999990111")
  await page.getByLabel("Data de nascimento").fill("1990-01-01")
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

  const adminContext = await page.context().browser()!.newContext()
  const adminPage = await adminContext.newPage()
  await adminPage.goto(tenantUrl("dojo-centro", "/login"))
  await adminPage.getByLabel("E-mail").fill("joao@academia.com")
  await adminPage.getByLabel("Senha").fill("12345678")
  await adminPage.getByRole("button", { name: "Entrar" }).click()
  await expect(adminPage).toHaveURL(tenantUrlPattern("dojo-centro", "/dashboard"))
  await adminPage.goto(tenantUrl("dojo-centro", "/dashboard/settings/users"))
  const requestCard = adminPage.locator(`[data-request-email="${email}"]`)
  await requestCard.waitFor()
  await Promise.all([
    adminPage.waitForResponse(
      (response) =>
        response.url().includes("/api/enrollment-requests/") &&
        response.request().method() === "PATCH" &&
        response.ok()
    ),
    requestCard.getByTestId(/approve-enrollment-request-/).click(),
  ])
  await adminContext.close()

  await page.goto(tenantUrl("dojo-centro", "/login"))
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("Senha").fill("12345678")
  await page.getByRole("button", { name: "Entrar" }).click()
}

async function expectProfessorPageStable(page: Page, path: string, marker: Locator) {
  await page.goto(tenantUrl("dojo-centro", path))
  await expect(page).toHaveURL(tenantUrlPattern("dojo-centro", path))
  await expect(marker.first()).toBeVisible()
}

test("core do professor permanece estável nas rotas principais", async ({ page }) => {
  const email = uniqueEmail("teachercore")
  await createAndApproveTeacher(page, email)

  const navigation = page.getByRole("navigation")
  await expect(navigation.getByRole("link", { name: "Resumo", exact: true })).toBeVisible()
  await expect(navigation.getByRole("link", { name: "Agenda", exact: true })).toBeVisible()
  await expect(navigation.getByRole("link", { name: "Presença", exact: true })).toBeVisible()
  await expect(navigation.getByRole("link", { name: "Turmas", exact: true })).toBeVisible()
  await expect(navigation.getByRole("link", { name: "Perfil", exact: true })).toBeVisible()

  await expectProfessorPageStable(
    page,
    "/app/teacher",
    page.getByRole("heading", { name: /Olá,|Resumo/i }).or(page.getByRole("button", { name: "Tentar novamente" }))
  )
  await expectProfessorPageStable(
    page,
    "/app/teacher/agenda",
    page.getByRole("heading", { name: "Agenda" }).or(page.getByRole("button", { name: "Tentar novamente" }))
  )
  await expectProfessorPageStable(
    page,
    "/app/teacher/classes",
    page.getByRole("heading", { name: "Turmas" }).or(page.getByRole("button", { name: "Tentar novamente" }))
  )
  await expectProfessorPageStable(
    page,
    "/app/teacher/profile",
    page.getByRole("tab", { name: "Dados", exact: true }).or(page.getByRole("button", { name: "Tentar novamente" }))
  )
})
