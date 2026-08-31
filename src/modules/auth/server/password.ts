import "server-only";

import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";

const HASH_VERSION = "scrypt-v1";
const KEY_LENGTH = 64;
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const MAX_MEMORY = 32 * 1024 * 1024;

function deriveKey(
  password: string,
  salt: Buffer,
  cost: number,
  blockSize: number,
  parallelization: number,
) {
  return new Promise<Buffer>((resolve, reject) => {
    nodeScrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: cost, r: blockSize, p: parallelization, maxmem: MAX_MEMORY },
      (error, derivedKey) => (error ? reject(error) : resolve(derivedKey)),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt, COST, BLOCK_SIZE, PARALLELIZATION);

  return [
    HASH_VERSION,
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const [version, costText, blockSizeText, parallelizationText, saltText, hashText, ...rest] =
    encodedHash.split("$");
  const cost = Number(costText);
  const blockSize = Number(blockSizeText);
  const parallelization = Number(parallelizationText);

  if (
    version !== HASH_VERSION ||
    rest.length > 0 ||
    cost !== COST ||
    blockSize !== BLOCK_SIZE ||
    parallelization !== PARALLELIZATION
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(saltText, "base64url");
    const expectedHash = Buffer.from(hashText, "base64url");
    if (salt.length !== 16 || expectedHash.length !== KEY_LENGTH) return false;

    const actualHash = await deriveKey(password, salt, cost, blockSize, parallelization);

    return timingSafeEqual(actualHash, expectedHash);
  } catch {
    return false;
  }
}
