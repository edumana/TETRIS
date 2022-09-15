/*-------------------------------- Tetris game --------------------------------*/

/*
|
|
|         //TODO: Create controls for mobile usage.
|
|
*/




/*-------------------------------- Constants --------------------------------*/

/*
|
|
|         Defines basic TETRIS shapes described in matrix form. 
|
|
*/

const I = math.matrix([
  [0,1,0,0],
  [0,1,0,0],
  [0,1,0,0],
  [0,1,0,0]])

const J = math.matrix([
  [0,0,1],
  [0,0,1],
  [0,1,1]])

const L = math.matrix([
  [1,0,0],
  [1,0,0],
  [1,1,0]])

const O = math.matrix([
  [1,1],
  [1,1]])

const S = math.matrix([
  [0,1,1],
  [1,1,0],
  [0,0,0]])

const T = math.matrix([
  [0,1,0],
  [0,1,1],
  [0,1,0]])

const Z = math.matrix([
  [1,1,0],
  [0,1,1],
  [0,0,0]]) 

const R4 = math.matrix([
    [0,0,0,1], 
    [0,0,1,0],
    [0,1,0,0],
    [1,0,0,0]])
 
const R3 = math.matrix([
      [0,0,1],
      [0,1,0], 
      [1,0,0]])


/*
|
|
|         HTML Elements. 
|
|
*/

const introModal = new bootstrap.Modal(document.getElementById('intro-modal'))
const startButton = document.getElementById('start-button')
const radioButtons = document.querySelectorAll('input[name="options"]')
const customBuilder = document.getElementById('custom-builder')
const htmlBoard = document.getElementById('main-board')
const sectionToHide = document.getElementById('section-to-hide')
const playAgainButton = document.getElementById('play-again-button')
const title = document.getElementById('title')
const subtitle = document.getElementById('subtitle')
const score = document.getElementById('score')
const finalScore = document.getElementById('final-score')


/*-------------------------------- Classes --------------------------------*/
/*
|
|
|   Class Shape: Template for making a tetris shape. Provides methods for transforming and moving the shape.
|         shape: takes a matrix shape defined in Constants section
|    shift[X,Y]: defines an array to shift the placement of the shape in the X and Y direcions. 
|              
|         
|
*/

class Shape {
  constructor(shape) {
    this.shape = shape
    this.shift = [0,0]
  }

  //Takes as input a game object to check if post-rotation coordinates are empty. If post-rotation coordiantes are taken, method rotates the shape back to it's original position. 
  //TODO: Certain rotations close to the edges, specially the bottom edge, accesses undefined memory.  
  //TODO: Creating a subsequent game accesses undefined memory.
  rotate(game) {
    
    //Rotate clockwise 90 deg.
    if (math.size(this.shape)._data[0] === 4) {
      this.shape = math.multiply(math.transpose(this.shape), R4)
    } else if (math.size(this.shape)._data[0] === 3) {
      this.shape = math.multiply(math.transpose(this.shape), R3)
    }

    //Rotate back if collision found.
    if(game.checkCollision(this.getCoordinates(), game.board)){
      if (math.size(this.shape)._data[0] === 4) {
        this.shape = math.multiply(R4,math.transpose(this.shape))
      } else if (math.size(this.shape)._data[0] === 3) {
        this.shape = math.multiply(R3, math.transpose(this.shape))
      }
    }

    //If rotation brings the shape outside of the board, correct to bring back 
    while(this.getLeftmost() < 0) this.moveRight()
    while(this.getRightmost() > boundary - 1) this.moveLeft()


    //Update the board with the new coordinates. 1 is used as a placeholder for taken space by a shape
    game.updateCoords('1')
  }

//Returns the current coordinates of the shape.
  getCoordinates() {
    let coords = []
    let shift = this.shift
    this.shape.forEach(function (value, index) {
      if(value) coords.push(math.add(index, shift))
    })
    return coords
  }

