import React, { useState} from 'react'
import { Link } from "react-router-dom";

export const SearchPlayer = () => {

    const [searchResult, setSearchResult] = useState(null)
    
    const search_players = (searchValue) => {
        if(searchValue.length > 0)
        {
            fetch('https://nhl-pool-ethereum.herokuapp.com/https://suggest.svc.nhl.com/svc/suggest/v1/minplayers/' + searchValue + '/10')  // https://suggest.svc.nhl.com/svc/suggest/v1/minplayers/Crosby/10
            .then(response => response.json())
            .then(searchResult => {
                setSearchResult({...searchResult})
            })
            .catch(error => {
                console.log(error)
            })
        }
        else
            setSearchResult(null)
    }

    return (
        <div>
            <input type="search" placeholder="Player name..." onChange={event => search_players(event.target.value)}/>
            <div className='inFront'>
                <table>
                    <tbody>
                        {
                            searchResult?.suggestions?.map((player, i) => {
                                var p = player.split("|")
                                return <tr><td><Link to={"/playerInfo/"+ p[0]}> {p[2] + " " + p[1]}</Link></td></tr>
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}