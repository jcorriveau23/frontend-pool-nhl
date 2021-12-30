// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract NHLGamePredictions {

    address public owner;  // owner of the contract.

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
    }

    struct Game {                                                   // id of the game of nhl api.
        bool isDone;                                                // indicate if the game is done and fund cand be claim by users.
        bool isCreated;                                             // indicate if this Game has been created by the contract.
        bool isHomeWin;                                             // tell us if the game has been won by the for or against team.
        uint256 accumulatedWeisHome;                                // amount of wei accumulated for "Home team win" prediction.
        uint256 accumulatedWeisAway;                                // amount of wei accumulated for "Away team win" prediction.
        mapping(address => uint256) accumulatedWeisHomeUsers;       // map a user with a his amount of weis sent to "Home team win" prediction.
        mapping(address => uint256) accumulatedWeisAwayUsers;       // map a user with a his amount of weis sent to "Away team win" prediction.
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

    function claimBet(uint _id, bool isHomeWin) public view {
        require(predictionGames[_id].isDone == true, "The game result needs to be processed before enabling claiming.");

        uint256 amountToGiveClaimer = 0;

        if(isHomeWin)
            amountToGiveClaimer = predictionGames[_id].accumulatedWeisHomeUsers[msg.sender]; // TODO: need to calculate how much the user deserve here.
        else
            amountToGiveClaimer = predictionGames[_id].accumulatedWeisAwayUsers[msg.sender]; // TODO: need to calculate how much the user deserve here.

        // transferFrom(owner, msg.sender, amountToGiveClaimer);
    }
}