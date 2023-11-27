
class SwordBuff extends PickupableItem {
  damageBuff;

  constructor(pos, state, damageBuff) {
    super(pos, state);
    this.damageBuff = damageBuff;

  }

  swordBuffPickUpByUnit(e) {//потенциально нужна проверка на тип е
    e.dmg += this.damageBuff;
    return true;
  }
}