  //Shifts X coordinate by 1. If collision is detected, moves the shape back
  moveRight(game) { 

    console.log('holi')
    if (this.getRightmost() < boundary - 1) this.shift[1] += 1
    if(game.checkCollision(this.getCoordinates(), game.board)){
      this.shift[1] -= 1
    } else {
      game.updateCoords('1')
    }
  }
  //Shifts X coordinate by -1. If collision is detected, moves the shape back
  moveLeft(game) {
    if(this.getLeftmost() > 0) this.shift[1] -= 1
    if(game.checkCollision(this.getCoordinates(), game.board)){
      this.shift[1] += 1
    } else {
      game.updateCoords('1')
    }
  }

  //Returns rightmost edge of the shape
  getRightmost() {
    let xCords = []
    this.getCoordinates().forEach(function(value) {
      xCords.push(value[1])
    })
    return Math.max(...xCords) 
  }

  //Returns the leftmost edge of the shape
  getLeftmost() {
    let xCords = []
    this.getCoordinates().forEach(function(value) {
      xCords.push(value[1])
    })
    return Math.min(...xCords) 
  }

  //Returns the bottom edge of the shape
  getBottomEdge() {
    let xCords = []
    let edgeCoords = []
    this.getCoordinates().forEach(function (value) {
      xCords.push(value[0])
    })
    let max = Math.max(...xCords) 
    this.getCoordinates().forEach(function (value) {
      if (value[0] === max){
        edgeCoords.push(value)
      }
    })
    return edgeCoords
  }

  //Advances the shape in the board. Takes the game as input 
  fall(game){

    if (game.activeShape !== null){

      //Makes a copy of the board before the shape is moved in order to check for collisions. 
      const currentBoard = JSON.parse(JSON.stringify(game.board))
      this.shift[0] += 1

      if(this.getBottomEdge()[0][0] === length){
        this.shift[0] -= 1
        return
      } else if(!(game.checkCollision(this.getCoordinates(), currentBoard))){ 
        game.updateCoords('1')
        return
      } else {
        this.shift[0] -= 1
      }
    }
  }
}


/*
|
|
|    Class Game: Defines a game object. 
|         board: 2D array initialized to '0'
|   activeShape: The shape currently moving through the board. 
|   trailCoords: The coordinates of the trail left by the active shape.
|              
|         
|
*/

class Game {
  constructor(){
    this.board = new Array(length).fill('0').map(()=>new Array(boundary).fill('0'))
    this.activeShape = null
    this.trailCoords = null
  }

  //Places the shape in the board and stores the value of its coordinates in trailCoords.
  placeShape(shape){
    if(this.activeShape) delete this.activeShape
    this.activeShape = shape
    shape.getCoordinates().forEach(value => {
      this.board[value[0]][value[1]] = '1'
    })
    this.trailCoords = shape.getCoordinates()
    this.render()
  }

  //Clears the trail and updates the board to the new position of the active shape. Takes input 'str' which can be '1' for moving shapes or '*' for inactive shapes that have reached the bottom.
  updateCoords(str){
    this.clearTrail()
    this.activeShape.getCoordinates().forEach(value => {
      this.board[value[0]][value[1]] = str
    })
    this.trailCoords = this.activeShape.getCoordinates()
    this.render()
  }

  //Uses the stored coordinates of the shape to clear it's trail.
  clearTrail(){
    if (this.trailCoords){
      this.trailCoords.forEach(value => {
        this.board[value[0]][value[1]] = '0'
      })
    }
  }

  //Updates the html board with the values stored in the 2D array of the game object
  render(){
    for (let i = 0; i < this.board.length; i++){
      for (let j = 0; j < this.board[i].length; j++){
        let divElem = document.getElementById(`${i},${j}`)
        divElem.innerHTML = `${this.board[i][j]}`

        if(this.board[i][j] === '1'){
          divElem.style.backgroundColor = 'black'
          divElem.style.color = 'black'
        } else if(this.board[i][j] === '*'){
          divElem.style.backgroundColor = '#0d6efd'
          divElem.style.color = '#0d6efd'
        } else if(this.board[i][j] === '0'){
          divElem.style.backgroundColor = 'white'
          divElem.style.color = 'white'
        }
      }
    }
  }

