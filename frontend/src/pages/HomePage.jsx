import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = ({token}) => {

    let navigate = useNavigate();
    function handleLogout() {
        
        sessionStorage.removeItem("token"); // Clear the token from session storage
        navigate("/")
        
    }
    return (
        <div>
            <h1>Welcome to the Home Page, {token.user.user_metadata.fullName}</h1>
            <button onClick={handleLogout}>Logout</button>
            
        
        </div>
    );
}
export default HomePage;