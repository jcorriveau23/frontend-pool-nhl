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
                }
                else{
                    setMsg(data.message);
                }
            });
    }

    const isLoggedRender = () => {
        if(username){
            return(
                <div>
                    <h1>You are already logged in!</h1>
                    <button onClick={() => setShowLoginModal(false)}>Ok</button>
                </div>
            )
        }
        else{
            return(    
                <div class="modal_content">
                    <h2>Please Login.</h2>
                    <form>
                        <p style={{color:'red'}}>{msg}</p>
                        <label><b>Username</b></label>
                        <input type="text" placeholder="Enter Username" onChange={event => setUsernameInput(event.target.value)} required/>

                        <label><b>Password</b></label>
                        <input type="password" placeholder="Enter Password" onChange={event => setPasswordInput(event.target.value)} required/>
                        
                    </form>
                    <button onClick={() => login()} >Login</button>
                    <button onClick={() => setShowLoginModal(false)}>Cancel</button>
                </div>
            )
        }
    }
    
    return (
        <Modal style={styleModal} isOpen={showLoginModal} onRequestClose={() => setShowLoginModal(false)}>
            
            <div>
                {isLoggedRender()}
                
            </div>
        </Modal>
        
    )
}
    