  //Clears the game and deletes it in order to allow for the new game to begin.
  clear(){
    this.activeShape = null
    this.trailCoords = null
    this.board = null

    introModal.show()

    htmlBoard.innerHTML = ''
    finalScore.innerHTML = globalScore
    globalScore = 0
    finalScore.style.display = 'block'
    playAgainButton.style.display = 'block'
    sectionToHide.style.display = 'none'
    title.innerHTML = "You lost!"
    title.style.fontSize = '1.2em'
    subtitle.style.fontSize = '0.65em'
    subtitle.innerHTML = "Your final score: "
  }

  //checks for collisions by taking future placement of coordinates with a board. 
  //TODO Perhaps move this to the shape class
  checkCollision(futurePlacement, currentBoard) {

    let collision = false
    futurePlacement.forEach(value => {
      if(currentBoard[value[0]][value[1]] === '*') collision = true
    })
    return collision ? true : false
  }

  //Clears index of full row. Adds 100 to score each time.
  clearIndex(index) {

    globalScore += 100
    score.innerHTML = `${globalScore}`

    this.board[index].forEach((value, index, array) => {array[index] = '0'} )
    
    //Shifts the index of the rows by one to move the board
    for(let i = index; i > 0; i--){
      for(let j = 0; j < this.board[i].length; j++){
        this.board[i][j] = JSON.parse(JSON.stringify(this.board[i-1][j]))
      }
    }

    for(let i = 0; i < this.board[0].length; i++){
      this.board[0][i] = '0'
    }
    this.render() 
  } 

  //Steps one iteration of the game. 
  //Checks for losing condition
  //Checks if the active shape stopped moving to make it inactive and place a new shape into the board
  step() {
    if(this.activeShape !== null){
      let bottom1 = this.activeShape.getBottomEdge()
      this.activeShape.fall(this)
      let bottom2 = this.activeShape.getBottomEdge()

      //Lose condition
      if(this.board[0].some(value => value === '*')) this.clear()

      //Inactive shape condition
      if(bottom1[0][0] === bottom2[0][0]){ 
        this.updateCoords('*')
        this.board.forEach((value, index) => {
          if(value.reduce((prev,curr) => (prev === curr) ? prev : NaN) === '*') this.clearIndex(index) 
        })

        delete this.activeShape
        let shape = new Shape(shapes[Math.floor(Math.random()*shapes.length)])
        this.placeShape(shape)
      }
    }  
  } 
}

/*---------------------------- Variables  ----------------------------*/
/*
|
|
|    Defines the size of the board and shapes. C is the user's custom shape.
|              
|         
|
*/

let boundary = 6
let length = boundary * 2
let C = math.matrix([[1,0,1],[1,0,1],[0,0,0]])
let shapes = [I, J, L, O, S, T, Z, C]
let globalScore = 0

/*---------------------------- Event Listeners  ----------------------------*/
/*
|
|
|    Event listeners for buttons user input.
|              
|         
|
*/

//Starts the game 
startButton.addEventListener('click', function(e){
  let selectedSize
  for(const radioButton of radioButtons){
    if(radioButton.checked){
      selectedSize = radioButton.value
    }
  }
  introModal.hide()
  shapes[7] = C
  boundary = parseInt(selectedSize, 10)
  length = boundary * 2

  //Dynamically sets the dimensions of the html board.
  let reSize = -0.1*(selectedSize) + 4.1
  htmlBoard.style.gridTemplateColumns = `repeat(${boundary}, ${reSize}vmin)`
  htmlBoard.style.gridTemplateRows = `repeat(${length}, ${reSize}vmin)`
  score.innerHTML = 0

  playGame()
})

