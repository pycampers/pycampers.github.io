function inRadians(degrees) {
  return degrees * (Math.PI / 180);
}

const SPEED = 1;
const TEXTURE_SCALE = 0.25;
const SQUIGGLY_SCALE = 30;
const POINT_SPACING = 30;

const BORDER_SIDES = {
  left: 0,
  top: 1,
  right: 2,
  bottom: 3
};

const canvas = document.getElementById("border-canvas");
const content = document.getElementById("content");
const app = new PIXI.Application({ view: canvas, transparent: true });
let snekLength;
let snekBreadth;

function loadSnek(initX, initY, borderSide) {
  const texture = PIXI.Texture.fromImage("images/snake.png");
  texture.baseTexture.on("loaded", function() {
    function onResize() {
      console.log("onresize!");
      app.view.width = content.offsetWidth + snekBreadth * 2;
      app.view.height = content.offsetHeight + snekBreadth * 2;

      app.renderer.resize(app.view.width, app.view.height);

      snekLength = texture.width * TEXTURE_SCALE;
      snekBreadth = texture.height * TEXTURE_SCALE;
    }
    if (document.body.onresize == null) {
      document.body.onresize = onResize;
      onResize();
      onResize();
      onResize();
    }

    let points = [];
    for (let i = 0; i < 40; i++) {
      points.push(new PIXI.Point(i * POINT_SPACING, 0));
    }

    const snek = new PIXI.mesh.Rope(texture, points);
    fixRotation();
    snek.x = initX;
    snek.y = initY;
    snek.scale = {
      x: TEXTURE_SCALE,
      y: TEXTURE_SCALE
    };
    app.stage.addChild(snek);

    let count = 0;

    function fixRotation() {
      switch (borderSide) {
        case BORDER_SIDES.left:
          snek.rotation = -inRadians(90);
          break;
        case BORDER_SIDES.top:
          snek.rotation = inRadians(0);
          break;
        case BORDER_SIDES.right:
          snek.rotation = inRadians(90);
          break;
        case BORDER_SIDES.bottom:
          snek.rotation = inRadians(180);
          break;
      }
    }

    function reRenderSnek(turnIndex) {
      count += 0.1;
      // count %= 100;

      for (let i = 0; i < points.length; i++) {
        if (turnIndex != null && i > turnIndex && turnIndex > 1) {
          points[i] = {
            x:
              points[turnIndex - 1].x +
              Math.sin(i + count) * SQUIGGLY_SCALE +
              50,
            y: points[turnIndex - 1].y + POINT_SPACING * (i - turnIndex + 1)
          };
        } else {
          points[i].y = Math.sin(i + count) * SQUIGGLY_SCALE;
          points[i].x = i * POINT_SPACING + Math.cos(i * 0.3 + count) * 20;
        }
      }
    }

    let isTurning = false,
      curTurnIndex,
      pauseCounter,
      nextSide;

    function advanceSnek() {
      if (isTurning) {
        pauseCounter += 0.5;
        if (curTurnIndex <= 0) {
          isTurning = false;
          borderSide = nextSide;
          fixRotation();
        }
        if (pauseCounter >= 2) {
          curTurnIndex -= 1;
          pauseCounter = 0;
          switch (borderSide) {
            case BORDER_SIDES.left:
              snek.y -= POINT_SPACING / 4;
              break;
            case BORDER_SIDES.top:
              snek.x += POINT_SPACING / 4;
              break;
            case BORDER_SIDES.right:
              snek.y += POINT_SPACING / 4;
              break;
            case BORDER_SIDES.bottom:
              snek.x -= POINT_SPACING / 4;
              break;
          }
        }
        return curTurnIndex;
      }

      switch (borderSide) {
        case BORDER_SIDES.left:
          if (snek.y < snekLength + 100) {
            isTurning = true;
            curTurnIndex = points.length;
            pauseCounter = 0;
            nextSide = BORDER_SIDES.top;
          } else {
            snek.y -= SPEED;
            snek.x = snekBreadth;
          }
          break;
        case BORDER_SIDES.top:
          if (snek.x > app.view.width - snekLength - 100) {
            isTurning = true;
            curTurnIndex = points.length;
            pauseCounter = 0;
            nextSide = BORDER_SIDES.right;
          } else {
            snek.x += SPEED;
            snek.y = snekBreadth;
          }
          break;
        case BORDER_SIDES.right:
          if (snek.y > app.view.height - snekLength - 100) {
            isTurning = true;
            curTurnIndex = points.length;
            pauseCounter = 0;
            nextSide = BORDER_SIDES.bottom;
          } else {
            snek.y += SPEED;
            snek.x = app.view.width - snekBreadth;
          }
          break;
        case BORDER_SIDES.bottom:
          if (snek.x < snekLength + 100) {
            isTurning = true;
            curTurnIndex = points.length;
            pauseCounter = 0;
            nextSide = BORDER_SIDES.left;
          } else {
            snek.x -= SPEED;
            snek.y = app.view.height - snekBreadth;
          }
          break;
      }
      return null;
    }

    let res = null;
    app.ticker.add(function() {
      reRenderSnek(advanceSnek());
      res = advanceSnek();
    });
  });
}

document.body.onload = function() {
  loadSnek(400, document.body.clientHeight / 2, BORDER_SIDES.top);
  loadSnek(50, document.body.clientHeight / 2, BORDER_SIDES.left);
  loadSnek(
    document.body.clientWidth / 2,
    document.body.clientHeight / 2,
    BORDER_SIDES.right
  );
};
