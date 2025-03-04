import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { within } from "@testing-library/react";
import AddExpenseModal from "../views/AddExpensesModal";
import Swal from "sweetalert2";
import userEvent from "@testing-library/user-event";

// Mock Swal.fire to prevent actual alerts during tests
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

const mockOnClose = jest.fn();
const mockFetchExpenses = jest.fn();
const currentUser = { id: "1", name: "John Doe" };
const mockUsers = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Alice" },
  { id: "3", name: "Bob" },
];

const renderComponent = (open = true) => {
  return render(
    <AddExpenseModal
      open={open}
      onClose={mockOnClose}
      currentUser={currentUser}
      groupId={null}
      members={mockUsers}
      fetchExpenses={mockFetchExpenses}
    />
  );
};

describe("AddExpenseModal Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders AddExpenseModal correctly", () => {
    renderComponent();

    expect(screen.getByText("Add Expense")).toBeInTheDocument();
    expect(screen.getByLabelText(/Expense Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();

    // Validate multiple comboboxes exist
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBe(2);

    // Validate the "Who Paid?" dropdown
    expect(comboboxes[0]).toBeInTheDocument();

    // Validate the "Select Users" dropdown
    expect(comboboxes[1]).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Add expense/i })).toBeInTheDocument();
});



  test("allows input changes", () => {
    renderComponent();

    const titleInput = screen.getByLabelText(/Expense Title/i);
    const amountInput = screen.getByLabelText(/Amount/i);

    fireEvent.change(titleInput, { target: { value: "Dinner" } });
    fireEvent.change(amountInput, { target: { value: "50" } });

    expect(titleInput.value).toBe("Dinner");
    expect(amountInput.value).toBe("50");
  });

//   test("displays an error when submitting with empty fields", async () => {
//     renderComponent();

//     fireEvent.click(screen.getByRole("button", { name: /Add expense/i }));

//     await waitFor(() => {
//         expect(screen.getByText((content) => content.includes("Title is required"))).toBeInTheDocument();
//         expect(screen.getByText((content) => content.includes("Enter a valid amount"))).toBeInTheDocument();
//         expect(screen.getByText((content) => content.includes("Select at least one user"))).toBeInTheDocument();
//       });
      
//   });

//   test("calls fetchExpenses after successful expense submission", async () => {
//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         ok: true,
//         json: () => Promise.resolve({}),
//       })
//     );

//     renderComponent();

//     fireEvent.change(screen.getByLabelText(/Expense Title/i), {
//       target: { value: "Lunch" },
//     });
//     fireEvent.change(screen.getByLabelText(/Amount/i), {
//       target: { value: "30" },
//     });
//     fireEvent.change(screen.getByLabelText(/Who Paid/i), {
//       target: { value: "1" },
//     });
//     userEvent.click(screen.getByLabelText(/Select Users/i));
//     userEvent.click(screen.getByText("Alice"));
//     userEvent.click(screen.getByText("Bob"));
//     userEvent.click(screen.getByRole("button", { name: /Add expense/i }));

//     await waitFor(() => {
//       expect(mockFetchExpenses).toHaveBeenCalled();
//       expect(mockOnClose).toHaveBeenCalled();
//     });

//     // Check if SweetAlert was called
//     expect(Swal.fire).toHaveBeenCalledWith(
//       expect.objectContaining({ title: "Success", text: "Expense added successfully!" })
//     );
//   });



// test("displays error message on failed expense submission", async () => {
//     global.fetch = jest.fn(() => Promise.resolve({ ok: false }));

//     renderComponent();

//     fireEvent.change(screen.getByLabelText(/Expense Title/i), {
//       target: { value: "Dinner" },
//     });
//     fireEvent.change(screen.getByLabelText(/Amount/i), {
//       target: { value: "40" },
//     });

//     // Fix: Simulate dropdown interaction instead of fireEvent.change()
//     const whoPaidDropdown = screen.getAllByRole("combobox")[0]; // Select first combobox (Who Paid?)
//     userEvent.click(whoPaidDropdown); // Open dropdown
//     userEvent.click(screen.getByText("John Doe")); // Click option to select it

//     // Select users
//     const selectUsersDropdown = screen.getAllByRole("combobox")[1];
//     userEvent.click(selectUsersDropdown);
//     userEvent.click(screen.getByText("Alice"));

//     fireEvent.click(screen.getByRole("button", { name: /Add expense/i }));

//     await waitFor(() => {
//       expect(Swal.fire).toHaveBeenCalledWith(
//         expect.objectContaining({ title: "Error", text: "Failed to add expense!" })
//       );
//     });
// });


  test("calls onClose when cancel button is clicked", () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
