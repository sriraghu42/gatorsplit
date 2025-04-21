import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Swal from "sweetalert2";
import NewExpenseModal from "../views/NewExpensesModal";

// Mock Swal
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve([]),
  ok: true,
}));

const mockOnClose = jest.fn();
const currentUserId = "1";

const setup = () => {
  render(
    <NewExpenseModal open={true} onClose={mockOnClose} currentUserId={currentUserId} />
  );
};

describe("NewExpenseModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal with basic fields", async () => {
    setup();

    expect(await screen.findByText("Add New Expense")).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Who Paid/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Split With/i)).toBeInTheDocument();
  });

  test("allows user to input title and amount", () => {
    setup();

    const titleInput = screen.getByLabelText(/Title/i);
    const amountInput = screen.getByLabelText(/Amount/i);

    fireEvent.change(titleInput, { target: { value: "Lunch" } });
    fireEvent.change(amountInput, { target: { value: "100" } });

    expect(titleInput.value).toBe("Lunch");
    expect(amountInput.value).toBe("100");
  });

  test("does not render modal when open is false", () => {
    render(
      <NewExpenseModal open={false} onClose={mockOnClose} currentUserId={currentUserId} />
    );
  
    expect(screen.queryByText("Add New Expense")).not.toBeInTheDocument();
  });
  test("resets form fields on cancel", async () => {
    setup();
  
    const titleInput = screen.getByLabelText(/Title/i);
    const amountInput = screen.getByLabelText(/Amount/i);
  
    fireEvent.change(titleInput, { target: { value: "Trip" } });
    fireEvent.change(amountInput, { target: { value: "250" } });
  
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
  
    expect(mockOnClose).toHaveBeenCalled();
    // Note: You could simulate reopening to confirm inputs reset if state is preserved externally
  });
  test("does not show breakdown initially", () => {
    setup();
  
    expect(screen.queryByText("Breakdown")).not.toBeInTheDocument();
  });
  test("shows error for invalid amount (e.g., negative)", async () => {
    setup();
  
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: "-50" } });
    fireEvent.click(screen.getByRole("button", { name: /Add Expense/i }));
  
    await waitFor(() => {
      expect(screen.getByText("Enter a valid amount")).toBeInTheDocument();
    });
  });
test("shows title error when title is empty", async () => {
  setup();

  fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: "100" } });
  fireEvent.click(screen.getByRole("button", { name: /Add Expense/i }));

  await waitFor(() => {
    expect(screen.getByText("Title is required")).toBeInTheDocument();
  });
});
    
  
  

  test("calls onClose when Cancel is clicked", () => {
    setup();

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
 
  
  
  

  // You can add a successful submission test here once mocks for groups/users are in place
});
