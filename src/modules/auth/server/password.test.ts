import { describe, expect, it } from "@jest/globals";

import { hashPassword, verifyPassword } from "@/modules/auth/server/password";

describe("password hashing", () => {
  it("stores a salted scrypt hash and verifies the password", async () => {
    const firstHash = await hashPassword("correct horse battery staple");
    const secondHash = await hashPassword("correct horse battery staple");

    expect(firstHash).toMatch(/^scrypt-v1\$16384\$8\$1\$/);
    expect(firstHash).not.toBe(secondHash);
    await expect(verifyPassword("correct horse battery staple", firstHash)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", firstHash)).resolves.toBe(false);
  });

  it("rejects malformed and unsupported hashes", async () => {
    await expect(verifyPassword("password", "plaintext-password")).resolves.toBe(false);
    await expect(
      verifyPassword(
        "password",
        "scrypt-v1$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      ),
    ).resolves.toBe(false);
  });
});
