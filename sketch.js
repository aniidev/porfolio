function setup() {
    createCanvas(350, 350, WEBGL)
    cnv.style('z-index', '0');
  }
  
  function draw() {
    background(0, 0);

    let xAxis = [0, 1, 0];
    let yAxis = [1, 0, 0];
    rotate(map(mouseX, 0, 1000, 0, 2 * PI), xAxis);
    rotate(map(mouseY, 0, 1000, 0, 2 * PI), yAxis);
    stroke("white")
    fill(40, 50)
    box(200, 200);
  }