import type { CreateCrmLeadInput } from "@/apps/api/src/modules/crm/domain/lead"
import { LeadRepository } from "@/apps/api/src/modules/crm/repositories/lead.repository"

function normalizePhone(value: string) {
  return value.replace(/\D/g, "")
}

export class LeadService {
  constructor(private readonly repository = new LeadRepository()) {}

  async create(input: CreateCrmLeadInput) {
    const name = input.name.trim()
    const phone = normalizePhone(input.phone)
    const email = input.email?.trim().toLowerCase() || null
    const modalityId = input.modalityId?.trim() || null

    if (name.length < 3) {
      throw new Error("Informe um nome válido para o lead.")
    }

    if (phone.length < 10) {
      throw new Error("Informe um WhatsApp válido para o lead.")
    }

    return this.repository.create({
      ...input,
      modalityId,
      name,
      phone,
      email,
    })
  }
}
