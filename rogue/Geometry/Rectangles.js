
/**
 * @param {{startX, startY, sizeX, sizeY}} rectangle
 * cut this
 * @param {[][]} target
 * to borders of that
 * */
function cutRectangleToTargetRectangle(rectangle, target) {
  let d;
  if (rectangle.startX < 0) {
    rectangle.sizeX += rectangle.startX;
    rectangle.startX = 0;
  }
  if (rectangle.startY < 0) {
    rectangle.sizeY += rectangle.startY;
    rectangle.startY = 0;
  }
  d = (target[0].length - 1) - (rectangle.startX + (rectangle.sizeX - 1));
  if (d < 0) {
    rectangle.sizeX += d;
  }
  d = (target.length - 1) - (rectangle.startY + (rectangle.sizeY - 1));
  if (d < 0) {
    rectangle.sizeY += d;
  }
}

/**
 * Cut subrectangle to borders of rectangle and do with elements of specified places on Rectangle
 * @param rectangle
 * Main rectangle array[][]
 * @param startX
 * of subrectangle
 * @param startY
 * of subrectangle
 * @param sizeX
 * of subrectangle
 * @param sizeY
 * of subrectangle
 * @param doThat
 * something to do
 * @param calledByObject
 * if doing to object
 * @param isRectFillByLinks
 * set true if rect filled by objects
 */
function forceDoWithSubRectangle(rectangle, startX, startY, sizeX, sizeY, doThat, calledByObject = undefined, isRectFillByLinks = false) {
  let cutedParams = {startX: startX, startY: startY, sizeX: sizeX, sizeY: sizeY};
  cutRectangleToTargetRectangle(cutedParams, rectangle);

  doWithSubRectangle(rectangle, cutedParams.startX, cutedParams.startY, cutedParams.sizeX, cutedParams.sizeY, doThat, calledByObject, isRectFillByLinks);
}

//todo fix doWithRect funcs sub- args of from spreaded to object
/**
 * Do with elements of specified places on Rectangle
 * @param {[][]} rectangle
 * Main rectangle two dim array[][], contains elements to do
 * @param startX
 * of subrectangle
 * @param startY
 * of subrectangle
 * @param sizeX
 * of subrectangle
 * @param sizeY
 * of subrectangle
 * @param doThat
 * something to do
 * @param calledByObject
 * if doing to object
 * @param isRectFillByLinks
 * set true if rect filled by objects
 */
function doWithSubRectangle(rectangle, startX, startY, sizeX, sizeY, doThat, calledByObject = undefined, isRectFillByLinks = false) {
  let currentTileY = startY;
  for (let row = 1; row <= sizeY; row++, currentTileY++) {
    let currentTileX = startX;
    for (let col = 1; col <= sizeX; col++, currentTileX++) {
      if (calledByObject === undefined) {
        if (isRectFillByLinks) {
          doThat(rectangle[currentTileY][currentTileX]);
        } else {
          doThat(rectangle, currentTileY, currentTileX);
        }
      } else {
        if (isRectFillByLinks) {
          doThat(rectangle[currentTileY][currentTileX], calledByObject);
        } else {
          doThat(rectangle, currentTileY, currentTileX, calledByObject);
        }
      }
    }
  }
}

/**
 * @param {{start:{x,y},size:{x,y}}} rectangle
 * @param {{x,y}} pos
 * @returns {boolean}
 */
function isRectangleContainsPosition(rectangle, pos) {
  return pos.x >= rectangle.start.x &&
    pos.x <= endOfRectangle(rectangle, false) &&
    pos.y >= rectangle.start.y &&
    pos.y <= endOfRectangle(rectangle, true);
}

function endOfRectangle(rect, isY) {
  return ((isY
    ? rect.start.y + rect.size.y
    : rect.start.x + rect.size.x) - 1);
}

function getRectangleFromCenterAndRadiusSafeToArgs(center, radius) {
  return {
    start: {x: center.x - radius, y: center.y - radius},
    size: {x: radius * 2 + 1, y: radius * 2 + 1},
  };
}
