let maxRadius;
let idleTriggered = false;
let activeColorIndex = 0;
const RING_THICKNESS = 200;
const GROW_SPEED = 15;
const STOP_DELAY = 100;
const COLORS = [
    [255, 100, 0],   // orange
    [0, 180, 255],   // blue
    [120, 0, 255],   // purple
    [0, 200, 120],   // green
    [255, 60, 120]   // pink
  ];

  const COLORS_LIGHT = COLORS.map(([r, g, b]) => [
    r + (255 - r) * 0.8,
    g + (255 - g) * 0.8,
    b + (255 - b) * 0.8
  ]);
  
  let colorIndex = 0;
  let lastColorChange = 0;
  
  const COLOR_IDLE_DELAY = 2000; // time mouse must be still
  
let idleColorActive = false;
let lastMoveTime = 0;
let rings = [];
let spawnedForThisStop = false;



const SPAWN_INTERVAL = 500;  // ms between rings while moving
const MOVING_WINDOW = 100;  // ms: consider "moving" if moved recently


let lastSpawnTime = 0;
let fontReady = false;


//end



function setup() {


      

  const holder = document.getElementById("landing");
  createCanvas(holder.offsetWidth, holder.offsetHeight).parent("landing");
  maxRadius = dist(0, 0, width, height);

  const font = new FontFace(
    "Oracle",
    "url(/fonts/ABCOracle-Medium-Trial.otf)"
  );

   font.load().then(loaded => {
    document.fonts.add(loaded);
    textFont("Oracle");   // use by family name
    fontReady = true;
  });

}

function draw() {
  drawBackground();
  // If mouse is idle long enough, cycle color
if (millis() - lastMoveTime > COLOR_IDLE_DELAY &&
millis() - lastColorChange > COLOR_IDLE_DELAY) {

colorIndex = (colorIndex + 1) % COLORS.length;
lastColorChange = millis();
}


  const now = millis();
  const isMoving = (now - lastMoveTime) < MOVING_WINDOW;

  // Spawn rings while moving, every 50ms
  if (isMoving && (now - lastSpawnTime) >= SPAWN_INTERVAL) {
    rings.push({ x: mouseX, y: mouseY, r: 0, v: 2 });

    // optional: cap to 5 rings
    if (rings.length > 20) rings.shift();

    // optional: cycle color per ring spawn (comment out if you don't want this)
    //colorIndex = (colorIndex + 1) % COLORS.length;

    lastSpawnTime = now;
  }

  // Grow rings + remove old ones
  for (let i = rings.length - 1; i >= 0; i--) {
    rings[i].v *= 1.03;     // acceleration factor (try 1.03–1.08)
rings[i].r += rings[i].v;
    if (rings[i].r > maxRadius + RING_THICKNESS) rings.splice(i, 1);
  }

  // Reveal scene through each ring
  for (const ring of rings) {
    const outerR = ring.r;
    const innerR = Math.max(0, ring.r - RING_THICKNESS);

    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.arc(ring.x, ring.y, outerR, 0, TWO_PI);
    drawingContext.arc(ring.x, ring.y, innerR, 0, TWO_PI);
    drawingContext.clip("evenodd");

    drawScene();
    
    drawingContext.restore();

    // draw visible ring outline on top
   
  }
}

function mouseMoved() {
  lastMoveTime = millis();
}

function drawBackground() {
  background(249, 249, 255); // outside rings
  push();
  fill(0); // BLACK text
  noStroke();
  textAlign(LEFT, CENTER);
  textLeading(min(width, height) * 0.15);
  textSize(min(width, height) * 0.15);
 
  text(
    fontReady ? "Proud Taranat is a visual designer. Her work ranges from web, branding, editorial, and creative computation. She is passionate about telling human stories rooted in data." : "Loading font...",
    width*0.25/2, height / 2, width*0.75
  );
  
  pop();
}

function drawScene() {
    const c = COLORS[colorIndex];
    const c2 = COLORS_LIGHT[colorIndex]
  background(c2[0], c2[1], c2[2]);
  //background(249, 249, 255)
  //background(13,13,13)

  push();
  fill(c[0], c[1], c[2]); 
  //fill(180)
  noStroke();
  textAlign(LEFT, CENTER);
  textLeading(min(width, height) * 0.15);
  textSize(min(width, height) * 0.15);
 
  text(
    fontReady ? "Proud Taranat is a visual designer. Her work ranges from web, branding, editorial, and creative computation. She is passionate about telling human stories rooted in data." : "Loading font...",
    width*0.25/2, height / 2, width*0.75
  );


  pop();
}
