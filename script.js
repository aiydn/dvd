var img = getImg(294, 150);
var dvd = getDvd();
var screen = getScreen();
var max = getMax();
var logo = getGoodStart();
var screen = getScreen();
var colorH = 0;
var logoColor = getColor();
const dvdLogo = new Image();
var future = logo;
var logPX = [0];
var logHit = [0];
var countdown = 0;
var recentHit = false;
var speed = getSpeed(2);
var oldSpeed = speed;
var startTime = performance.now();
var resizeTimeOut;
window.onresize = function () {
  clearTimeout(resizeTimeOut);
  resizeTimeOut = setTimeout(function () {
    reset("WINDOWS RESIZE RESET"); // run resize function
  }, 1000); // time in ms for not resized
};
var type = "time";

wakeLock();
animate();
requestAnimationFrame(calc);
setScreen();

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState = 'visible') { reset("WINDOWS INACTIVE RESET") }
})

async function wakeLock() {
  try {
    const wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) {
    // the wake lock request fails - usually system related, such being low on battery
    console.log(`${err.name}, ${err.message}`);
  }
}

function getGoodStart() {
  let x = getRndInteger(0, window.innerWidth - 256 - 1),
    y = getRndInteger(0, window.innerHeight - 147 - 1),
    vx = oneOf2(1, -1),
    vy = oneOf2(1, -1);
  while (willEverHit(x, y) == false) {
    console.log("getting another start")
    x = getRndInteger(0, window.innerWidth - 256 - 1),
      y = getRndInteger(0, window.innerHeight - 147 - 1),
      vx = oneOf2(1, -1),
      vy = oneOf2(1, -1);
  };
  let px = 0;
  let hit = 0;
  return { x, y, vx, vy, px, hit };
}
function getSpeed(s) {
  return Math.round(Math.min(window.innerHeight, window.innerWidth) / 1000 * s)
}

function getScreen() {
  let w = window.innerWidth,
    h = window.innerHeight;
  return { w, h };
}

function getMax() {
  let x = window.innerWidth - img.w,
    y = window.innerHeight - img.h
  px = lcm(x, y)
  return { x, y, px }
}

function getImg(srcW, srcH) {

  let w = Math.round(Math.min(window.innerHeight, window.innerWidth) / 1000 * srcW);
  let h = Math.round(Math.min(window.innerHeight, window.innerWidth) / 1000 * srcH);
  return { w, h }
}

function getDvd() {
  let black = chromiumOrElse("/images/dvd_black.svg", "/images/dvd_black.png");
  let white = chromiumOrElse("/images/dvd_white.svg", "/images/dvd_white.png");
  return { black, white }
}

