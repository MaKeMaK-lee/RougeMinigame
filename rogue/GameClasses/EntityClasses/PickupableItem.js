
class PickupableItem extends Entity {
  constructor(pos) {
    super(pos);
  }

  pickUpByUnit(unit) {
    if (this instanceof Potion) {
      return this.potionPickUpByUnit(unit);
    } else if (this instanceof SwordBuff) {
      return this.swordBuffPickUpByUnit(unit);
    }
  }
}
