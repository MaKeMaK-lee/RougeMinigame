
class Potion extends PickupableItem {
  constructor(pos) {
    super(pos);
  }

  potionPickUpByUnit(e) {
    if (this instanceof HealingPotion) {
      return this.healingPotionPickUpByUnit(e);
    }
  }
}
