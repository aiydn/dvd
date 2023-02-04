wakeLock();
setup();
start();
loop();

async function wakeLock() {
  try {
    const wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) {
    // the wake lock request fails - usually system related, such being low on battery
    console.log(`${err.name}, ${err.message}`);
  }
}

function setDvdLogo() {
  dvdLogo = new Image()
  dvdLogo.src = darkLight(dvd.black, dvd.white)
}

function getGoodStart() {
  let x = getRndInteger(1, max('x') - 1),
    y = getRndInteger(1, max('y') - 1),
    vx = oneOf2(1, -1),
    vy = oneOf2(1, -1),
    px = 0,
    hit = false;
  return { x, y, vx, vy, px, hit };
}

function getZeroStart() {
  let x = y = 0,
    vx = vy = 1,
    px = 0,
    hit = false;
  return { x, y, vx, vy, px, hit };
}

function getSpeed() {
  let temp = Math.round((document.documentElement.clientHeight + document.documentElement.clientWidth) / 1000);
  if (temp == 0) { return 1 }
  else { return temp }
}

function img(i) {
  if (i == 'w') { return Math.round(Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth) / 1000 * 294) }
  if (i == 'h') { return Math.round(Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth) / 1000 * 150) }
}

function getDvd() {
  let black = chromiumOrElse("/dvd/dvd_black.svg", "/dvd/dvd_black.png");
  let white = chromiumOrElse("/dvd/dvd_white.svg", "/dvd/dvd_white.png");
  return { black, white }
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function oneOf2(option0, option1) {
  if (Math.round(Math.random()) == 1) { return option0 } else { return option1 }
}

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
  let maxRun = cornerToNextCorner().hits + 10;
  let wall = 0;
  for (let run = 0; run <= maxRun; run++) {
    future = nextWall(future.x, future.y, future.vx, future.vy, future.px, future.hit);
    wall++;
    if (future.hit == true) { return { hit: future.hit, corner: whichCorner(future.x, future.y), px: future.px, hits: wall }; }
  }
  return { hit: future.hit, corner: whichCorner(future.x, future.y), px: future.px, hits: wall };
}

function cornerToNextCorner() {
  let px = (max('x') * max('y')) / 2
  let hits = Math.ceil((max('x') + max('y')) / 2)
  return { px: px, hits: hits }

}

function nextWall(x, y, vx, vy, px, hit) {
  let oldVX = vx;
  let oldVY = vy;
  var distancex, distancey, plus
  if (vx == 1) { distancex = max('x') - x; } //right
  else { distancex = x; }; //left
  if (vy == 1) { distancey = max('y') - y; } //down
  else { distancey = y; }; //top
  if (distancex > distancey) { vy = -1 * oldVY; plus = Math.abs(distancey); }
  else if (distancey > distancex) { vx = -1 * oldVX; plus = Math.abs(distancex); }
  else { vx = -1 * oldVX; vy = -1 * oldVY; plus = Math.abs(distancex); hit = true; };
  x += oldVX * plus;
  y += oldVY * plus;
  px += plus;
  return { x, y, vx, vy, px, hit }
}

function wall(xy, maxXY) {
  if (max(maxXY) - (Math.abs(xy * 2 - max(maxXY))) == 0) { return true }
}

function darkLight(dark, light) {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { return dark } else { return light }
}

function whichCorner(x, y) {
  if (x == 0 && y == 0) { return 'top left'; }
  else if (x == 0 && y == max('y')) { return 'lower left'; }
  else if (x == max('x') && y == 0) { return 'top right'; }
  else if (x == max('x') && y == max('y')) { return 'lower right'; }
}

function fix() {
  if (logo.x > max('x')) { logo.x = max('x'); logo.vx = -1 }
  if (logo.y > max('y')) { logo.y = max('y'); logo.vy = -1 }
  if (logo.x < 0) { logo.x = 0; logo.vx = 1 }
  if (logo.y < 0) { logo.y = 0; logo.vy = 1 }
}

function setScreen() {
  var ctx = document.getElementById("c").getContext("2d");
  if (ctx.canvas.width !== document.documentElement.clientWidth) ctx.canvas.width = document.documentElement.clientWidth;
  if (ctx.canvas.height !== document.documentElement.clientHeight) ctx.canvas.height = document.documentElement.clientHeight;
}

function chromiumOrElse(chromium, orElse) {
  let chrome = !!window.chrome;
  if (chrome) { return chromium }
  else { return orElse }
}

function padWithLeadingZeros(num, totalLength) {
  return String(num).padStart(totalLength, '0');
}

function loop() {
  animate();
  setScreen();
  fix();
  stats();
  requestAnimationFrame(loop)
}

function setup() {
  var dvd, img, dvd, screen, logo, colorH, logoColor, speed, startTime, beforePause, corner;
}

function start() {
  dvd = getDvd();
  setDvdLogo();
  logo = getGoodStart();
  colorH = 0;
  logoColor = getColor();
  logo.hit = false;
  speed = getSpeed(2);
  startTime = performance.now();
}

function animate() {
  for (let i = 0; i < speed; i++) {
    logo.x += logo.vx;
    logo.y += logo.vy;
    if (wall(logo.x, "x")) { logo.vx = -logo.vx; logoColor = getColor(); logo.hit = false };
    if (wall(logo.y, "y")) { logo.vy = -logo.vy; logoColor = getColor(); logo.hit = false };
    if (logo.hit) { logoColor = getColor() };
    logo.px += 1;
    if (whichCorner(logo.x, logo.y) !== undefined) { logo.hit = true; };
    draw();
  }
}

function draw() {
  var canvas = document.getElementById("c");
  var context = canvas.getContext("2d");
  context.clearRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
  context.fillStyle = darkLight("#000000", "#ffffff");
  context.fillRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
  context.fillStyle = logoColor;
  context.fillRect(logo.x, logo.y, img('w'), img('h'));
  context.drawImage(dvdLogo, logo.x + img('w') * 0.05, logo.y + img('h') * 0.05, img('w') * 0.9, img('h') * 0.9);
}

function max(i) {
  if (i == 'x') { return document.documentElement.clientWidth - img('w') }
  if (i == 'y') { return document.documentElement.clientHeight - img('h') }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === 'visible') {
    startTime += performance.now() - beforePause; //play
  } else {
    beforePause = performance.now(); //pause
  }
})

function stats() {
  let output
  let next = nextCorner(logo);
  if (next.hit == true) {
    let countdown = time(next.px - logo.px);
    output = `It will take ${countdown.H} hour ${countdown.M} minutes ${countdown.S} seconds until the ${next.corner} corner will be hit`
  }
  else if (next.hit == false) { output = `The corner will never be hit`; }
  if (output !== document.getElementById("stats").innerText) { document.getElementById("stats").innerText = output; }
}