class Tile {
  /**0 - trail
   * 1 - wall*/
  type;
  pos;

  /** @param {any} tileType
   * number 0 or 1
   * or (respectively)
   * string trail or wall
   * @param {{x: number, y: number}} position
   * Must be if it is not init
   */
  constructor(tileType, position = undefined) {
    if (typeof tileType == 'number') {
      if (tileType >= 0 && tileType <= 1) {
        this.type = tileType;
      } else {
        throw 'Unexpected number to tileType';
      }
    } else {
      this.type = {trail: 0, wall: 1}[tileType];
      if (typeof this.type == 'undefined') {
        throw 'Unexpected string to tileType';
      }
    }
    this.pos = position;
  }

  isWall(){
    return this.type === 1;
  }
}
