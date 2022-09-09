

let m = math.matrix([
  [1,0,0],
  [1,0,0],
  [1,1,0]])

const I = math.matrix([
  [0,0,1],
  [0,1,0],
  [1,0,0]])



// Matrix Addition

console.log(m)
let l = math.multiply(math.transpose(m), I)
console.log(l)

let e = math.multiply(math.transpose(l), I)
console.log(e)

let c = math.multiply(math.transpose(e), I)
console.log(c)

// let transpose = m => m[0].map((x,i) => m.map(x => x[i]))

// let x = math.multiply(math.matrix(transpose(m))*math.identity(3,3))

