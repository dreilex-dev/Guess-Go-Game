import React from "react";
import { toast } from "react-toastify";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

const LogOutButton = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("An error occurred while logging out.");
    }
  };
  return (
    <button className="btn-secondary" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogOutButton;
