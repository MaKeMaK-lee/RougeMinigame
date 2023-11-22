
function movePositionOnDirection(pos, dir) {
  if (dir === 'u') {
    pos.y++;
  }
  if (dir === 'd') {
    pos.y--;
  }
  if (dir === 'l') {
    pos.x--;
  }
  if (dir === 'r') {
    pos.x++;
  }
  return pos;
}

function getClonePosition(pos) {
  return {x: pos.x, y: pos.y};
}

function isPositionEquals(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}
