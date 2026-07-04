import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Register from "./Register";

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));

vi.mock("../services/api", () => ({
  default: {
    post: mockPost,
  },
}));

describe("Register", () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it("submits the registration payload", async () => {
    mockPost.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Juan");
    await userEvent.type(screen.getByPlaceholderText("juan@example.com"), "juan@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123");
    await userEvent.type(screen.getByPlaceholderText("25"), "25");
    await userEvent.click(screen.getByRole("button", { name: /registrarse/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/register", {
        name: "Juan",
        email: "juan@example.com",
        password: "password123",
        age: 25,
      });
    });
  });
});
