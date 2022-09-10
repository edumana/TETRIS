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

const boundary = 19
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
    while(this.getRightmost() > boundary) this.moveLeft()
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
    if (this.getRightmost() < boundary) this.shift[1] += 1
  }

  moveLeft() {
    if (this.getLeftmost() > 0) this.shift[1] -= 1
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

  fall() {
    this.shift[0] += 1
  }
}

/*---------------------------- Variables (state) ----------------------------*/

/*----------------------------- Event Listeners -----------------------------*/

/*-------------------------------- Functions --------------------------------*/


/*-------------------------------- Main --------------------------------*/


let shape = new Shape(I)

let board















//console.log(y)








