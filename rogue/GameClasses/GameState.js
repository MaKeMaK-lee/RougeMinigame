class GameState {
  field;
  entities;//TODO Неплохо бы добавить отдельные списки (при этом не удаляя элементы из этого)
  player;

  //without params for new GameStage
  constructor() {
    this.field = new Field();
    this.initEntities();
  }

  removeFromEntities(e) {
    this.entities.splice(this.entities.findIndex(a => a === e), 1);
    if (e instanceof Unit) {
      if (this.entities.filter(e => e instanceof AiEnemyUnit).length === 0) {
        alert(
          '   !!!___VICTORY!___!!!\n' +
          'Your stats:\n' +
          'HP: ' + this.player.hp + ' / ' + this.player.maxHp + '\n' +
          'DMG: ' + this.player.dmg + '\n' +
          '\n' +
          '   Thanks for playing!');
      }
      if (e === this.player) {
        alert(
          '   -GAME OVER-\n' +
          'Your stats:\n' +
          'HP: ' + this.player.hp + ' / ' + this.player.maxHp + '\n' +
          'DMG: ' + this.player.dmg + '\n' +
          '\n' +
          'You has been defeat, but dont despair! Just try again!');
      }
    }
  }

  isTileExistsAndAvailableToMove(pos) {
    if (this.isTileExistsAndAvailableToLook(pos)) {
      if (this.entities.filter(e => e instanceof Unit).filter(e => isPositionEquals(e.pos, pos)).length === 0) {
        return true;
      }
    }
    return false;
  }

  isTileExistsAndAvailableToLook(pos) {
    if (this.field.isFieldContainsPosition(pos)) {
      if (!this.field.tiles[pos.y][pos.x].isWall()) {
        return true;
      }
    }
    return false;
  }

  isTileContainEntity(tile) {
    for (let entity of this.entities) {
      if (isPositionEquals(tile.pos, entity.pos)) {
        return true;
      }
    }
    return false;
  }

  initEntities() {
    this.entities = Array();
  }
}
