// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract NHLGamePredictions {

    address public owner;  // owner of the contract.

    mapping(uint => Game) public predictionGames;  // map a game ID with the Game data structure.
    mapping(address => User) public users;         // map Ethereum address with the User data structure.
    uint[] public createdGames;
    uint numCreatedGames;

    constructor()
    {
        owner = msg.sender;
        numCreatedGames = 0;
    }

    struct Game {
        uint id;                                                    // id of the game of nhl api.
        bool isDone;                                                // indicate if the game is done and fund cand be claim by users.
        bool isCreated;                                             // indicate if this Game has been created by the contract.
        bool isForWin;                                              // tell us if the game has been won by the for or against team.
        uint256 accumulatedWeisFor;                                 // amount of wei accumulated for "For team win" prediction.
        uint256 accumulatedWeisAgainst;                             // amount of wei accumulated for "Against team win" prediction.
        mapping(address => uint256) accumulatedWeisForUsers;        // map a user with a his amount of weis sent to "For team win" prediction.
        mapping(address => uint256) accumulatedWeisAgainstUsers;    // map a user with a his amount of weis sent to "Against team win" prediction.
    }

    struct User {
        uint[] bets;                                                // list game IDs where the user has a bet on.
        bool isCreated;                                             // indicate if the user has already been created by the contract.
    }

    function createGame(uint _id) public {
        require( msg.sender == owner, "Only the owner is able to create a game." );

        Game storage newGame = predictionGames[_id];

        require(newGame.isCreated == false, "cannot create a game with the same id.");
        newGame.id = _id;
        newGame.isDone = false;
        newGame.isCreated = true;
        newGame.isForWin = false; // this value is not valid until isDone == true;
        newGame.accumulatedWeisFor = 0;
        newGame.accumulatedWeisAgainst = 0;

        createdGames.push(_id);
        numCreatedGames++;
        // TODO: Add that the creator can already add his bet with the game creation.
    }
	
    function sendBet(uint _id, bool _isForWin) public payable {
        require(predictionGames[_id].isCreated == true, "The game needs to be created to make a bet.");

        uint256 amount = msg.value;

        if(_isForWin)   // "For team win" prediction
        {
            predictionGames[_id].accumulatedWeisFor += amount;
            predictionGames[_id].accumulatedWeisForUsers[msg.sender] += amount;
        }
        else            // "Against team win" prediction
        {
            predictionGames[_id].accumulatedWeisAgainst += amount;
            predictionGames[_id].accumulatedWeisAgainstUsers[msg.sender] += amount;
        }

        if(!users[msg.sender].isCreated)
        {
            User memory newUser;
            
            newUser.isCreated = true;

            users[msg.sender] = newUser;
            
        }

        users[msg.sender].bets.push(_id);
    }

    function claimBet(uint _id, bool isForWin) public view {
        require(predictionGames[_id].isDone == true, "The game result needs to be processed before enabling claiming.");

        uint256 amountToGiveClaimer = 0;

        if(isForWin)
            amountToGiveClaimer = predictionGames[_id].accumulatedWeisForUsers[msg.sender]; // TODO: need to calculate how much the user deserved here.
        else
            amountToGiveClaimer = predictionGames[_id].accumulatedWeisAgainstUsers[msg.sender]; // TODO: need to calculate how much the user deserved here.

        // transferFrom(owner, msg.sender, amountToGiveClaimer);
    }
}