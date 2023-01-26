window.onresize = function () {reset()}
var calc
var bar = document.getElementById('bar').clientHeight
const dvdLogo = new Image();
var img = getImg(294, 150);
var dvd = getDvd();
var screen = getScreen();
var max = getMax();
var logo = getGoodStart();
var colorH = 0;
var logoColor = getColor();
var recentHit = false;
var speed = getSpeed(2);
var startTime = performance.now();
var maxpx = (lcm(max.x, max.y));
var corner = nextCorner(logo);

wakeLock();
animate();
setScreen();

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState = 'visible') { reset() }
})

async function wakeLock() {
  try {
    const wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) {
    // the wake lock request fails - usually system related, such being low on battery
    console.log(`${err.name}, ${err.message}`);
  }
}

function reCalc() { console.log("reCalc"); corner = nextCorner(logo) }
function getGoodStart() {
  let x = getRndInteger(1, max.x - 1),
    y = getRndInteger(1, max.y - 1),
    vx = oneOf2(1, -1),
    vy = oneOf2(1, -1),
    px = 0,
    hit = false;
  return { x, y, vx, vy, px, hit };
}
function getSpeed(s) {
  let temp = Math.round(Math.min(window.innerHeight, window.innerWidth) / 1000 * s)
  if (temp == 0) { return 1 }
  else { return temp }
}

function getScreen() {
    return { w: window.innerWidth, h: window.innerHeight - document.getElementById('bar').clientHeight}
}

function getMax() {
  let x = screen.w - img.w,
    y = screen.h - img.h;
  return { x, y }
}

function getImg(srcW, srcH) {
  let w = Math.round(Math.min(window.innerHeight, window.innerWidth) / 1000 * srcW),
    h = Math.round(Math.min(window.innerHeight, window.innerWidth) / 1000 * srcH);
  return { w, h }
}

function getDvd() {
  let black = chromiumOrElse("/dvd/dvd_black.svg", "/dvd/dvd_black.png");
  let white = chromiumOrElse("/dvd/dvd_white.svg", "/dvd/dvd_white.png");
  return { black, white }
}

function getRndInteger(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function oneOf2(option0, option1) { if (Math.round(Math.random()) == 1) { return option0 } else { return option1 } }

function getColor() {
  let h = colorH
  while (h == colorH) { colorH = Math.floor(Math.random() * 6) * 60 } //360 total
  h = colorH
  s = 100 + '%'
  l = 50 + '%'
  //https://gist.github.com/lvnam96/d341d3885244c285efc7590b7d9c107b
  return `hsl(${h},${s},${l})`;
}

function time(px) {
  let hitTime = new Date(((performance.now() - startTime) / logo.px * px));
  return { H: padWithLeadingZeros(hitTime.getHours(), 2), M: padWithLeadingZeros(hitTime.getMinutes(), 2), S: padWithLeadingZeros(hitTime.getSeconds(), 2), MS: padWithLeadingZeros(hitTime.getMilliseconds(), 3) }
}

function nextCorner(future) {
  for (let run = 0; run < maxpx; run++) {
    future = nextWall(future.x, future.y, future.vx, future.vy, future.px, future.hit);
    if (future.hit == true) { return { hit: future.hit, corner: whichCorner(future.x, future.y), px: future.px }; }
  }
  return { hit: future.hit, corner: whichCorner(future.x, future.y), px: future.px };
}

function nextWall(x, y, vx, vy, px, hit) {
  let oldVX = vx;
  let oldVY = vy;
  var distancex, distancey, plus
  if (oldVX == 1) { distancex = max.x - x; } //right
  else { distancex = x; }; //left
  if (oldVY == 1) { distancey = max.y - y; } //down
  else { distancey = y; }; //top
  if (distancex > distancey) { vy = -1 * oldVY; plus = Math.abs(distancey); }
  else if (distancey > distancex) { vx = -1 * oldVX; plus = Math.abs(distancex); }
  else { vx = -1 * oldVX; vy = -1 * oldVY; plus = Math.abs(distancex); hit = true; };
  x += oldVX * plus;
  y += oldVY * plus;
  px += plus;
  return { x, y, vx, vy, px, hit }
}

function check(xy, maxXY) { if (max[maxXY] - (Math.abs(xy * 2 - max[maxXY])) == 0) { return true } }

function darkLight(dark, light) { if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { return dark } else { return light } }

function whichCorner(x, y) {
  if (x == 0 && y == 0) { return 'top left'; }
  else if (x == 0 && y == max.y) { return 'lower left'; }
  else if (x == max.x && y == 0) { return 'top right'; }
  else if (x == max.x && y == max.y) { return 'lower right'; }
}

function animate() {
  requestAnimationFrame(animate)
  for (let i = 0; i < speed; i++) {
    logo.x += logo.vx;
    logo.y += logo.vy;
    if (check(logo.x, "x")) { logo.vx = -logo.vx; logoColor = getColor(); recentHit = false };
    if (check(logo.y, "y")) { logo.vy = -logo.vy; logoColor = getColor(); recentHit = false };
    if (recentHit) { logoColor = getColor() };
    logo.px += 1;
    if (whichCorner(logo.x, logo.y) !== undefined) { recentHit = true; reset() };
    stats();
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
  if (logo.y < 0) { logo.y = 0; logo.vy = 1 }
}

function reset() {
  let newscreen = getScreen()
  if (screen !== newscreen){
  maxpx = (lcm(max.x, max.y));
  img = getImg(294, 150);
  max = getMax();
  screen = getScreen();
  speed = getSpeed(2)
  setScreen();
  fix();
  startTime = performance.now();
  logo.px = 0;
  clearTimeout(calc);
  calc = setTimeout(function () {
    reCalc();
  }, 1000);
  console.log("RESET");
}
}

function setScreen() {
  var ctx = document.getElementById("c").getContext("2d");
  ctx.canvas.width = screen.w;
  ctx.canvas.height = screen.h;
}

function stats() {
  let output
  if (corner.hit == true) {
    let countdown = time(corner.px - logo.px);
    output = "It will take " + countdown.H + " hour " + countdown.M + " minutes " + countdown.S + " seconds until the " + corner.corner + " corner will be hit"
  }
  else if (corner.hit == false) { output = "The corner will never be hit" }
  if (output !== document.getElementById("stats").innerText) { document.getElementById("stats").innerText = output }
}
function chromiumOrElse(chromium, orElse) {
  let chrome = !!window.chrome;
  if (chrome) { return chromium }
  else { return orElse }
}

function turbo() {
  if (corner.px - logo.px < 1000) { reset() }
  else { speed = 300; requestAnimationFrame(turbo) }
}

function padWithLeadingZeros(num, totalLength) {
  return String(num).padStart(totalLength, '0');
}

function gcd(...arr) {
  const _gcd = (x, y) => (!y ? x : gcd(y, x % y));
  return [...arr].reduce((a, b) => _gcd(a, b));
}
function lcm(...arr) {
  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
  const _lcm = (x, y) => (x * y) / gcd(x, y);
  return [...arr].reduce((a, b) => _lcm(a, b));
}