//Builds the user's custom shape with user input
//TODO Find more succint way to achieve this
customBuilder.addEventListener('click', function(e){
  let sq = document.getElementById(e.target.id).style
  switch (e.target.id) {
    case 'cus-0':
      C.get([0,0]) === 0 ? (C.set([0, 0],1), sq.backgroundColor = 'black') : (C.set([0, 0],0), sq.backgroundColor = 'white')
    break;
    case 'cus-1':
      C.get([0,1]) === 0 ? (C.set([0, 1], 1), sq.backgroundColor = 'black') : (C.set([0, 1],0), sq.backgroundColor = 'white')
    break;
    case 'cus-2':
      C.get([0,2]) === 0 ? (C.set([0, 2],1), sq.backgroundColor = 'black') : (C.set([0, 2],0), sq.backgroundColor = 'white')
    break;
    case 'cus-3':
      C.get([1,0]) === 0 ? (C.set([1, 0],1), sq.backgroundColor = 'black') : (C.set([1, 0],0), sq.backgroundColor = 'white')
    break;
    case 'cus-4':
      C.get([1,1]) === 0 ? (C.set([1, 1],1), sq.backgroundColor = 'black') : (C.set([1, 1],0), sq.backgroundColor = 'white')
    break;
    case 'cus-5':
      C.get([1,2]) === 0 ? (C.set([1, 2],1), sq.backgroundColor = 'black') : (C.set([1, 2],0), sq.backgroundColor = 'white')
    break;
    case 'cus-6':
      C.get([2,0]) === 0 ? (C.set([2, 0],1), sq.backgroundColor = 'black') : (C.set([2, 0],0), sq.backgroundColor = 'white')
    break;
    case 'cus-7':
      C.get([2,1]) === 0 ? (C.set([2, 1],1), sq.backgroundColor = 'black') : (C.set([2, 1],0), sq.backgroundColor = 'white')
    break;
    case 'cus-8':
      C.get([2,2]) === 0 ? (C.set([2, 2],1), sq.backgroundColor = 'black') : (C.set([2, 2],0), sq.backgroundColor = 'white')
    break;
    
  }
})
 
//Resets the game
playAgainButton.addEventListener('click', function(e){

  playAgainButton.style.display = 'none'
  sectionToHide.style.display = 'contents'
  title.innerHTML = "Custom tetris"
  subtitle.innerHTML = "Build your own tetris game!"
  title.style.fontSize = '1em'
  subtitle.style.fontSize = '0.55em'
  finalScore.innerHTML = 0
  finalScore.style.display = 'none'
  introModal.show()
})

/*---------------------------- Functions  ----------------------------*/
/*
|
|
|    Helper functions.
|              
|         
|
*/

//Initializes the game by creating the game, the first shape, and the html board
function playGame() { 
  let game = new Game()
  let shape = new Shape(shapes[Math.floor(Math.random()*shapes.length)])

  //Creates html board
  for (let i = 0; i < game.board.length; i++){
    for (let j = 0; j < game.board[i].length; j++){
      let divElem = document.createElement('div')
      divElem.id = `${i},${j}`
      divElem.innerHTML = `${game.board[i][j]}`
      divElem.style.color = 'white'
      divElem.className = 'boardBlock'
      htmlBoard.style.border = '2px solid black'
      htmlBoard.appendChild(divElem)
    }
  }

  game.placeShape(shape)

  let selectedSize
  for(const radioButton of radioButtons){
    if(radioButton.checked){
      selectedSize = radioButton.value
    }
  } 

  //Set time interval according to the board's size
  selectedSize = selectedSize*-17+500
  
  const interval = window.setInterval((function(){
    if(game.activeShape === null) {window.clearInterval(interval)}
    else {game.step()}
  }), selectedSize)

  document.addEventListener('keydown', e =>{
    const keyName = e.key  
    switch (keyName) {
      case 'ArrowLeft':
        game.activeShape.moveLeft(game)
        break;
      case ' ':
        game.activeShape.rotate(game)
        break;
      case 'ArrowUp':
        game.activeShape.rotate(game)
        break;      
      case 'ArrowRight':
        game.activeShape.moveRight(game)
        break;
      case 'ArrowDown':
        if(game){
          game.step()
          game.step()
          game.step()
        }
          
        break;
    }
  })
}

/*---------------------------- Main  ----------------------------*/
/*
|
|
|    Main: Start the game by showing the intro modal.
|              
|         
|
*/

introModal.show()





































