import { useState } from 'react'
import '../App.css'
import { supabase } from '../client'
import { Link, useNavigate } from 'react-router-dom'

const Login = ({ setToken, setUser }) => {  // accept setUser as prop too

  let navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  function handleChange(event) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({  
    email: formData.email, 
    password: formData.password,
});

if (error) {
  alert(error.message);
} else {
  // Store both session token and user in sessionStorage
  sessionStorage.setItem("token", JSON.stringify(data.session.access_token));
  sessionStorage.setItem("user", JSON.stringify(data.user));

  // Save them in React state
  setToken(data.session.access_token);
  setUser(data.user);

  navigate("/home");
}
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" placeholder="Password" onChange={handleChange} type="password" />
        <button type="submit">Submit</button>
      </form>
      Don't have an account? <Link to="/signup">Sign Up</Link>
    </div>
  );
};

export default Login;
