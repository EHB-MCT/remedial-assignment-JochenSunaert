import { useState } from 'react'
import '../../App.css'
import { supabase } from '../../client'
import { Link } from 'react-router-dom'

/**
 * SignUp component allows new users to create an account.
 * 
 * @component
 * @example
 * return (
 *   <SignUp />
 * )
 */
function SignUp() {
  // State to track the input values of the sign-up form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  console.log(formData); // Debug: log form data on each render

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
   * Handle form submission and register user with Supabase
   * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
   */
  async function handleSubmit(e) {
    e.preventDefault(); // Prevent default form submission

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            fullName: formData.fullName, // Store full name in Supabase user metadata
          },
        },
      });

      if (error) {
        alert(error.message); // Show Supabase error message
      } else {
        alert('Check your email for a verification link'); // Inform user to verify email
      }
    } catch (error) {
      alert(error.message); // Catch any unexpected errors
    }
  }

  return (
<div className="auth-container">
  <div className="auth-card">
    <form onSubmit={handleSubmit}>
      <input
        name="fullName"
        placeholder="Full Name"
        onChange={handleChange}
      />
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
    <p>Already have an account? <Link to="/">Login</Link></p>
  </div>
</div>
  );
}

export default SignUp;
