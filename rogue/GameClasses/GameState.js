class GameState {
  field;
  entities;//TODO Неплохо бы добавить отдельные списки (при этом не удаляя элементы из этого)

  //without params for new GameStage
  constructor() {
    this.field = new Field();
    this.initEntities();
  }

  removeFromEntities(e) {
    this.entities.splice(this.entities.findIndex(a => a === e), 1);
    if (e instanceof Unit) {
      if (this.entities.filter(e => e instanceof Enemy1).length === 0) {
        alert(
          '   !!!___VICTORY!___!!!\n' +
          'Your stats:\n' +
          'HP: ' + game.player.hp + ' / ' + game.player.maxHp + '\n' +
          'DMG: ' + game.player.dmg + '\n' +
          '\n' +
          '   Thanks for playing!');
      }
      if (e instanceof Player) {
        alert(
          '   -GAME OVER-\n' +
          'Your stats:\n' +
          'HP: ' + game.player.hp + ' / ' + game.player.maxHp + '\n' +
          'DMG: ' + game.player.dmg + '\n' +
          '\n' +
          'You has been defeat, but dont despair! Just try again!');
      }
    }
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
