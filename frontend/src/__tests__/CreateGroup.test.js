import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CreateGroup from "../views/groups/CreateGroup";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

describe("CreateGroup Component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.spyOn(console, "error").mockImplementation(() => {}); // Mock console.error
    jest.spyOn(window, "alert").mockImplementation(() => {});  // Mock alert
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore mocks after each test
  });

  test("renders CreateGroup modal when open", async () => {
    await act(async () => {
      render(<CreateGroup open={true} onClose={jest.fn()} onGroupCreated={jest.fn()} />);
    });
    expect(screen.getByText("Create New Group")).toBeInTheDocument();
  });

//   test("fetches and displays users when modal opens", async () => {
//     fetchMock.mockResponseOnce(JSON.stringify([{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]));

//     await act(async () => {
//       render(<CreateGroup open={true} onClose={jest.fn()} onGroupCreated={jest.fn()} />);
//     });

//     await waitFor(() => expect(fetchMock).toHaveBeenCalled());

//     // Ensure fetched users appear in the dropdown
//     fireEvent.click(screen.getByLabelText("Add Users"));
//     expect(screen.getByText("Alice")).toBeInTheDocument();
//     expect(screen.getByText("Bob")).toBeInTheDocument();
//   });

  test("displays error if fetching users fails", async () => {
    fetchMock.mockReject(new Error("Failed to fetch users"));

    await act(async () => {
      render(<CreateGroup open={true} onClose={jest.fn()} onGroupCreated={jest.fn()} />);
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(console.error).toHaveBeenCalled();
  });

  test("does not allow group creation with empty fields", async () => {
    await act(async () => {
      render(<CreateGroup open={true} onClose={jest.fn()} onGroupCreated={jest.fn()} />);
    });

    fireEvent.click(screen.getByText("Create"));

    expect(window.alert).toHaveBeenCalledWith("Please enter a group name and select at least one user.");
  });

  test("creates a group successfully", async () => {
    fetchMock.mockResponseOnce(JSON.stringify([{ id: 1, name: "Alice" }]));
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const mockOnGroupCreated = jest.fn();
    const mockOnClose = jest.fn();

    await act(async () => {
      render(<CreateGroup open={true} onClose={mockOnClose} onGroupCreated={mockOnGroupCreated} />);
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText("Group Name"), { target: { value: "New Group" } });
    fireEvent.mouseDown(screen.getByLabelText("Add Users"));
    fireEvent.click(screen.getByText("Alice"));

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("http://localhost:8080/api/groups", expect.any(Object)));

    expect(mockOnGroupCreated).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("handles group creation error", async () => {
    fetchMock.mockResponseOnce(JSON.stringify([{ id: 1, name: "Alice" }]));
    fetchMock.mockReject(new Error("Failed to create group"));

    await act(async () => {
      render(<CreateGroup open={true} onClose={jest.fn()} onGroupCreated={jest.fn()} />);
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText("Group Name"), { target: { value: "New Group" } });
    fireEvent.mouseDown(screen.getByLabelText("Add Users"));
    fireEvent.click(screen.getByText("Alice"));

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Failed to create group. Please try again."));
  });
});
