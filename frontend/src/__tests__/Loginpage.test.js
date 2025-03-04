import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import LoginPage from "../views/Loginpage";

// Mock the loginUser function
const mockLoginUser = jest.fn();

const renderComponent = () => {
  return render(
    <AuthContext.Provider value={{ loginUser: mockLoginUser }}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("LoginPage Component", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test("renders LoginPage correctly", () => {
      renderComponent();
  
      expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email or Username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    });

  test("allows input changes", () => {
    renderComponent();

    const emailInput = screen.getByLabelText(/Email or Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("displays an error when trying to login with empty fields", async () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText("Please fill in all fields.")).toBeInTheDocument();
    });
  });

  test("calls loginUser function on valid form submission", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email or Username/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "securepassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith("user@example.com", "securepassword");
    });
  });

  test("displays error message when login fails", async () => {
    mockLoginUser.mockResolvedValue(false); // Simulate failed login

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email or Username/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
    });
  });

});
