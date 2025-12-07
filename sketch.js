/*
 * RYUTAI CLOCK - Prototype
 * Concept: 日本列島龍体説 (Japan Archipelago = Dragon Body Theory)
 * Visualizing time as the flow of energy (Ryumyaku) along the archipelago.
 */

let particles = [];
let dragonPath = []; // 日本列島（龍の背骨）の座標
let font;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  colorMode(HSB, 360, 100, 100, 100);
  
  // 龍の背骨（日本列島の概形）を生成
  // 北海道(右上)から九州・沖縄(左下)へのカーブ
  generateDragonPath();
}

function draw() {
  background(220, 80, 10, 20); // 残像を残すための半透明背景
  
  // 1. 時間の取得
  let h = hour();
  let m = minute();
  let s = second();
  
  // 2. 龍体（背景の骨格）の描画
  drawDragonBody();

  // 3. 龍脈エネルギー（パーティクル）の生成と更新
  // 秒数に合わせてエネルギー量を変える演出
  if (frameCount % 5 === 0) {
    particles.push(new RyumyakuParticle());
  }
  
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }

  // 4. デジタル時刻表示
  drawDigitalClock(h, m, s);
}

// 日本列島のようなS字カーブの座標を作る
function generateDragonPath() {
  dragonPath = [];
  let points = 50;
  for (let i = 0; i <= points; i++) {
    let t = i / points;
    // ベジェ曲線のような計算で列島の形を模倣
    // width * 0.8 (北海道側) -> width * 0.2 (沖縄側)
    let x = lerp(width * 0.8, width * 0.2, t);
    // サイン波を加えてうねりを出す
    let y = lerp(height * 0.2, height * 0.8, t) + sin(t * PI * 2) * (width * 0.1);
    dragonPath.push(createVector(x, y));
  }
}

// 龍の本体を描画
function drawDragonBody() {
  noFill();
  stroke(200, 60, 40, 30); // 淡い青
  strokeWeight(width * 0.08); // 太いオーラ
  
  beginShape();
  for (let v of dragonPath) {
    // 呼吸するように脈動させる
    let breath = sin(frameCount * 0.02 + v.y * 0.01) * 5;
    vertex(v.x + breath, v.y);
  }
  endShape();
  
  // 脊椎（中心線）
  stroke(200, 80, 80, 50);
  strokeWeight(2);
  beginShape();
  for (let v of dragonPath) {
    vertex(v.x, v.y);
  }
  endShape();
}

// デジタル時計の描画
function drawDigitalClock(h, m, s) {
  // フォーマット調整
  let hStr = nf(h, 2);
  let mStr = nf(m, 2);
  let sStr = nf(s, 2);
  
  textAlign(CENTER, CENTER);
  noStroke();
  
  // 時刻の輝き
  fill(50, 20, 100); // 白に近い金
  textSize(min(width, height) * 0.15);
  // 画面中央より少し上に配置
  text(`${hStr}:${mStr}`, width / 2, height / 2);
  
  // 秒数（小さく）
  textSize(min(width, height) * 0.05);
  fill(200, 60, 90); // 青白
  text(sStr, width / 2, height / 2 + min(width, height) * 0.1);
}

// 龍脈パーティクルクラス
class RyumyakuParticle {
  constructor() {
    this.pos = dragonPath[0].copy(); // 頭（北海道）から発生
    this.index = 0; // パス上の位置
    this.speed = random(0.2, 0.5); // 流れる速度
    this.size = random(3, 8);
    // 色：金（エネルギー）か青（霊力）
    this.hue = random() > 0.5 ? 45 : 200; 
  }

  update() {
    this.index += this.speed;
    
    // パスに沿って移動
    if (this.index < dragonPath.length - 1) {
      let idx = floor(this.index);
      let nextIdx = idx + 1;
      let amount = this.index - idx;
      
      // 現在の点と次の点の間を補間
      let currentP = dragonPath[idx];
      let nextP = dragonPath[nextIdx];
      this.pos = p5.Vector.lerp(currentP, nextP, amount);
      
      // 少しランダムに揺らがせる（気の流れ）
      this.pos.x += random(-2, 2);
      this.pos.y += random(-2, 2);
    }
  }

  show() {
    noStroke();
    // 加算合成で光らせる
    drawingContext.globalCompositeOperation = 'lighter';
    fill(this.hue, 80, 100, 80);
    ellipse(this.pos.x, this.pos.y, this.size);
    drawingContext.globalCompositeOperation = 'source-over';
  }

  finished() {
    // パスの終点（沖縄）まで行ったら消える
    return this.index >= dragonPath.length - 1;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateDragonPath(); // サイズが変わったら龍の形も再計算
}
