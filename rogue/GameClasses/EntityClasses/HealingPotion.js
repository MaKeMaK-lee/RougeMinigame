
class HealingPotion extends Potion {
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
