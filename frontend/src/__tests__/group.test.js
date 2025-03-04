import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Groups from "../views/groups/groups";

// Ensure `fetch` is mocked globally
beforeAll(() => {
  global.fetch = jest.fn();
});

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe("Groups Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("authTokens", JSON.stringify("mock_token"));
  });

  test("fetches and displays groups correctly", async () => {
    global.fetch.mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        json: async () => [{ id: 1, name: "Trip Expenses" }],
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <Groups />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText(/Trip Expenses/i)).toBeInTheDocument();
  });

  test("shows loading state initially", async () => {
    global.fetch.mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        json: async () =>
          new Promise((resolve) => setTimeout(() => resolve([{ id: 1, name: "Trip Expenses" }]), 1000)),
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <Groups />
        </MemoryRouter>
      );
    });

    expect(screen.queryByRole("progressbar")).toBeInTheDocument();
  });

  test("navigates to a group when selected", async () => {
    global.fetch.mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        json: async () => [{ id: 1, name: "Trip Expenses" }],
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <Groups />
        </MemoryRouter>
      );
    });

    const groupElement = await screen.findByText(/Trip Expenses/i);

    await act(async () => {
      fireEvent.click(groupElement);
    });

    expect(mockHistoryPush).toHaveBeenCalledWith("/groups/1");
  });

  test("handles API error when fetching groups", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Silence logs

    global.fetch.mockRejectedValueOnce(new Error("Failed to fetch groups"));

    await act(async () => {
      render(
        <MemoryRouter>
          <Groups />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching groups:",
        expect.any(Error)
      );
    });

    console.error.mockRestore(); // Restore after test
  });
});
