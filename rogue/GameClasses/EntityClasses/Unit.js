
class Unit extends Entity {
  maxHp;
  #hp;

  constructor(pos, maxHp) {
    super(pos);
    this.maxHp = maxHp;
    this.hp = maxHp;

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
