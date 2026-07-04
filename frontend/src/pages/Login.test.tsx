import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));

vi.mock("../services/api", () => ({
  default: {
    post: mockPost,
  },
}));

describe("Login", () => {
  beforeEach(() => {
    mockPost.mockReset();
    sessionStorage.clear();
  });

  it("sends the credentials and stores the current user", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        data: {
          user: {
            id: 1,
            name: "Ana",
            email: "ana@example.com",
            role: "admin",
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText("admin@example.com"), "ana@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/login", {
        email: "ana@example.com",
        password: "secret123",
      });
    });

    expect(sessionStorage.getItem("user")).toContain("Ana");
  });

  it("shows an error when the credentials are invalid", async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { message: "Credenciales inválidas" } },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText("admin@example.com"), "bad@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Credenciales inválidas")).toBeTruthy();
  });
});
