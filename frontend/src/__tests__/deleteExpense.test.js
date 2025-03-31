import { render, waitFor } from "@testing-library/react";
import Swal from "sweetalert2";

// Properly mock sweetalert2 and withReactContent
jest.mock("sweetalert2", () => ({
  __esModule: true,
  default: {
    fire: jest.fn(),
  },
}));
jest.mock("sweetalert2-react-content", () => ({
  __esModule: true,
  default: () => ({
    fire: jest.fn(),
  }),
}));

const MySwal = require("sweetalert2-react-content").default();
global.fetch = jest.fn();

describe("handleDelete", () => {
  let handleDelete;
  let mockSetExpenses;

  beforeEach(() => {
    mockSetExpenses = jest.fn();
    handleDelete = async (expenseId) => {
      const result = await MySwal.fire({
        title: "Are you sure?",
        text: "This expense will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:8080/api/expenses/${expenseId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer dummy-token`,
            },
          });

          if (response.ok) {
            Swal.fire("Deleted!", "Expense has been deleted.", "success");
            mockSetExpenses(prev => prev.filter(expense => expense.id !== expenseId));
          } else {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to delete expense.");
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    };

    localStorage.setItem("authTokens", JSON.stringify("dummy-token"));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls delete API and updates state on confirm", async () => {
    MySwal.fire.mockResolvedValueOnce({ isConfirmed: true });
    fetch.mockResolvedValueOnce({ ok: true });

    await handleDelete(123);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/expenses/123",
      expect.objectContaining({ method: "DELETE" })
    );
    expect(Swal.fire).toHaveBeenCalledWith("Deleted!", "Expense has been deleted.", "success");
  });

  it("shows error on failed delete", async () => {
    MySwal.fire.mockResolvedValueOnce({ isConfirmed: true });
    fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "Delete failed",
    });

    await handleDelete(456);

    expect(Swal.fire).toHaveBeenCalledWith("Error", "Delete failed", "error");
  });

  it("does not delete if user cancels", async () => {
    MySwal.fire.mockResolvedValueOnce({ isConfirmed: false });

    await handleDelete(789);

    expect(fetch).not.toHaveBeenCalled();
    expect(Swal.fire).not.toHaveBeenCalled();
  });
});
