let angle = 0;
let canvas3D;
function setup() {
  canvas3D = createCanvas(window.innerWidth, window.innerHeight, WEBGL);
    canvas3D.id('p5-canvas')
  }
  
  function draw() {
    background(0, 0);

    let xAxis = [0, 1, 0];
    let yAxis = [1, 0, 0];
    let zAxis = [0, 0, 1];
    rotate(angle * PI, xAxis);
    rotate(-angle * PI, yAxis);
    stroke("white")
    fill(25, 50)
    angle += 0.0015;
    box(200, 200);
  }

  function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
  }