import React, {useState} from 'react'
import Modal from 'react-modal'

import { styleModal } from './styleModal'
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
                        setMsg(data.message)
                    }
                    else{
                        setMsg(data.message)
                    }
                });
        }
        else{
            setMsg("Error, password and repeated password does not correspond!")
        }  
    }

    return (
        <Modal style={styleModal} isOpen={showRegisterModal} onRequestClose={() => setShowRegisterModal(false)}>
            <div class="modal_content">
                <h2>Register an account</h2>
                <form>
                    <p>Please fill in this form to create an account.</p>
                    <input type="text" placeholder="Enter Username" onChange={event => setUsername(event.target.value)} required/>
                    <input type="password" placeholder="Enter Password" onChange={event => setPassword(event.target.value)} required/>
                    <input type="password" placeholder="Repeat Password" onChange={event => setRepeatPassword(event.target.value)} required/>
                </form>
                <button onClick={() => register()} >Register</button>
                <p style={{color:'red'}}>{msg}</p>
            </div>
            <div>
                
            </div>
        </Modal>
    )
}
    
