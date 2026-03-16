import { useNavigate } from "react-router-dom";
import React from "react";
const Logout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/user/logout", {
                method: "POST",
                credentials: "include"
            });

            navigate("/");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <button className="border border-black rounded-full absolute ml-[1300px] cursor-pointer" onClick={handleLogout}>
            Logout
        </button>
    );
};

export default Logout;
