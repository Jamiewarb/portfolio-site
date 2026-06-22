export function getEnv(name: string): string | undefined {
  const value = process.env[name] ?? import.meta.env[name];
  return typeof value === 'string' ? value.replace(/\\$/, '').trim() : value;
}

export function requireEnv(name: string): string {
  const value = getEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
