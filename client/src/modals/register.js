import React, {useState} from 'react'
import Modal from 'react-modal'

export const RegisterModal = ({showRegisterModal, setShowRegisterModal}) => {
 
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [repeatPassword, setRepeatPassword] = useState("")
    const [msg, setMsg] = useState("")

    const register = () => {
        if(password === repeatPassword){
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: username, email: "TODO", phone: "TODO", password: password})
            };
            fetch('auth/register', requestOptions)
                .then(response => response.json())
                .then(data => {
                    if(data.success === "True"){
                        //this.setState({msg: data.message})
                    }
                    else{
                        //this.setState({msg: data.error})
                    }
                });
        }
        else{
            setMsg("Error, password and repeated password does not correspond!")
        }  
    }

    return (
        <Modal isOpen={showRegisterModal} onRequestClose={() => setShowRegisterModal(false)}>
            <h2>Register an account.</h2>
            <div>
                <form>
                    <p>Please fill in this form to create an account.</p>
                    <p style={{color:'red'}}>{msg}</p>
                    <label><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" onChange={event => setUsername(event.target.value)} required/>

                    <label><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" onChange={event => setPassword(event.target.value)} required/>

                    <label><b>Repeat Password</b></label>
                    <input type="password" placeholder="Repeat Password" onChange={event => setRepeatPassword(event.target.value)} required/>
                    
                    <p>By creating an account you agree to our <a href="#">Terms & Privacy</a>.</p>
                </form>
                <button onClick={() => register()} >Register</button>
            </div>
            <div>
                <button onClick={() => setShowRegisterModal(false)}></button>
            </div>
        </Modal>
    )
}
    
