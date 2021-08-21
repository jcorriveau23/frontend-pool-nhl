import React, {useState} from 'react'
import Modal from 'react-modal'

import Cookies from 'js-cookie';

export const LoginModal = ({showLoginModal, setShowLoginModal}) => {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [msg, setMsg] = useState("")

    const login = () => {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: username, password: password})
        };
        fetch('auth/login', requestOptions)
            .then(response => response.json())
            .then(data => {
                if(data.success === "True"){
                    setMsg(data.message);
                    Cookies.set('token', data.token);
                    this.props.history.push('/pool_list');
                }
                else{
                    setMsg(data.message);
                }
            });

    }
    
    return (
        <Modal isOpen={showLoginModal} onRequestClose={() => setShowLoginModal(false)}>
            <h2>Please Login.</h2>
            <div>
                <form>
                    <p style={{color:'red'}}>{msg}</p>
                    <label><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" onChange={event => setUsername(event.target.value)} required/>

                    <label><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" onChange={event => setPassword(event.target.value)} required/>
                    
                </form>
                <button onClick={() => login()} >Login</button>
            </div>
            <div>
                <button onClick={() => setShowLoginModal(false)}></button>
            </div>
        </Modal>
        
    )
}
    