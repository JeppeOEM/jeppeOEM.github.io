let x, y;
let step = 1;
let stepSize = 20;
let numSteps = 1;
let state = 0;
let turnCounter = 1;
let totalSteps;
let offset = 0;
let amount;
let i = 0;
let hori;
let vert;

function setup() {
  angleMode(DEGREES);
  createCanvas(1800, 800);
  background(0);
  const cols = width / stepSize;
  const rows = height / stepSize;
  totalSteps = cols * rows;
  x = width / 2;
  y = height / 2;

  background(66, 99, 164);
  colorMode(RGB);
}

function draw() {
  if (i < 400) {
    i++;
    colors = map(100, 0, 100, 0, i * 1.4);
    primeSpiral(random(200), colors);

    incrementStep();
  } else {
    i = 0;
  }
}

function primeSpiral(offset, color, opacity) {
  stroke(100);
  if (!isPrime(step + offset)) {
    //might put something here
  } else {
    twist = map(x + y, 0, width + height, 0, 720);

    let r = stepSize * 0.5;
    /*     fill(color, 99, 164, opacity); */
    fill(color, 99, 255, opacity);
    push();
    translate(x, y);
    rotate(twist);
    //triangle(-r, +r, 0, -r, +r, +r);
    rect(-r, +r, 5 + random(5), 10 + random(5110));
    pop();
  }
}

function isPrime(value) {
  if (value == 1) return false;
  for (let i = 2; i <= sqrt(value); i++) {
    if (value % i == 0) {
      return false;
    }
  }
  return true;
}

function incrementStep() {
  switch (state) {
    case 0:
      x += stepSize;
      break;
    case 1:
      y -= stepSize;
      break;
    case 2:
      x -= stepSize;
      break;
    case 3:
      y += stepSize;
      break;
  }

  if (step % numSteps == 0) {
    state = (state + 1) % 4;
    turnCounter++;
    if (turnCounter % 2 == 0) {
      numSteps++;
    }
  }
  step++;

  if (step > totalSteps) {
    noLoop();
  }
}
