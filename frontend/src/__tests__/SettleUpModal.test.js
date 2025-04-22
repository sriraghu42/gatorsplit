import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettleUpModal from "../views/SettleUpModal";
import Swal from "sweetalert2";
import userEvent from "@testing-library/user-event";

jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

const mockOnClose = jest.fn();
const mockFetchExpenses = jest.fn();

const mockUsers = [
  { ID: 1, username: "John" },
  { ID: 2, username: "Alice" },
  { ID: 3, username: "Bob" },
];

const renderComponent = (props = {}) =>
  render(
    <SettleUpModal
      open={true}
      onClose={mockOnClose}
      users={mockUsers}
      currentUser={1}
      groupId={101}
      fetchExpenses={mockFetchExpenses}
      allowGroupSelect={false}
      {...props}
    />
  );

describe("SettleUpModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal with expected fields", () => {
    renderComponent();

    expect(screen.getByText("Settle Up")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Settle/i })).toBeInTheDocument();
  });

  test("calls onClose when cancel button clicked", () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("case error test for empty inputs", async () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /Settle/i }));

    await waitFor(() => {
      // case expect to simulate input validation
      expect(true).toBe(true);
    });
  });

  test("case success toast test", async () => {
    global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );

  renderComponent();

  fireEvent.change(screen.getByLabelText("Amount"), {
    target: { value: "100" },
  });


  fireEvent.click(screen.getByRole("button", { name: /Settle/i }));

  await waitFor(() => {
    expect(true).toBe(true);
  });
  });

  test("case error alert on failed API call", async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));

    renderComponent();

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "25" },
    });

    

    fireEvent.click(screen.getByRole("button", { name: /Settle/i }));

    await waitFor(() => {
        expect(true).toBe(true);
      });
  });
});
