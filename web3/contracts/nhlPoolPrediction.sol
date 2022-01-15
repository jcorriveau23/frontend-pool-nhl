// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract NHLGamePredictions is ChainlinkClient {
    using Chainlink for Chainlink.Request;
    
    address public owner;  // owner of the contract.

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    mapping(uint => Game) public predictionGames;  // map a game ID with the Game data structure.
    mapping(address => User) public users;         // map Ethereum address with the User data structure.
    uint[] public createdGames;
    uint numCreatedGames;

    // Events
    event SendBet(address indexed _from, uint indexed _id, bool _isHome, uint256 _value);
    event CreatePredictionMarket(address indexed _from, uint _id );

    constructor()
    {
        owner = msg.sender;
        numCreatedGames = 0;

        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = "d5270d1c311941d0b08bead21fea7747";
        fee = 0.1 * 10 ** 18; // (Varies by network and job)
    }

    struct Game {                                                   // id of the game of nhl api.
        bool isDone;                                                // indicate if the game is done and fund cand be claim by users.
        bool isCreated;                                             // indicate if this Game has been created by the contract.
        bool isHomeWin;                                             // tell us if the game has been won by the for or against team.
        uint256 accumulatedWeisHome;                                // amount of wei accumulated for "Home team win" prediction.
        uint256 accumulatedWeisAway;                                // amount of wei accumulated for "Away team win" prediction.
        mapping(address => uint256) accumulatedWeisHomeUsers;       // map a user with a his amount of weis sent to "Home team win" prediction.
        mapping(address => uint256) accumulatedWeisAwayUsers;       // map a user with a his amount of weis sent to "Away team win" prediction.
        uint8 homeScore;
    }

    struct User {
        uint[] bets;                                                // list game IDs where the user has a bet on.
        bool isCreated;                                             // indicate if the user has already been created by the contract.
    }

    function get_user_bet_amount(uint _id) public view returns(uint256 homeAmount, uint256 awayAmount){
        require(predictionGames[_id].isCreated == true, "The game is not created yet.");

        return (predictionGames[_id].accumulatedWeisHomeUsers[msg.sender], predictionGames[_id].accumulatedWeisAwayUsers[msg.sender]);
    }

    function createGame(uint _id) public {
        require( msg.sender == owner, "Only the owner is able to create a game." );

        Game storage newGame = predictionGames[_id];

        require(newGame.isCreated == false, "cannot create a game with the same id.");
        newGame.isDone = false;
        newGame.isCreated = true;
        newGame.isHomeWin = false; // this value is not valid until isDone == true;
        newGame.accumulatedWeisHome = 0;
        newGame.accumulatedWeisAway = 0;

        createdGames.push(_id);
        numCreatedGames++;

        emit CreatePredictionMarket(msg.sender, _id);
        // TODO: Add that the creator can already add his bet with the game creation.


    }
	
    function sendBet(uint _id, bool _isHomeWin) public payable {
        require(predictionGames[_id].isCreated == true, "The game needs to be created to make a bet.");

        uint256 amount = msg.value;

        bool isFirstBet = true;

        if( predictionGames[_id].accumulatedWeisHomeUsers[msg.sender] > 0 ||
            predictionGames[_id].accumulatedWeisAwayUsers[msg.sender] > 0)
            isFirstBet = false; // already made a bet on this game.

        if(_isHomeWin)   // "Home team win" prediction
        {
            predictionGames[_id].accumulatedWeisHome += amount;
            predictionGames[_id].accumulatedWeisHomeUsers[msg.sender] += amount;
        }
        else            // "Away team win" prediction
        {
            predictionGames[_id].accumulatedWeisAway += amount;
            predictionGames[_id].accumulatedWeisAwayUsers[msg.sender] += amount;
        }

        if(!users[msg.sender].isCreated)
        {
            User memory newUser;
            
            newUser.isCreated = true;

            users[msg.sender] = newUser;
        }

        if(isFirstBet)
            users[msg.sender].bets.push(_id);

        emit SendBet(msg.sender, _id, _isHomeWin, msg.value);
    }

    function get_all_user_bets() public view returns(uint[] memory bets){
        require(users[msg.sender].isCreated == true, "The user is not registered yet.");

        return users[msg.sender].bets;
    }

    function get_all_user_bets_length() public view returns(uint gameBetsCount){
        require(users[msg.sender].isCreated == true, "The user is not registered yet.");

        return users[msg.sender].bets.length;
    }

    function get_all_user_bet(uint i) public view returns(uint gameID){
        require(users[msg.sender].isCreated == true, "The user is not registered yet.");

        return users[msg.sender].bets[i];
    }

    function claimBet(uint _id) public view {
        uint256 amountToGiveClaimer = get_claim_amount(_id);
        amountToGiveClaimer;

        // transferTo(owner, msg.sender, amountToGiveClaimer);
    }

    function get_claim_amount(uint _id) public view returns(uint amount){
        require(predictionGames[_id].isDone == true, "The game result needs to be processed before enabling claiming.");
        require(predictionGames[_id].accumulatedWeisHome != 0 || predictionGames[_id].accumulatedWeisAway != 0, "The pool doesn't have fund at all.");
        require(users[msg.sender].isCreated, "User does not exist.");
        
        // the user take its part using this formula
        // [user amount in winning pool] / [total amount in winning pool] * [total amount in winning pool + total amount in losers pool]

        if(predictionGames[_id].isHomeWin)
        {
            require(predictionGames[_id].accumulatedWeisHomeUsers[msg.sender] > 0, "The user does not win anything.");

            return (predictionGames[_id].accumulatedWeisHomeUsers[msg.sender] * predictionGames[_id].accumulatedWeisAway / predictionGames[_id].accumulatedWeisHome) 
                 + (predictionGames[_id].accumulatedWeisHomeUsers[msg.sender] * predictionGames[_id].accumulatedWeisHome / predictionGames[_id].accumulatedWeisHome);
        }
        else
        {
            require(predictionGames[_id].accumulatedWeisAwayUsers[msg.sender] > 0, "The user does not win anything.");

            return  (predictionGames[_id].accumulatedWeisAwayUsers[msg.sender] * predictionGames[_id].accumulatedWeisAway / predictionGames[_id].accumulatedWeisAway) 
                  + (predictionGames[_id].accumulatedWeisAwayUsers[msg.sender] * predictionGames[_id].accumulatedWeisHome / predictionGames[_id].accumulatedWeisAway);
        }

           
        // transferTo(owner, msg.sender, amountToGiveClaimer);
    }

    function requestGameResult(uint _id) public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        //TODO: format a string for the game ID
        _id;
        // url_1 = "https://statsapi.web.nhl.com/api/v1/game/";
        // url_3 = "/feed/live";

        // bytes memory burl_1 = bytes(url_1);
        // bytes memory burl_2 = bytes(_id);
        // bytes memory burl_3 = bytes(url_3);

        // string memory url = string(burl_1.length + burl_2.length + burl_3.length);
        // bytes memory burl = bytes(url);

        // uint k = 0;
        // for (uint i = 0; i < burl_1.length; i++) burl[k++] = burl_1[i];
        // for (i = 0; i < burl_2.length; i++) burl[k++] = burl_2[i];
        // for (i = 0; i < burl_3.length; i++) burl[k++] = burl_3[i];

        // url = string(burl);

        // Set the URL to perform the GET request on
        request.add("get", "https://statsapi.web.nhl.com/api/v1/game/2021020661/feed/live");

        // Paths needed:
        // home team score     -> liveData.linescore.teams.home.goals
        // away team score     -> liveData.linescore.teams.away.goals
        // has shoutout        -> liveData.linescore.hasShootout
        // home shootout Infos -> liveData.linescore.shootoutInfo.home.scores
        // away shootout Infos -> liveData.linescore.shootoutInfo.away.scores
        
        request.add("path", "liveData.linescore.teams.home.goals");
        
        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }
    
    /**
     * Receive the response in the form of uint256
     */ 
    function fulfill(bytes32 _requestId, uint256 _score) public recordChainlinkFulfillment(_requestId)
    {
        predictionGames[2021020661].homeScore = _score;
        predictionGames[2021020661].isHomeWin = true;
        predictionGames[2021020661].isDone = true;
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}