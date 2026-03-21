import { expect, test } from "playwright/test"
import { tenantUrl, tenantUrlPattern } from "./test-urls"

function uniqueClassName() {
  return `Turma QA ${Date.now()}`
}

test("turmas persiste create, edit, cancelamento e confirmação", async ({ page }) => {
  const className = uniqueClassName()

  await page.goto(tenantUrl("dojo-centro", "/login"))
  await page.getByLabel("E-mail").fill("joao@academia.com")
  await page.getByLabel("Senha").fill("12345678")
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page).toHaveURL(tenantUrlPattern("dojo-centro", "/dashboard"))

  await page.goto(tenantUrl("dojo-centro", "/dashboard/classes"))
  await page.getByRole("button", { name: "Nova turma" }).click()

  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Nome da turma").fill(className)

  await dialog.getByRole("combobox").nth(0).click()
  await page.getByRole("option").first().click()

  await dialog.getByRole("combobox").nth(1).click()
  await page.getByRole("option").first().click()

  await dialog.getByRole("button", { name: "Selecione" }).click()
  await page.getByRole("menuitemcheckbox", { name: "Adulto" }).click()
  await page.keyboard.press("Escape")

  await dialog.getByPlaceholder("Ex: Branca a Azul").fill("Branca a Azul")
  await dialog.getByRole("button", { name: "SEG" }).click()
  await dialog.locator('input[type="time"]').nth(0).fill("18:00")
  await dialog.locator('input[type="time"]').nth(1).fill("19:00")
  await dialog.getByRole("button", { name: "Criar turma" }).click()

  await expect(page.getByText("Turma criada com sucesso.")).toBeVisible()
  await expect(page.getByText(className)).toBeVisible()

  await page.reload()
  await expect(page.getByText(className)).toBeVisible()

  await page.getByText(className).first().click()
  const details = page.getByRole("dialog")
  await details.getByRole("button").nth(0).click()
  await page.getByRole("menuitem", { name: "Editar turma" }).click()

  const editDialog = page.getByRole("dialog")
  await editDialog.getByPlaceholder("Ex: Branca a Azul").fill("Branca a Roxa")
  await editDialog.getByRole("button", { name: "Salvar alterações" }).click()
  await expect(page.getByText("Turma atualizada com sucesso.")).toBeVisible()

  await page.getByText(className).first().click()
  const updatedDetails = page.getByRole("dialog")
  await updatedDetails.getByRole("tab", { name: /Alunos/ }).click()
  await updatedDetails.getByRole("button", { name: "Gerenciar alunos" }).click()

  const enrollmentDialog = page.getByRole("dialog").last()
  const enrollmentCheckbox = enrollmentDialog.getByRole("checkbox").first()
  await expect(enrollmentCheckbox).toBeVisible()
  await enrollmentCheckbox.click()
  await expect(enrollmentCheckbox).toBeChecked()
  await page.keyboard.press("Escape")
  await expect(updatedDetails.getByText("Matriculado").first()).toBeVisible()
  await page.keyboard.press("Escape")

  await page.getByRole("tab", { name: "Agenda" }).click()
  await page.getByText(className).first().click()

  const sessionDialog = page.getByRole("dialog")
  await expect(sessionDialog.getByText("Status da aula")).toBeVisible()
  await sessionDialog.getByRole("button", { name: "Cancelar aula" }).click()
  await expect(sessionDialog.getByText("Esta aula foi cancelada para este dia.")).toBeVisible()
  await sessionDialog.getByRole("button", { name: "Reativar aula" }).click()

  const sessionCheckbox = sessionDialog.getByRole("checkbox").first()
  await expect(sessionCheckbox).toBeVisible()
  await sessionCheckbox.click()
  await expect(sessionCheckbox).toBeChecked()
  await expect(sessionDialog.getByText(/confirmados/).last()).not.toHaveText("0 confirmados")

  await page.keyboard.press("Escape")
  await page.reload()
  await page.getByRole("tab", { name: "Agenda" }).click()
  await expect(page.getByText(/confirmados/).first()).toBeVisible()
})
