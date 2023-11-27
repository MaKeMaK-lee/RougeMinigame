class Game {
  state;

  //Settings - вынес бы я это, но пока смысла не вижу
  playerMaxHp = 100;
  playerBaseDmg = 25;
  enemyMaxHp = 100;
  enemyBaseDmg = 9;
  potionMinHealingHpCount = 5;
  potionMaxHealingHpCount = 35;
  swordBuffMinDamageBuff = 15;
  swordBuffMaxDamageBuff = 50;

  countSwordsBuffMin = 2;
  countSwordsBuffMax = 2;
  countHealingPotionMin = 10;
  countHealingPotionMax = 10;
  countEnemy1Min = 10;
  countEnemy1Max = 10;

  constructor() {

  }

  init() {
    this.state = new GameState();

    this.generateRandomStartEntities();

    render(this.state);

    document.addEventListener('keydown', function (event) {
      switch (event.code) {
        case 'KeyW':
          game.doTurn('PressW');
          break;
        case 'KeyS':
          game.doTurn('PressS');
          break;
        case 'KeyA':
          game.doTurn('PressA');
          break;
        case 'KeyD':
          game.doTurn('PressD');
          break;
        case 'Space':
          game.doTurn('PressSpace');
          break;
        default:
          break;
      }
    });
  }

  //не хотите же вы скажать, что эта функция - копипаст лисенера?...
  doTurn(action) {
    switch (action) {
      case 'PressW':
        if (!this.state.player.tryMove('u' )) {
          return;
        }
        break;
      case 'PressS':
        if (!this.state.player.tryMove('d' )) {
          return;
        }
        break;
      case 'PressA':
        if (!this.state.player.tryMove('l' )) {
          return;
        }
        break;
      case 'PressD':
        if (!this.state.player.tryMove('r' )) {
          return;
        }
        break;
      case 'PressSpace':
        this.state.player.areaAttack(this.state.player.pos, 1);
        break;
      default:
        return;
    }

    aiTurn(this);

    render(this.state);
  }

  generateRandomStartEntities() {
    let emptyTiles = this.state.field.tiles.flat().filter(tile => tile.type === 0 && !this.state.isTileContainEntity(tile)).map(tile => tile.pos);

    this.state.player = this.spawnOnEmptyTiles(Unit, this.state.entities, emptyTiles, this.spawnEntity,
      [getRandomInt(this.playerMaxHp, this.playerMaxHp),getRandomInt(this.playerBaseDmg,this.playerBaseDmg)]
    );
    this.spawnManyOnEmptyTiles(SwordBuff,this.state.entities, emptyTiles, this.countSwordsBuffMax, this.spawnEntity,
      [getRandomInt(this.swordBuffMinDamageBuff, this.swordBuffMaxDamageBuff)]
    );
    this.spawnManyOnEmptyTiles(HealingPotion,this.state.entities, emptyTiles, this.countHealingPotionMax, this.spawnEntity,
      [getRandomInt(this.potionMinHealingHpCount, this.potionMaxHealingHpCount)]
    );
    this.spawnManyOnEmptyTiles(AiEnemyUnit,this.state.entities, emptyTiles, this.countEnemy1Max, this.spawnEntity,
      [getRandomInt(this.enemyMaxHp, this.enemyMaxHp),getRandomInt(this.enemyBaseDmg,this.enemyBaseDmg)]
    );
  }

  spawnManyOnEmptyTiles(eType, eCollection, emptyTiles, spawnCount, spawnFunction, spawnFunctionArgsExcludingPositionAndType) {
    let e;
    let spawnedEs = [];
    while (spawnCount > 0) {
      e = this.spawnOnEmptyTiles(eType, eCollection, emptyTiles, spawnFunction, spawnFunctionArgsExcludingPositionAndType);
      if (e === undefined)
        return e;
      else
        spawnedEs.push(e);

      spawnCount--;
    }
    return spawnedEs;
  }

  spawnOnEmptyTiles(eType, eCollection, emptyTiles, spawnFunction, spawnFunctionArgsExcludingPositionAndType) {
    if (emptyTiles.length === 0) {
      return undefined;
    }
      let randomNumberOfEmptyTile = getRandomInt(1, emptyTiles.length);
      let newRandomEmptyPosition = emptyTiles[randomNumberOfEmptyTile - 1];
      let e = spawnFunction(eType,eCollection, newRandomEmptyPosition, this.state, spawnFunctionArgsExcludingPositionAndType);
      emptyTiles.splice(randomNumberOfEmptyTile - 1, 1);
      return e;
  }

  spawnEntity(entityType,eCollection, pos, state, spawnArgs) {
    let entity = new entityType.prototype.constructor({x: pos.x, y: pos.y}, state, ...spawnArgs);
    eCollection.push(entity);
    return entity;
  }
}
