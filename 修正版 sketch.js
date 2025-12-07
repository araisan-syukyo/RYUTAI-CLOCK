/*
 * RYUTAI CLOCK - Ver.2 "Living Archipelago"
 * 日本列島のシルエットを具体化し、龍として呼吸させる
 */

let particles = [];
let spinePath = []; // 龍脈（パーティクルが流れる中心線）
let bodyNodes = []; // 龍体（日本列島の輪郭を作る点）
let font;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  colorMode(HSB, 360, 100, 100, 100);
  
  // 龍体（日本列島）の初期化
  initDragonBody();
}

function draw() {
  // 残像を少し強めに残して神秘的に
  background(220, 80, 5, 25); 

  let h = hour();
  let m = minute();
  let s = second();
  
  // 1. 龍体（日本列島）の描画
  drawDragonShape();

  // 2. 龍脈エネルギー（パーティクル）の更新
  if (frameCount % 4 === 0) {
    particles.push(new RyumyakuParticle());
  }
  
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }

  // 3. 龍の眼（北海道の位置に配置）
  drawDragonEye();

  // 4. 時刻表示
  drawDigitalClock(h, m, s);
}

/* * 日本列島の形状データ初期化 
 * 画面サイズに合わせて正規化された座標(0.0-1.0)を展開
 */
function initDragonBody() {
  spinePath = [];
  
  // 日本列島のおおよその中心線（背骨）を定義
  // 右上（北海道）から左下（沖縄）へ
  let rawPoints = [
    {x: 0.85, y: 0.20}, // 北海道（頭）
    {x: 0.80, y: 0.35}, // 東北北部
    {x: 0.72, y: 0.45}, // 東北南部
    {x: 0.65, y: 0.55}, // 関東・中部（大きく湾曲）
    {x: 0.55, y: 0.60}, // 近畿
    {x: 0.40, y: 0.62}, // 中国・四国
    {x: 0.25, y: 0.70}, // 九州（腰）
    {x: 0.15, y: 0.80}, // 南西諸島（尾）
    {x: 0.10, y: 0.85}  // 沖縄先島（尾の先）
  ];

  // スプライン補間で滑らかな曲線を生成
  for (let t = 0; t <= 1.0; t += 0.02) {
    let x = catmullRom(t, rawPoints.map(p => p.x * width));
    let y = catmullRom(t, rawPoints.map(p => p.y * height));
    spinePath.push(createVector(x, y));
  }
}

// Catmull-Romスプライン補間（滑らかな線を作る計算式）
function catmullRom(t, coords) {
  let len = coords.length;
  let p = (len - 1) * t;
  let intP = Math.floor(p);
  let w = p - intP;

  let p0 = coords[Math.max(0, intP - 1)];
  let p1 = coords[intP];
  let p2 = coords[Math.min(len - 1, intP + 1)];
  let p3 = coords[Math.min(len - 1, intP + 2)];

  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * w +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * w * w +
    (-p0 + 3 * p1 - 3 * p2 + p3) * w * w * w
  );
}

function drawDragonShape() {
  noFill();
  
  // 龍のオーラ（外光）
  strokeWeight(width * 0.12); // かなり太く
  stroke(210, 60, 20, 10); // 暗い青のオーラ
  beginShape();
  for (let v of spinePath) {
    // 呼吸：全体がゆっくり膨張収縮
    let breath = sin(frameCount * 0.03) * (width * 0.005);
    // うねり：ノイズで有機的に揺らす
    let noiseVal = noise(v.x * 0.01, v.y * 0.01, frameCount * 0.01);
    let waveX = (noiseVal - 0.5) * (width * 0.05);
    let waveY = (noiseVal - 0.5) * (height * 0.05);
    
    curveVertex(v.x + waveX, v.y + waveY + breath);
  }
  endShape();

  // 龍の本体（骨格・日本列島シルエット風）
  strokeWeight(width * 0.03);
  stroke(200, 40, 60, 60); // 青白い光
  beginShape();
  for (let i = 0; i < spinePath.length; i++) {
    let v = spinePath[i];
    // 微妙な揺らぎを加える
    let n = noise(i * 0.1, frameCount * 0.02);
    let shake = map(n, 0, 1, -5, 5);
    curveVertex(v.x + shake, v.y + shake);
  }
  endShape();
  
  // 節（チャクラポイント）を描画
  fill(200, 80, 100);
  noStroke();
  for (let i = 0; i < spinePath.length; i += 8) {
    let v = spinePath[i];
    let size = random(2, 5);
    ellipse(v.x, v.y, size);
  }
}

function drawDragonEye() {
  // 北海道（頭）付近の座標を取得
  if (spinePath.length > 0) {
    let head = spinePath[2]; // 配列の最初の方（北海道）
    
    // 眼の輝き
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'gold';
    
    fill(45, 100, 100); // 金色の眼
    noStroke();
    
    // 眼が瞬きするアニメーション
    let blink = sin(frameCount * 0.1);
    let eyeHeight = (blink > 0.95) ? 1 : 12; // ときどき瞬き
    
    ellipse(head.x, head.y - 10, 12, eyeHeight);
    
    // リセット
    drawingContext.shadowBlur = 0;
  }
}

class RyumyakuParticle {
  constructor() {
    this.index = 0;
    this.speed = random(0.3, 0.8);
    this.size = random(2, 6);
    this.offset = random(-10, 10); // 中心線からのズレ
  }

  update() {
    this.index += this.speed;
  }

  show() {
    if (this.index < spinePath.length - 1) {
      let idx = floor(this.index);
      let p = spinePath[idx];
      
      // 龍脈に沿って光が走る
      noStroke();
      fill(50, 20, 100, 80); // 白金色の光
      ellipse(p.x + this.offset, p.y + this.offset, this.size);
    }
  }
  
  finished() {
    return this.index >= spinePath.length - 1;
  }
}

function drawDigitalClock(h, m, s) {
  let hStr = nf(h, 2);
  let mStr = nf(m, 2);
  let sStr = nf(s, 2);

  textAlign(CENTER, CENTER);
  
  // メイン時刻
  fill(0, 0, 100, 90);
  textSize(min(width, height) * 0.12);
  // 少し左下に配置して、龍と被らないようにバランス調整
  text(`${hStr}:${mStr}`, width * 0.25, height * 0.25);
  
  // 秒数
  textSize(min(width, height) * 0.04);
  text(sStr, width * 0.25, height * 0.33);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initDragonBody();
}
