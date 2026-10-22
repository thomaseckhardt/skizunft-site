/**
 * Reads a server-only variable at runtime. Secrets are read from
 * `process.env` instead of `import.meta.env`, so Vite never inlines them
 * into a build.
 */
export function requireServerEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} environment variable is not set`)
  return value
}
