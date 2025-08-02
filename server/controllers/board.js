const fs = require('fs')

async function retrieveBoards(Board){
    const boards = await Board.find()
    if (boards) {
        return boards
    }
    const err = new Error("Failed to fetch boards")
    err.status = 404
    throw err
}

async function createBoard(Board, boardData){
    const newBoard = new Board(boardData);
    const saved = await newBoard.save();
    console.log("Saved board:", saved);
    return saved; 
    
}

async function getBoardsByCategory(Board, category) {
    const board = await Board.find({category});
    return board
}

module.exports = {retrieveBoards, createBoard, getBoardsByCategory};