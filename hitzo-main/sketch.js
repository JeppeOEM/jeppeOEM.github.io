function setup() {
  let canvas = createCanvas(1600,800);
  // Move the canvas so it’s inside our <div id="sketch-holder">.
  canvas.parent('sketch-holder');

  
}


let _horzRows = 17*2;
let _horzCols = 17*2;
let _vertRows = 8*2;
let _vertCols = 34*2;

let rows = Array.from({length: 34}, () => Math.floor(Math.random() * 2));
let cols = Array.from({length: 68}, () => Math.floor(Math.random() * 2));


let x = 0;
let y = 0;
let xOffset = 0;
let yOffset = 0;

function horzGrid(l, t, stitchLength) {
  for (let j = 0; j < _horzCols; j++) {
    for (let k = 0; k < _horzRows; k++) {
      x = l + j*(stitchLength*2); // stitch + skip
      y = t + k*(stitchLength);
      if (rows[k] == 1) {
        xOffset = stitchLength;
      } else {
        xOffset = 0;
      }
      line(x+xOffset, y, x+xOffset + stitchLength, y);
    }
  }
}

function vertGrid(l, t, stitchLength) {
  for (let m = 0; m < _vertCols; m++) {
    for (let n = 0; n < _vertRows; n++) {
      x = l + m*(stitchLength);
      y = t + n*(stitchLength*2); // stitch + skip
      if (cols[m] == 1) {
        yOffset = stitchLength;
      } else {
        yOffset = 0;
      }
      line(x, y+yOffset, x, y+yOffset + stitchLength);
    }
  }
}


function draw() {
  horzGrid(30, 40, 25);
  vertGrid(30, 40, 25);
  size(920, 480);
  background(255);
  strokeWeight(2);
  
}