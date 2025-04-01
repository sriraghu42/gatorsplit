// groupHelpers.js
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const confirmAndDeleteGroup = async (groupId) => {
  const result = await MySwal.fire({
    title: "Are you sure?",
    text: "This group will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`http://localhost:8080/api/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("authTokens"))}`,
        },
      });

      if (response.ok) {
        Swal.fire("Deleted!", "Group has been deleted.", "success");
        return true;
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete group.");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
      return false;
    }
  }

  return false;
};
