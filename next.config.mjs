import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/app/professor",
        destination: "/app/teacher",
        permanent: false,
      },
      {
        source: "/app/professor/agenda",
        destination: "/app/teacher/agenda",
        permanent: false,
      },
      {
        source: "/app/professor/attendance",
        destination: "/app/teacher/attendance",
        permanent: false,
      },
      {
        source: "/app/professor/turmas",
        destination: "/app/teacher/classes",
        permanent: false,
      },
      {
        source: "/app/professor/evolucao",
        destination: "/app/teacher/evolution",
        permanent: false,
      },
      {
        source: "/app/professor/eventos",
        destination: "/app/teacher/events",
        permanent: false,
      },
      {
        source: "/app/professor/perfil",
        destination: "/app/teacher/profile",
        permanent: false,
      },
      {
        source: "/app/aluno",
        destination: "/app/student",
        permanent: false,
      },
      {
        source: "/app/aluno/presenca",
        destination: "/app/student/attendance",
        permanent: false,
      },
      {
        source: "/app/aluno/turmas",
        destination: "/app/student/classes",
        permanent: false,
      },
      {
        source: "/app/aluno/evolucao",
        destination: "/app/student/progress",
        permanent: false,
      },
      {
        source: "/app/aluno/pagamentos",
        destination: "/app/student/payments",
        permanent: false,
      },
      {
        source: "/app/aluno/perfil",
        destination: "/app/student/profile",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
