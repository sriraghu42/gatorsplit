import { confirmAndDeleteGroup } from "../utils/groupHelper";
import Swal from "sweetalert2";

jest.spyOn(Swal, "fire");

describe("confirmAndDeleteGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("authTokens", JSON.stringify("mock_token"));
  });

  test("deletes group when confirmed", async () => {
    Swal.fire
      .mockResolvedValueOnce({ isConfirmed: true })
      .mockResolvedValueOnce();

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });

    const success = await confirmAndDeleteGroup(123);

    expect(success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/groups/123",
      expect.objectContaining({ method: "DELETE" })
    );
    expect(Swal.fire).toHaveBeenCalledWith("Deleted!", "Group has been deleted.", "success");
  });

  test("cancels deletion when user rejects dialog", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });

    const success = await confirmAndDeleteGroup(123);

    expect(success).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows error alert when deletion fails", async () => {
    Swal.fire
      .mockResolvedValueOnce({ isConfirmed: true })
      .mockResolvedValueOnce();

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      text: async () => "Server error",
    });

    const success = await confirmAndDeleteGroup(456);

    expect(success).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith("Error", "Server error", "error");
  });
});
