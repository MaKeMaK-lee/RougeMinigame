class Game {
  state;
  player;

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
        if (!this.tryMove('u', this.player)) {
          return;
        }
        break;
      case 'PressS':
        if (!this.tryMove('d', this.player)) {
          return;
        }
        break;
      case 'PressA':
        if (!this.tryMove('l', this.player)) {
          return;
        }
        break;
      case 'PressD':
        if (!this.tryMove('r', this.player)) {
          return;
        }
        break;
      case 'PressSpace':
        this.areaAttack(this.player, this.player.pos, 1);
        break;
      default:
        return;
    }

    aiTurn(this);

    render(this.state);
  }

  attack(attacker, target) {
    this.damageEntity(target, attacker.dmg);
  }

  damageEntity(target, value) {
    target.getDamage(value);
    if (target.hp === 0) {
      this.state.removeFromEntities(target);
    }
  }

  areaAttack(attacker, center, radius) {
    let area = getRectangleFromCenterAndRadiusSafeToArgs(center, radius);
    for (let target of this.state.entities.filter(e => e instanceof Unit && e !== attacker)) {
      if (isRectangleContainsPosition(area, target.pos)) {
        this.attack(attacker, target);
      }
    }
    return true;
  }

  tryMove(direction, entity) {
    let newPos = {x: entity.pos.x, y: entity.pos.y};
    movePositionOnDirection(newPos, direction);
    if (this.isTileExistsAndAvailableToMove(newPos)) {
      entity.pos.x = newPos.x;
      entity.pos.y = newPos.y;

      if (entity instanceof Player)//вообще тут должна быть функция проверки может ли ent поднять предмет
      {
        this.applyEffectsOnTileAfterMove(entity);
      }
      if (entity instanceof AiEnemyUnit) {
        entity.lastMovedDirection = direction;
      }
      return true;
    }
    return false;
  }

  applyEffectsOnTileAfterMove(entity) {
    let effectEntities = this.state.entities.filter(e => isPositionEquals(e.pos, entity.pos) && e instanceof PickupableItem);
    for (let eE of effectEntities) {
      if (eE.pickUpByUnit(entity)) {
        this.state.removeFromEntities(eE);
      }
    }
  }

  isTileExistsAndAvailableToMove(pos) {
    if (this.isTileExistsAndAvailableToLook(pos)) {
        if (this.state.entities.filter(e => e instanceof Unit).filter(e => isPositionEquals(e.pos, pos)).length === 0) {
          return true;
        }
    }
    return false;
  }

  isTileExistsAndAvailableToLook(pos) {
    if (this.state.field.isFieldContainsPosition(pos)) {
      if (this.state.field.tiles[pos.y][pos.x].type === 0) {
        return true;
      }
    }
    return false;
  }

  generateRandomStartEntities() {
    let emptyTiles = this.state.field.tiles.flat().filter(tile => tile.type === 0 && !this.state.isTileContainEntity(tile)).map(tile => tile.pos);

    this.player = this.spawnOnEmptyTiles(Player, this.state.entities, emptyTiles, this.spawnEntity,
      [getRandomInt(this.playerMaxHp, this.playerMaxHp),getRandomInt(this.playerBaseDmg,this.playerBaseDmg)]
    );
    this.spawnManyOnEmptyTiles(SwordBuff,this.state.entities, emptyTiles, this.countSwordsBuffMax, this.spawnEntity,
      [getRandomInt(this.swordBuffMinDamageBuff, this.swordBuffMaxDamageBuff)]
    );
    this.spawnManyOnEmptyTiles(HealingPotion,this.state.entities, emptyTiles, this.countHealingPotionMax, this.spawnEntity,
      [getRandomInt(this.potionMinHealingHpCount, this.potionMaxHealingHpCount)]
    );
    this.spawnManyOnEmptyTiles(Enemy1,this.state.entities, emptyTiles, this.countEnemy1Max, this.spawnEntity,
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
      let e = spawnFunction(eType,eCollection, newRandomEmptyPosition, spawnFunctionArgsExcludingPositionAndType);
      emptyTiles.splice(randomNumberOfEmptyTile - 1, 1);
      return e;
  }

  spawnEntity(entityType,eCollection, pos, spawnArgs) {
    let entity = new entityType.prototype.constructor({x: pos.x, y: pos.y}, ...spawnArgs);
    eCollection.push(entity);
    return entity;
  }
}
