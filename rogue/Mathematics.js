
/**
 * @param {any} min
 * Min int
 * @param {any} max
 * Max int
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getNumberSettedToBorders(number, min, max) {
  if (number < min) {
    return min;
  } else if (number > max) {
    return max;
  } else {
    return number;
  }
}

/**
 * @param {number} percent
 * 1-100%
 */
function tryProckOfP(percent) {
  return getRandomInt(1, 100) <= percent;
}
