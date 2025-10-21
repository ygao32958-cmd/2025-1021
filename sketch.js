let objs = [];
let colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];

let menuItems = ["作品一", "作品二", "作品三"];
let menuWidth;
let menuHeight;
let menuItemHeight;

let iframe; // 用來放網站內容的 iframe
let animating = false; // 避免重複點擊中斷動畫

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.id('p5-canvas');
  rectMode(CENTER);
  textAlign(LEFT, CENTER);
  textSize(20);
  objs.push(new DynamicShape());

  menuWidth = width / 7;   // 寬度為螢幕的 1/7
  menuHeight = height;     // 高度為整個畫面
  menuItemHeight = menuHeight / menuItems.length;
}

function draw() {
  background(255);

  // === 動態圖形 ===
  for (let i of objs) {
    i.run();
  }

  let speedFactor = map(mouseX, 0, width, 5, 40);
  if (frameCount % int(random([speedFactor, speedFactor + 10])) == 0) {
    let addNum = int(random(1, 10));
    for (let i = 0; i < addNum; i++) {
      objs.push(new DynamicShape());
    }
  }

  objs = objs.filter(o => !o.isDead);

  // === 左側固定選單 ===
  drawMenu();
}

// === 繪製左側選單 ===
function drawMenu() {
  push();
  noStroke();
  fill(255, 255, 153, 102); // 🟡 鵝黃色 + 透明度40%
  rectMode(CORNER);
  rect(0, 0, menuWidth, menuHeight); // 固定在畫面左側

  fill(0); // 文字顏色固定黑色
  for (let i = 0; i < menuItems.length; i++) {
    let y = (i + 0.5) * menuItemHeight;
    text(menuItems[i], 20, y);
  }
  pop();
}

// === 滑鼠點擊偵測 ===
function mousePressed() {
  if (mouseX < menuWidth && !animating) {
    let clickedIndex = floor(mouseY / menuItemHeight);

    if (clickedIndex === 0) {
      fadeIframeTo("https://ygao32958-cmd.github.io/20251014/");
    } else if (clickedIndex === 1) {
      fadeIframeTo("https://ygao32958-cmd.github.io/20251014_1/");
    } else if (clickedIndex === 2) {
      fadeIframeOut();
    }
  }
}

// === iframe 淡出再淡入切換 ===
function fadeIframeTo(url) {
  animating = true;
  if (!iframe) {
    iframe = createElement("iframe");
    iframe.position(menuWidth, height * 0.1);
    iframe.size(width - menuWidth, height * 0.8);
    iframe.style("border", "none");
    iframe.style("opacity", "0");
    iframe.attribute("src", url);
    iframe.show();
    fadeIn(iframe, 500, () => (animating = false));
  } else {
    // 已存在 -> 淡出、換網址、再淡入
    fadeOut(iframe, 500, () => {
      iframe.attribute("src", url);
      fadeIn(iframe, 500, () => (animating = false));
    });
  }
}

// === 關閉 iframe（淡出）===
function fadeIframeOut() {
  if (iframe) {
    animating = true;
    fadeOut(iframe, 500, () => {
      iframe.remove();
      iframe = null;
      animating = false;
    });
  }
}

// === 淡入效果 ===
function fadeIn(el, duration, callback) {
  el.style("transition", `opacity ${duration}ms ease`);
  el.style("opacity", "1");
  setTimeout(callback, duration);
}

// === 淡出效果 ===
function fadeOut(el, duration, callback) {
  el.style("transition", `opacity ${duration}ms ease`);
  el.style("opacity", "0");
  setTimeout(callback, duration);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  menuWidth = width / 7;
  menuHeight = height;
  menuItemHeight = menuHeight / menuItems.length;

  if (iframe) {
    iframe.position(menuWidth, height * 0.1);
    iframe.size(width - menuWidth, height * 0.8);
  }
}

// === easing function ===
function easeInOutExpo(x) {
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2;
}

// === 動態形狀類別 ===
class DynamicShape {
  constructor() {
    this.x = random(0.3, 0.7) * width;
    this.y = random(0.3, 0.7) * height;
    this.reductionRatio = 1;
    this.shapeType = int(random(4));
    this.animationType = 0;
    this.maxActionPoints = int(random(2, 5));
    this.actionPoints = this.maxActionPoints;
    this.elapsedT = 0;
    this.size = 0;
    this.sizeMax = width * random(0.01, 0.05);
    this.fromSize = 0;
    this.init();
    this.isDead = false;
    this.clr = random(colors);
    this.changeShape = true;
    this.ang = int(random(2)) * PI * 0.25;
    this.lineSW = 0;
  }

  show() {
    push();
    translate(this.x, this.y);
    if (this.animationType == 1) scale(1, this.reductionRatio);
    if (this.animationType == 2) scale(this.reductionRatio, 1);
    fill(this.clr);
    stroke(this.clr);
    strokeWeight(this.size * 0.05);
    if (this.shapeType == 0) {
      noStroke();
      circle(0, 0, this.size);
    } else if (this.shapeType == 1) {
      noFill();
      circle(0, 0, this.size);
    } else if (this.shapeType == 2) {
      noStroke();
      rect(0, 0, this.size, this.size);
    } else if (this.shapeType == 3) {
      noFill();
      rect(0, 0, this.size * 0.9, this.size * 0.9);
    } else if (this.shapeType == 4) {
      line(0, -this.size * 0.45, 0, this.size * 0.45);
      line(-this.size * 0.45, 0, this.size * 0.45, 0);
    }
    pop();
    strokeWeight(this.lineSW);
    stroke(this.clr);
    line(this.x, this.y, this.fromX, this.fromY);
  }

  move() {
    let n = easeInOutExpo(norm(this.elapsedT, 0, this.duration));
    if (0 < this.elapsedT && this.elapsedT < this.duration) {
      if (this.actionPoints == this.maxActionPoints) {
        this.size = lerp(0, this.sizeMax, n);
      } else if (this.actionPoints > 0) {
        if (this.animationType == 0) {
          this.size = lerp(this.fromSize, this.toSize, n);
        } else if (this.animationType == 1) {
          this.x = lerp(this.fromX, this.toX, n);
          this.lineSW = lerp(0, this.size / 5, sin(n * PI));
        } else if (this.animationType == 2) {
          this.y = lerp(this.fromY, this.toY, n);
          this.lineSW = lerp(0, this.size / 5, sin(n * PI));
        } else if (this.animationType == 3) {
          if (this.changeShape == true) {
            this.shapeType = int(random(5));
            this.changeShape = false;
          }
        }
        this.reductionRatio = lerp(1, 0.3, sin(n * PI));
      } else {
        this.size = lerp(this.fromSize, 0, n);
      }
    }

    this.elapsedT++;
    if (this.elapsedT > this.duration) {
      this.actionPoints--;
      this.init();
    }
    if (this.actionPoints < 0) {
      this.isDead = true;
    }
  }

  run() {
    this.show();
    this.move();
  }

  init() {
    this.elapsedT = 0;
    this.fromSize = this.size;
    this.toSize = this.sizeMax * random(0.5, 1.5);
    this.fromX = this.x;
    this.toX = this.fromX + (width / 10) * random([-1, 1]) * int(random(1, 4));
    this.fromY = this.y;
    this.toY = this.fromY + (height / 10) * random([-1, 1]) * int(random(1, 4));
    this.animationType = int(random(3));
    this.duration = random(20, 50);
  }
}







