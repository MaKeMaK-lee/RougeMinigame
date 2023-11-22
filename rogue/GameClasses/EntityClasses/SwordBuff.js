
class SwordBuff extends PickupableItem {
  damageBuff;

  constructor(pos, damageBuff) {
    super(pos);
    this.damageBuff = damageBuff;

  }

  swordBuffPickUpByUnit(e) {//потенциально нужна проверка на тип е
    e.dmg += this.damageBuff;
    return true;
  }
}
