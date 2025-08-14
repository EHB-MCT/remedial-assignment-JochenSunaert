import { useState } from 'react';
import '../../App.css';
import { supabase } from '../../client';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Login component allows existing users to log in.
 * 
 * @param {Object} props
 * @param {Function} props.setToken - Function to save session token in parent state
 * @param {Function} props.setUser - Function to save user object in parent state
 * 
 * @component
 * @example
 * return (
 *   <Login setToken={setToken} setUser={setUser} />
 * )
 */
const Login = ({ setToken, setUser }) => {
  const navigate = useNavigate();

  // State to track the input values of the login form
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  /**
   * Update formData state when input changes
   * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
   */
  function handleChange(event) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value
    }));
  }

  /**
   * Handle login form submission
   * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
   */
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        alert(error.message); // Show Supabase error message
      } else {
        // Save token and user info in sessionStorage
        sessionStorage.setItem("token", JSON.stringify(data.session.access_token));
        sessionStorage.setItem("user", JSON.stringify(data.user));

        // Save token and user info in React state
        setToken(data.session.access_token);
        setUser(data.user);

        navigate("/home"); // Redirect to home page after login
      }
    } catch (error) {
      alert(error.message); // Catch unexpected errors
    }
  }

  return (
<div className="auth-container">
  <div className="auth-card">
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />
      <input
        name="password"
        placeholder="Password"
        type="password"
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
    <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
  </div>
</div>

  );
};

export default Login;
