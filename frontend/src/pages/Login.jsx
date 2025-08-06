import { useState } from 'react'
import '../App.css'
import { supabase } from '../client'
import { Link, useNavigate } from 'react-router-dom'

const Login = ({ setToken }) => {

    let Navigate = useNavigate()
  const [formData,setFormData] = useState({
    email: '',
    password: ''
  })

  console.log(formData)
  function handleChange(event) {
    setFormData((prevFormData)=>{
      return {
        ...prevFormData,
        [event.target.name]:event.target.value
      }
    })
  }

  async function handleSubmit(e){
e.preventDefault()
    try {

const { data, error } = await supabase.auth.signInWithPassword({  
    email: formData.email, 
     password: formData.password,}
)
   if (error) {
        alert(error.message); // Display the specific error from Supabase
      } else {
        console.log(data)
        {setToken(data)} // Set the token in the parent component
        Navigate("/home") // Redirect to home page on successful login


        // yrcy
        
      }
      
    } catch (error) {
        alert(error.message); 
    }

  }

  return (
    <>
    <div>
      <form onSubmit={handleSubmit}>
            
            <input name="email" placeholder='Email' onChange={handleChange}/>
            <input name="password" placeholder='Password' onChange={handleChange} type='password'/>
              <button type='submit'>
             Submit
            </button>
      </form>
      Dont have an account? <Link to="/signup">Sign Up</Link>

    </div>
    </>
  )
}

export default Login
