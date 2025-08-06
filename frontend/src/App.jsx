import React, {useState,} from "react";
import { SignUp, Login, HomePage } from "./pages";
import { Routes, Route } from "react-router-dom";
import { use } from "react";
import { useEffect } from "react";

const App = () => {

  const [token, setToken] = useState(false);

  if (token) {
    sessionStorage.setItem("token", JSON.stringify(token));
  }

useEffect(() => {
  if (sessionStorage.getItem("token")) {
    let data = JSON.parse(sessionStorage.getItem("token"));
    setToken(data);
  }
}, []);

  return (
    <div>
      <Routes>
        
        <Route path="/" element={<Login setToken={setToken}/>} />
        <Route path="/signup" element={<SignUp />} />
        {token?<Route path="/home" element={<HomePage token={token} />} />:''}
      </Routes>
    </div>
  );
}

export default App;