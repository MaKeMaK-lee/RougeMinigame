
class AiEnemyUnit extends Unit {
  lastPlayerSeekedDirection;
  lastMovedDirection;
  wantMoveDirection;
  aiType;
  aiStage;

  constructor(pos, state, maxHp, dmg) {
    super(pos, state, maxHp, dmg);
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
