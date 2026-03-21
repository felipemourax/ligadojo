import { NextResponse } from "next/server"

function normalizeZipCode(value: string) {
  return value.replace(/\D/g, "")
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const zipCode = normalizeZipCode(url.searchParams.get("zipCode") ?? "")

  if (zipCode.length !== 8) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Informe um CEP valido com 8 digitos.",
      },
      { status: 400 }
    )
  }

  const viaCep = await fetchJson(`https://viacep.com.br/ws/${zipCode}/json/`)

  if (viaCep && !viaCep.erro) {
    return NextResponse.json(
      {
        zipCode,
        street: viaCep.logradouro ?? "",
        complement: viaCep.complemento ?? "",
        city: viaCep.localidade ?? "",
        state: viaCep.uf ?? "",
        country: "Brasil",
        source: "viacep",
      },
      { status: 200 }
    )
  }

  const brasilApi = await fetchJson(`https://brasilapi.com.br/api/cep/v1/${zipCode}`)

  if (brasilApi) {
    return NextResponse.json(
      {
        zipCode,
        street: brasilApi.street ?? "",
        complement: brasilApi.neighborhood ?? "",
        city: brasilApi.city ?? "",
        state: brasilApi.state ?? "",
        country: "Brasil",
        source: "brasilapi",
      },
      { status: 200 }
    )
  }

  return NextResponse.json(
    {
      error: "not_found",
      message: "Nao foi possivel localizar esse CEP.",
    },
    { status: 404 }
  )
}
