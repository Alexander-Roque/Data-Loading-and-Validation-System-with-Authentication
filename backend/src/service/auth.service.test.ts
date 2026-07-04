import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authRepository } from "../repository/auth.repository";
import { authService } from "./auth.service";

vi.mock("../repository/auth.repository", () => ({
  authRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
  },
}));

const mockedRepository = vi.mocked(authRepository);

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the user when the password is valid", async () => {
    const hashedPassword = await bcrypt.hash("secret123", 10);
    mockedRepository.findByEmail.mockResolvedValueOnce({
      id: 1,
      name: "Ana",
      email: "ana@example.com",
      password: hashedPassword,
      role: "admin",
    } as any);

    const user = await authService.validateCredentials("ana@example.com", "secret123");

    expect(user?.email).toBe("ana@example.com");
    expect(user?.role).toBe("admin");
  });
});
