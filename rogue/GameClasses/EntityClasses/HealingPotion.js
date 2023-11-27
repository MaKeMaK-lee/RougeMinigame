
class HealingPotion extends PickupableItem {
  healingHpCount;

  constructor(pos, healingHpCount) {
    super(pos);
    this.healingHpCount = healingHpCount;

  }

  healingPotionPickUpByUnit(e) {//потенциально нужна проверка на тип е
    e.getHeal(this.healingHpCount);
    return true;
  }
}
