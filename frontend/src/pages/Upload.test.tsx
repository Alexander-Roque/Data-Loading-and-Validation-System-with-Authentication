import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Upload from "./Upload";

const { mockGet, mockPost } = vi.hoisted(() => ({ mockGet: vi.fn(), mockPost: vi.fn() }));

vi.mock("../services/api", () => ({
  default: {
    get: mockGet,
    post: mockPost,
  },
}));

describe("Upload", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
  });

  it("disables the upload action for non-admin users", async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: { user: { id: 3, name: "Luis", email: "luis@example.com", role: "user" } } },
    });
    mockGet.mockResolvedValueOnce({ data: { data: [] } });

    render(
      <MemoryRouter>
        <Upload />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Sesión activa:/i)).toBeTruthy();
    const button = screen.getByRole("button", { name: /upload file/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("keeps the upload button disabled until a file is selected", async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: { user: { id: 4, name: "Marta", email: "marta@example.com", role: "admin" } } },
    });
    mockGet.mockResolvedValueOnce({ data: { data: [] } });

    render(
      <MemoryRouter>
        <Upload />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Sesión activa:/i)).toBeTruthy();
    expect((screen.getByRole("button", { name: /upload file/i }) as HTMLButtonElement).disabled).toBe(true);
  });
});
