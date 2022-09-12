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

const shapes = [I, J, L, O, S, T, Z]
const boundary = 18
const length = boundary * 2

/*-------------------------------- Classes --------------------------------*/
class Shape {
  constructor(shape) {
    this.shape = shape
    this.shift = [0,0]
  }

  rotate() {
    if (math.size(this.shape)._data[0] === 4) {
      this.shape = math.multiply(math.transpose(this.shape), math.matrix([
        [0,0,0,1],
        [0,0,1,0],
        [0,1,0,0],
        [1,0,0,0]]))
    } else if (math.size(this.shape)._data[0] === 3) {
      this.shape = math.multiply(math.transpose(this.shape), math.matrix([
        [0,0,1],
        [0,1,0],
        [1,0,0]]))
    }
    while(this.getLeftmost() < 0) this.moveRight()
    while(this.getRightmost() > boundary - 1) this.moveLeft()
    game.updateCoords()
  }

  getCoordinates() {
    let coords = []
    let shift = this.shift
    this.shape.forEach(function (value, index) {
      if(value) coords.push(math.add(index, shift))
    })
    return coords
  }

  moveRight() { 
    if (this.getRightmost() < boundary-1) this.shift[1] += 1
    game.updateCoords()
  }

  moveLeft() {
    if (this.getLeftmost() > 0) this.shift[1] -= 1
    game.updateCoords()
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

  fall() {
    if(this.getBottomEdge()[0][0] < length - 1){
      this.shift[0] += 1
      game.updateCoords()
    }
  }
}

/*---------------------------- Variables (state) ----------------------------*/
let game = {
  board: new Array(length).fill('0').map(()=>new Array(boundary).fill('0')),
  activeShape: null,
  trailCoords: null,

  placeShape(shape){
    if(this.activeShape) delete this.activeShape
    this.activeShape = shape
    let board = this.board
    shape.getCoordinates().forEach(function (value) {
      board[value[0]][value[1]] = '1'
    })
    this.trailCoords = shape.getCoordinates()
    this.render()
  },

  updateCoords(){
    this.clearTrail()
    let board = this.board
    this.activeShape.getCoordinates().forEach(function (value) {
      board[value[0]][value[1]] = '1'
    })
    this.trailCoords = this.activeShape.getCoordinates()
    this.render()
  },

  clearTrail(){
    if (this.trailCoords){
      let board = this.board
      this.trailCoords.forEach(function(value) {
        board[value[0]][value[1]] = "0"
      })
    }
  },

  render(){
    for (let i = 0; i < this.board.length; i++){
      for (let j = 0; j < this.board[i].length; j++){
        let divElem = document.getElementById(`${i},${j}`)
        divElem.innerHTML = `${this.board[i][j]}`
      }
    }
  },

  clear(){
    for (let i = 0; i <= lenght; i++) {
      this.board[i] = new Array(boundary).fill("0")
    }
  },

  step() {

    let bottom1 = this.activeShape.getBottomEdge()
    this.activeShape.fall()
    let bottom2 = this.activeShape.getBottomEdge()
    if(bottom1[0][0] === bottom2[0][0]){
      let shape = new Shape(shapes[Math.floor(Math.random()*shapes.length)])
      game.placeShape(shape)
    }
  }
}

const htmlBoard = document.getElementById('main-board')
htmlBoard.style.gridTemplateColumns = `repeat(${boundary}, 1.5vmin)`
htmlBoard.style.gridTemplateRows = `repeat(${length}, 1.5vmin)`



/*----------------------------- Event Listeners -----------------------------*/
document.onkeydown = function(e) {
  switch (e.keyCode) {
      case 37:
          game.activeShape.moveLeft()
          break;
      case 38:
          game.activeShape.rotate()
          break;    
      case 39:
        game.activeShape.moveRight()
        break;
      case 40:
        game.step()
        break;
  }
}

window.setInterval(advance, 200)


/*-------------------------------- Functions --------------------------------*/

function initBoard() {
  for (let i = 0; i < game.board.length; i++){
    for (let j = 0; j < game.board[i].length; j++){
      let divElem = document.createElement('div')
      divElem.id = `${i},${j}`
      divElem.innerHTML = `${game.board[i][j]}`
      htmlBoard.appendChild(divElem)
    }
  }
}

function advance(){
  if(game.activeShape !== null){
    game.step()
  }
}

/*-------------------------------- Main --------------------------------*/


initBoard()
let shape = new Shape(shapes[Math.floor(Math.random()*shapes.length)])
game.placeShape(shape)



































