
class AiEnemyUnit extends CombatUnit {
  lastPlayerSeekedDirection;
  lastMovedDirection;
  wantMoveDirection;
  aiType;
  aiStage;

  constructor(pos, maxHp, dmg) {
    super(pos, maxHp, dmg);
    this.lastPlayerSeekedDirection = '';
    this.lastMovedDirection = '';
    this.wantMoveDirection = getRandomDirection();
    if (tryProckOfP(15)) {
      this.aiType = 'researcher';
    } else {
      this.aiType = 'hunter';
    }
    this.aiStage = 1;
  }

  resetHaunt() {
    this.aiStage = 1;
    this.lastPlayerSeekedDirection = '';
  }
}
