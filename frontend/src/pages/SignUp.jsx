import { useState } from 'react'
import '../App.css'
import { supabase } from '../client'
import { Link } from 'react-router-dom'

function SignUp() {
  const [formData,setFormData] = useState({
    fullName: '',
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

          const{ data, error} = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          fullName: formData.fullName,
        }
      }
    }
  )
   if (error) {
        alert(error.message); // Display the specific error from Supabase
      } else {
        alert('Check your email for a verification link');
      }
      
    } catch (error) {
        alert(error.message); 
    }

  }

  return (
    <>
    <div>
      <form onSubmit={handleSubmit}>
              <input name="fullName" placeholder='fullname' onChange={handleChange}/>
            <input name="email" placeholder='Email' onChange={handleChange}/>
            <input name="password" placeholder='Password' onChange={handleChange} type='password'/>
              <button type='submit'>
             Submit
            </button>
      </form>
      Already have an account? <Link to="/">Login</Link>

    </div>
    </>
  )
}

export default SignUp
