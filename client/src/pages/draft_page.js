// get the draft and display it on this page for a year

import React, { useState, useEffect } from 'react';
import { Link, useLocation} from "react-router-dom";

// Loader
import ClipLoader from "react-spinners/ClipLoader"

// images
import logos from "../components/img/images" 

function DraftPage() {

    const [draftInfo, setDraftInfo] = useState(null)
    const [prevYear, setPrevYear] = useState("")
    const [availableYears, setAvailableYears] = useState(null)
    const location = useLocation()

    var year = window.location.pathname.split('/').pop()
    
    useEffect(() => {
        if(prevYear !== year && !isNaN(year))
        {
            fetch("https://statsapi.web.nhl.com/api/v1/draft/" + year, { // https://statsapi.web.nhl.com/api/v1/draft/2021
                method: 'GET',
            })
            .then(response => response.json())
            .then(draftInfo => {
                console.log(draftInfo)
                setDraftInfo(draftInfo)
            })
            .catch(error => {alert('Error! ' + error)})

            setPrevYear(year)
        }
        else
        {
            setDraftInfo(null)
            setPrevYear("")
        }
            
        var years = []
        for(var i = 2021; i > 1979; i--){
            years.push(i)
        }
        // console.log(years)

        setAvailableYears(years)

    }, [location]); // eslint-disable-line react-hooks/exhaustive-deps
    
    const render_round = (roundInfo, i) => {
        return(
            <div key={i}>
               <table  className="content-table">
                    <thead>
                        <tr>
                            <th colSpan="3">Round #: {roundInfo.round}</th>
                        </tr>
                        <tr>
                            <th>#</th>
                            <th>Team</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roundInfo.picks.map( (pick, i) => {
                            return(
                                <tr key={i}>  
                                    <td>{pick.pickOverall}</td> 
                                    <td><img src={logos[ pick.team.name ]} alt="" width="30" height="30"></img></td>  
                                    {
                                        pick.prospect.id > 0?
                                            <td><Link to={"/playerInfo/"+ pick.prospect.id} style={{ textDecoration: 'none', color: "#000099" }}>{pick.prospect.fullName}</Link></td>
                                            : <td>{pick.prospect.fullName}</td>
                                    }                              
                                    
                                </tr>
                            )                       
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

    if( draftInfo && draftInfo.drafts.length > 0)
    { 
        return(
            <div>
                <h1>Draft year : {draftInfo.drafts[0].draftYear}</h1>
                {
                    draftInfo.drafts[0].rounds.map((round, i) => {
                        return render_round(round, i)
                    })
                }
            </div>
        )
    }
    else if(!isNaN(year) && year !== "")
    {
        return(
            <div>
                <h1>Trying to fetch draft picks data from nhl api...</h1>
                <ClipLoader color="#fff" loading={true} size={75}/>
            </div>
        )
    }
    else if(availableYears){
        console.log(availableYears)
        return(
            <div>
                <table>
                    <tbody>
                        {availableYears.map((year, i) => {
                            return <tr key={i}><Link to={"/draft/" + year}><td>{year}</td></Link></tr>
                        })}
                    </tbody>
                </table>
                
            </div>
        )
    }
    else{
        return <h1>Preparing the page...</h1>
    }
  }

  export default DraftPage;