function getRndInteger(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function oneOf2(option0, option1) { if (Math.round(Math.random()) == 1) { return option0 } else { return option1 } }
function willEverHit(x, y) { if (Math.abs(x - y) % gcd(max.x, max.y) == 0) { return true } else { return false } }

function getColor() {
  let h = colorH
  while (h == colorH) { colorH = Math.floor(Math.random() * 36) * 10 } //360 total
  h = colorH
  s = 100 + '%'
  l = 50 + '%'
  //https://gist.github.com/lvnam96/d341d3885244c285efc7590b7d9c107b
  return `hsl(${h},${s},${l})`;
}

function time(px) {
  let hitTime = new Date(new Date().getTime() + ((performance.now() - startTime) / logo.px * px));
  return hitTime.toLocaleString()
}

function gcd(a, b) {
  var temp;
  if (a < 0) { a = -a; };
  if (b < 0) { b = -b; };
  if (b > a) { temp = a; a = b; b = temp; };
  while (true) {
    a %= b;
    if (a == 0) { return b; };
    b %= a;
    if (b == 0) { return a; };
  };
  return b;
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function calc() {
  if (willEverHit(logo.x, logo.y) == false) { type = "never"}
  else {
    while (typeof logPX[logo.hit + 1] == 'undefined') {
      future = nextWall(future.x, future.y, future.vx, future.vy, future.px, future.hit)
    }
  }
}

function nextWall(x, y, vx, vy, px, hit) {
  let oldHit = hit
  let oldVX = vx
  let oldVY = vy
  var distancex, distancey, plus
  if (oldVX == 1) { distancex = max.x - x; } //right
  else { distancex = x; }; //left
  if (oldVY == 1) { distancey = max.y - y; } //down
  else { distancey = y; }; //top
  if (distancex > distancey) { vy = -1 * oldVY; plus = Math.abs(distancey); }
  else if (distancey > distancex) { vx = -1 * oldVX; plus = Math.abs(distancex); }
  else { vx = -1 * oldVX; vy = -1 * oldVY; plus = Math.abs(distancex); hit += 1; };
  x += oldVX * plus;
  y += oldVY * plus;
  px += plus;
  if (oldHit !== hit) { addHit(x, y, px, hit); };
  return { x, y, vx, vy, px, hit }
}

function changevx(x, vx, max) {
  if (x == max) { return -vx }
  if (x == 0) { return -vx }
}

function changevy(y, vy, max) {
  if (y == max) { return -vy }
  if (y == 0) { return -vy }
}

function darkLight(dark, light) { if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { return dark } else { return light } }
function addHit(x, y, px, hit) {
  logPX.push(px)
  logHit.push(whichCorner(x, y))
  console.log("corner: " + whichCorner(x, y) + ", px: " + px + ", hit number: " + hit);
}

function whichCorner(x, y) {
  if (x == 0 && y == 0) { return 'top left'; }
  else if (x == 0 && y == max.y) { return 'lower left'; }
  else if (x == max.x && y == 0) { return 'top right'; }
  else if (x == max.x && y == max.y) { return 'lower right'; }
}

function animate() {
  requestAnimationFrame(animate)
  for (var i = 0; i < speed; i++) {
    logo.x += logo.vx;
    logo.y += logo.vy;
    if (changevx(logo.x, logo.vx, max.x) !== undefined) { logo.vx = changevx(logo.x, logo.vx, max.x); logoColor = getColor(); recentHit = false };
    if (changevy(logo.y, logo.vy, max.y) !== undefined) { logo.vy = changevy(logo.y, logo.vy, max.y); logoColor = getColor(); recentHit = false };
    if (recentHit) { logoColor = getColor() }
    logo.px += 1
    if (whichCorner(logo.x, logo.y) !== undefined) { recentHit = true; logo.hit += 1; requestAnimationFrame(calc) }
    stats()
  }
  draw()
}

function draw() {
  var canvas = document.getElementById("c");
  var context = canvas.getContext("2d");
  dvdLogo.src = darkLight(dvd.black, dvd.white)
  context.clearRect(0, 0, screen.w, screen.h);
  context.fillStyle = darkLight("#000000", "#ffffff");
  context.fillRect(0, 0, screen.w, screen.h);
  context.fillStyle = logoColor;
  context.fillRect(logo.x, logo.y, img.w, img.h);
  context.drawImage(dvdLogo, logo.x + img.w * 0.05, logo.y + img.h * 0.05, img.w * 0.9, img.h * 0.9);
}

function fix() {
  if (logo.x > max.x) { logo.x = max.x; logo.vx = -1 }
  if (logo.y > max.y) { logo.y = max.y; logo.vy = -1 }
  if (logo.x < 0) { logo.x = 0; logo.vx = 1 }
  if (logo.y < 0) { logo.y = 0; logo.vx = 1 }
}

function reset(log) {
  img = getImg(294, 150);
  max = getMax();
  screen = getScreen();
  speed = getSpeed(2)
  setScreen();
  fix();
  logPX = [0];
  logHit = [0];
  startTime = performance.now();
  logo.px = 0;
  future = logo;
  requestAnimationFrame(calc);
  console.log(log)
}
function setScreen() {
  var ctx = document.getElementById("c").getContext("2d");
  ctx.canvas.width = screen.w;
  ctx.canvas.height = screen.h;
}

function stats() {
  let output;
  if (typeof logPX[logo.hit + 1] !== 'undefined') {
    let hit = logHit[logo.hit + 1];
    let px = logPX[logo.hit + 1] - logo.px;
    if (type == "time") { output =  "The " + hit + " corner will be hit at " + time(px) + "" }
    else if (type == "pixels") { output = "The " + hit + " corner will be hit in " + px + " pixels" };
  }
  else if (type == "never") { output = "The corner will never be hit" }
  else { let output = "" }
  if (output !== document.getElementById("stats").innerText) {document.getElementById("stats").innerText = output}
}

function chromiumOrElse(chromium, orElse) {
  let chrome = !!window.chrome;
  if (chrome) { return chromium }
  else { return orElse }
}

function turbo() {
  if (logPX[logo.hit + 1] - logo.px < 1000) { reset("TURBO DONE RESET"); type = "time" }
  else { speed = 300; requestAnimationFrame(turbo); type = "pixels" }
}
