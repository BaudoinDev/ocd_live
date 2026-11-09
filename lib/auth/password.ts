import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// OWASP-listed scrypt parameters (N=2^16, r=8, p=2). They are stored with each hash so they can be raised later.
const COST = 65_536, BLOCK_SIZE = 8, PARALLELIZATION = 2, KEY_LENGTH = 32;

function derive(password: string, salt: Buffer, options: Required<Pick<ScryptOptions, "N" | "r" | "p">>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { ...options, maxmem: 256 * options.N * options.r }, (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, { N: COST, r: BLOCK_SIZE, p: PARALLELIZATION });
  return ["scrypt", COST, BLOCK_SIZE, PARALLELIZATION, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, N, r, p, salt, expected] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !expected) return false;
  const key = await derive(password, Buffer.from(salt, "base64url"), { N: Number(N), r: Number(r), p: Number(p) });
  const target = Buffer.from(expected, "base64url");
  return key.length === target.length && timingSafeEqual(key, target);
}

/** Spends the same time as a real check, so response time does not reveal whether an e-mail has an account. */
export async function burnPasswordCheck(password: string): Promise<void> {
  await derive(password, randomBytes(16), { N: COST, r: BLOCK_SIZE, p: PARALLELIZATION });
}
