import { expect, test } from "playwright/test"
import { tenantUrl, tenantUrlPattern } from "./test-urls"

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`
}

test("professor acessa presença no app e persiste chamada quando houver turma", async ({ page }) => {
  const email = uniqueEmail("teacherattendance")

  await page.goto(tenantUrl("dojo-centro", "/cadastro"))
  await page.getByLabel("Nome", { exact: true }).fill("Professor")
  await page.getByLabel("Sobrenome", { exact: true }).fill("Presença")
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("WhatsApp").fill("11999990099")
  await page.getByLabel("Data de nascimento").fill("1991-01-01")
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
  await page.goto(tenantUrl("dojo-centro", "/app/teacher/attendance"))

  await expect(page).toHaveURL(tenantUrlPattern("dojo-centro", "/app/teacher/attendance"))
  await expect(page.getByRole("heading", { name: "Presença" })).toBeVisible()

  const noStudentsState = page.getByText("Nenhum aluno encontrado.")
  const hasNoStudents = await noStudentsState.isVisible().catch(() => false)

  if (hasNoStudents) {
    await expect(page.getByText(/0 alunos/).first()).toBeVisible()
    return
  }

  const initialPresentCounter = page.locator("p.text-lg.font-bold.text-green-500").first()
  const studentActions = page.locator("div.flex.items-center.gap-1").filter({ has: page.getByRole("button") }).first()

  await expect(studentActions).toBeVisible()
  await page.getByRole("button", { name: "Marcar todos presentes" }).click()
  await expect(initialPresentCounter).not.toHaveText("0")

  await page.getByRole("button", { name: "Finalizar Chamada" }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Confirmar" }).click()
  await expect(page.getByText("Chamada finalizada")).toBeVisible()

  await page.reload()
  await expect(page.getByRole("heading", { name: "Presença" })).toBeVisible()
  await expect(page.getByText("Chamada finalizada")).toBeVisible()
})

test("aluno não acessa rota de presença do professor", async ({ page }) => {
  await page.goto(tenantUrl("dojo-centro", "/login"))
  await page.getByLabel("E-mail").fill("maria@email.com")
  await page.getByLabel("Senha").fill("12345678")
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page).toHaveURL(tenantUrlPattern("dojo-centro", "/app/student"))

  const apiStatus = await page.evaluate(async () => {
    const response = await fetch("/api/app/teacher/attendance", {
      method: "GET",
      credentials: "include",
    })
    return response.status
  })
  expect(apiStatus).toBe(403)

  await page.goto(tenantUrl("dojo-centro", "/app/teacher/attendance"))
  await expect(page).toHaveURL(tenantUrlPattern("dojo-centro", "/app/student"))
})
