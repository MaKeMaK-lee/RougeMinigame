
class Unit extends Entity {
  maxHp;
  #hp;
  dmg;

  constructor(pos, maxHp, dmg) {
    super(pos);
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

  getPercentOfHp() {
    return (this.hp / this.maxHp) * 100;
  }
}
