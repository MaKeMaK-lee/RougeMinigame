
class PickupableItem extends Entity {
  constructor(pos) {
    super(pos);
  }

  pickUpByUnit(unit) {
    if (this instanceof HealingPotion) {
      return this.healingPotionPickUpByUnit(unit);
    } else if (this instanceof SwordBuff) {
      return this.swordBuffPickUpByUnit(unit);
    }
  }
}
