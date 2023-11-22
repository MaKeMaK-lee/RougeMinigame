
class CombatUnit extends Unit {
  dmg;

  constructor(pos, maxHp, dmg) {
    super(pos, maxHp);
    this.dmg = dmg;
  }
}
