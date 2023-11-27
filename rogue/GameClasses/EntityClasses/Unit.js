
class Unit extends Entity {
  maxHp;
  #hp;
  dmg;

  constructor(pos, state, maxHp, dmg) {
    super(pos, state);
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.dmg = dmg;

  }

  get hp() {
    return this.#hp;
  }

  set hp(value) {
    this.#hp = getNumberSettedToBorders(value, 0, this.maxHp);
  }

  getDamage(hpLoss) {
    this.hp = this.hp - hpLoss;
  }

  getHeal(hpAdd) {
    this.hp = this.hp + hpAdd;
  }

  areaAttack(center, radius) {
    let area = getRectangleFromCenterAndRadiusSafeToArgs(center, radius);
    for (let target of this.state.entities.filter(e => e instanceof Unit && e !== this)) {
      if (isRectangleContainsPosition(area, target.pos)) {
        this.attack(target);
      }
    }
    return true;
  }

  attack(target) {
    this.damageEntity(target, this.dmg);
  }

  damageEntity(target, value) {
    target.getDamage(value);
    if (target.hp === 0) {
      this.state.removeFromEntities(target);
    }
  }

  tryMove(direction) {
    let newPos = {x: this.pos.x, y: this.pos.y};
    movePositionOnDirection(newPos, direction);
    if (this.state.isTileExistsAndAvailableToMove(newPos)) {
      this.pos.x = newPos.x;
      this.pos.y = newPos.y;

      if (this === this.state.player)//вообще тут должна быть функция проверки может ли ent поднять предмет
      {
        this.applyEffectsOnTileAfterMove(this);
      }
      if (this instanceof AiEnemyUnit) {
        this.lastMovedDirection = direction;
      }
      return true;
    }
    return false;
  }

  applyEffectsOnTileAfterMove() {
    let effectEntities = this.state.entities.filter(e => isPositionEquals(e.pos, this.pos) && e instanceof PickupableItem);
    for (let eE of effectEntities) {
      if (eE.pickUpByUnit(this)) {
        this.state.removeFromEntities(eE);
      }
    }
  }

  getPercentOfHp() {
    return (this.hp / this.maxHp) * 100;
  }
}
