import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import RegisterPage from "../views/RegisterPage";
import userEvent from "@testing-library/user-event";

// Mock the registerUser function
const mockRegisterUser = jest.fn();

const renderComponent = () => {
  return render(
    <AuthContext.Provider value={{ registerUser: mockRegisterUser }}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("RegisterPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders RegisterPage correctly", () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: /Create an Account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
  });

  test("allows input changes", () => {
    renderComponent();

    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput.value).toBe("testuser");
    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("displays an error when trying to register with empty fields", async () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText("All fields are required.")).toBeInTheDocument();
    });
  });

  test("calls registerUser function on valid form submission", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "securepassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith("testuser", "test@example.com", "securepassword");
    });
  });

  test("displays success message when registration is successful", async () => {
    mockRegisterUser.mockResolvedValue(true); // Simulate successful registration

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "newpassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText("Account created successfully! You can now log in.")).toBeInTheDocument();
    });
  });

  test("displays error message when registration fails", async () => {
    mockRegisterUser.mockRejectedValue(new Error("Registration failed")); // Simulate failed registration

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "baduser" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "baduser@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "badpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText("Registration failed")).toBeInTheDocument();
    });
  });

  
});
