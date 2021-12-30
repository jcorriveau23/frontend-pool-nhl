import React, { useState, useEffect } from 'react';

function MyGameBetsPage(user, contract) {

    const [userData, setUserData] = useState(null)

    useEffect(() => {
        if (user) {

        }
    },[user]); // eslint-disable-line react-hooks/exhaustive-deps
    
    if(user){
        return(
            <h1>My Bets Page</h1>
        )
    }
    else
        return(<h1>You are not connected.</h1>);
   

    
  
  }
  export default MyGameBetsPage;