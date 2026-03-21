/**
 * Backend entrypoint target.
 *
 * This repository does not yet include Nest dependencies, so this file acts as
 * the canonical starting point for the future API bootstrap.
 */
export async function bootstrap() {
  return {
    app: "dojo-api",
    status: "bootstrap-pending",
  }
}
