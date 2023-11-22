/**
 * dir to turn
 * @param {'u', 'd', 'l', 'r'}dir
 * @param {'left','right'}side
 */
function getTurnedDirection(dir,side){
  return side === 'left'?
    getTurnLeftDirection(dir):
    getTurnRightDirection(dir);
}

function getTurnLeftDirection(dir) {
  if (dir === 'r') {
    return 'u';
  }
  if (dir === 'u') {
    return 'l';
  }
  if (dir === 'd') {
    return 'r';
  }
  if (dir === 'l') {
    return 'd';
  }
}

function getInverseDirection(dir) {
  if (dir === 'r') {
    return 'l';
  }
  if (dir === 'u') {
    return 'd';
  }
  if (dir === 'd') {
    return 'u';
  }
  if (dir === 'l') {
    return 'r';
  }
}

function getTurnRightDirection(dir) {
  if (dir === 'r') {
    return 'd';
  }
  if (dir === 'u') {
    return 'r';
  }
  if (dir === 'd') {
    return 'l';
  }
  if (dir === 'l') {
    return 'u';
  }
}

function getAnotherRandomDirection(dirs) {
  let tmp = ['u', 'd', 'l', 'r'].filter(d => !dirs.map(x => x === d).includes(true));
  let r = getRandomInt(0, tmp.length - 1);
  return tmp[r];
}

function getRandomDirection() {
  let r = getRandomInt(0, 3);
  //return ['u','d','l','r'][r];
  if (r === 0) {
    return 'u';
  }
  if (r === 1) {
    return 'd';
  }
  if (r === 2) {
    return 'l';
  }
  if (r === 3) {
    return 'r';
  }
}
