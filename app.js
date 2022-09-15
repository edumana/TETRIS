/*-------------------------------- Constants --------------------------------*/
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
class Shape {
  constructor(shape) {
    this.shape = shape
    this.shift = [0,0]
  }

  rotate(game) {
    if (math.size(this.shape)._data[0] === 4) {
      this.shape = math.multiply(math.transpose(this.shape), R4)
    } else if (math.size(this.shape)._data[0] === 3) {
      this.shape = math.multiply(math.transpose(this.shape), R3)
      
    }

    if(game.checkCollision(this.getCoordinates(), game.board)){
      if (math.size(this.shape)._data[0] === 4) {
        this.shape = math.multiply(R4,math.transpose(this.shape))
      } else if (math.size(this.shape)._data[0] === 3) {
        this.shape = math.multiply(R3, math.transpose(this.shape))
      }
    }

    while(this.getLeftmost() < 0) this.moveRight()
    while(this.getRightmost() > boundary - 1) this.moveLeft()
    game.updateCoords('1')
  }

  getCoordinates() {
    let coords = []
    let shift = this.shift
    this.shape.forEach(function (value, index) {
      if(value) coords.push(math.add(index, shift))
    })
    return coords
  }

  moveRight(game) { 
    if (this.getRightmost() < boundary - 1) this.shift[1] += 1
    if(game.checkCollision(this.getCoordinates(), game.board)){
      this.shift[1] -= 1
    } else {
      game.updateCoords('1')
    }
  }

  moveLeft(game) {
    if(this.getLeftmost() > 0) this.shift[1] -= 1
    if(game.checkCollision(this.getCoordinates(), game.board)){
      this.shift[1] += 1
    } else {
      game.updateCoords('1')
    }
  }

  getRightmost() {
    let xCords = []
    this.getCoordinates().forEach(function(value) {
      xCords.push(value[1])
    })
    return Math.max(...xCords) 
  }

  getLeftmost() {
    let xCords = []
    this.getCoordinates().forEach(function(value) {
      xCords.push(value[1])
    })
    return Math.min(...xCords) 
  }

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


  fall(game){

    if (game.activeShape !== null){

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

class Game {
  constructor(){
    this.board = new Array(length).fill('0').map(()=>new Array(boundary).fill('0'))
    this.activeShape = null
    this.trailCoords = null
  }

  placeShape(shape){
    if(this.activeShape) delete this.activeShape
    this.activeShape = shape
    shape.getCoordinates().forEach(value => {
      this.board[value[0]][value[1]] = '1'
    })
    this.trailCoords = shape.getCoordinates()
    this.render()
  }

  updateCoords(str){
    this.clearTrail()
    this.activeShape.getCoordinates().forEach(value => {
      this.board[value[0]][value[1]] = str
    })
    this.trailCoords = this.activeShape.getCoordinates()
    this.render()
  }

  clearTrail(){
    if (this.trailCoords){
      this.trailCoords.forEach(value => {
        this.board[value[0]][value[1]] = '0'
      })
    }
  }

  render(){
    for (let i = 0; i < this.board.length; i++){
      for (let j = 0; j < this.board[i].length; j++){
        let divElem = document.getElementById(`${i},${j}`)
        divElem.innerHTML = `${this.board[i][j]}`

        if(this.board[i][j]==='1'){
          divElem.style.backgroundColor = 'black'
          divElem.style.color = 'black'
        } else if(this.board[i][j]==='*'){
          divElem.style.backgroundColor = '#0d6efd'
          divElem.style.color = '#0d6efd'
        } else if(this.board[i][j]==='0'){
          divElem.style.backgroundColor = 'white'
          divElem.style.color = 'white'
        }
      }
    }
  }

  clear(){
    delete this.activeShape
    delete this.trailCoords
    delete this.board
    delete this


    htmlBoard.innerHTML = ''
    
    introModal.show()
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

  checkCollision(futurePlacement, currentBoard) {

    let collision = false
    futurePlacement.forEach(value => {
      if(currentBoard[value[0]][value[1]] === '*') collision = true
    })
    return collision ? true : false
  }

  clearIndex(index) {

    globalScore += 100
    score.innerHTML = `${globalScore}`

    this.board[index].forEach((value, index, array) => {array[index] = '0'} )
    
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

  step() {
    if(this.activeShape !== null){
      let bottom1 = this.activeShape.getBottomEdge()
      this.activeShape.fall(this)
      let bottom2 = this.activeShape.getBottomEdge()

      if(this.board[0].some(value => value === '*')) this.clear()

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

/*---------------------------- Variables (state) ----------------------------*/
let boundary = 6
let length = boundary * 2
let C = math.matrix([[1,0,1],[1,0,1],[0,0,0]])
let shapes = [I, J, L, O, S, T, Z, C]
let globalScore = 0


/*----------------------------- Event Listeners -----------------------------*/

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
  let reSize = -0.1*(selectedSize) + 4.1
  htmlBoard.style.gridTemplateColumns = `repeat(${boundary}, ${reSize}vmin)`
  htmlBoard.style.gridTemplateRows = `repeat(${length}, ${reSize}vmin)`
  score.innerHTML = 0

  playGame()
})

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
/*-------------------------------- Functions --------------------------------*/

function playGame() { 
  let game = new Game()
  let shape = new Shape(shapes[Math.floor(Math.random()*shapes.length)])

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
  selectedSize = selectedSize*-17+500
  window.setInterval((function(){if(game) game.step()}), selectedSize)

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

/*-------------------------------- Main --------------------------------*/

introModal.show()





































