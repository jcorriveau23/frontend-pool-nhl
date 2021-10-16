import React, {useState} from 'react'
import Modal from 'react-modal'

import { styleModal } from './styleModal';

import Cookies from 'js-cookie';

export const LoginModal = ({showLoginModal, setShowLoginModal, username, setUsername}) => {

    const [usernameInput, setUsernameInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const [msg, setMsg] = useState("")

    const login = () => {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: usernameInput, password: passwordInput})
        };
        fetch('auth/login', requestOptions)
            .then(response => response.json())
            .then(data => {
                if(data.success === "True"){
                    setMsg(data.message);
                    Cookies.set('token', data.token);
                    localStorage.setItem('username', usernameInput)
                    setUsername(usernameInput)
                    setShowLoginModal(false)
                }
                else{
                    setMsg(data.message);
                }
            });
    }

    const isLoggedRender = () => {
        if(username){
            return(
                <div class="modal_content">
                    <p>You are already logged in, you need to disconnect first.</p>
                    <button onClick={() => setShowLoginModal(false)}>Ok</button>
                </div>
            )
        }
        else{
            return(    
                <div class="modal_content">
                    <h1>Login</h1>
                    <form>
                        <p>Please fill in this form to login.</p>
                        <input type="text" placeholder="Enter Username" onChange={event => setUsernameInput(event.target.value)} required/>
                        <input type="password" placeholder="Enter Password" onChange={event => setPasswordInput(event.target.value)} required/> 
                    </form>
                    <button onClick={() => login()} >Login</button>
                    <p style={{color:'red'}}>{msg}</p>
                </div>
            )
        }
    }
    
    return (
        <Modal style={styleModal} isOpen={showLoginModal} onRequestClose={() => setShowLoginModal(false)}>
            {isLoggedRender()}
        </Modal>  
    )
}
    