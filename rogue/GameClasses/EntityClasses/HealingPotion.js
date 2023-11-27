
class HealingPotion extends PickupableItem {
  healingHpCount;

  constructor(pos, state, healingHpCount) {
    super(pos, state);
    this.healingHpCount = healingHpCount;

  }

  healingPotionPickUpByUnit(e) {//потенциально нужна проверка на тип е
    e.getHeal(this.healingHpCount);
    return true;
  }
}
