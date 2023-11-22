/*
 * Комнаты могут быть расположены вплотную - решил я потому что так круче и потому что в картинке в тз есть такой пример
 *
 *
 *
 * Есть места с дублированием строк, но если их две, то смысла заменять на цикл (то есть тоже две строки, только менее удобочитаемые) не вижу.
 *
 * Мне не очень хотелось добавлять каждой клетке хранение своих координат, но в итоге я таки решил сделать это в угоду скорости
 * Здесь относительно часто используется instanceof - потому что мне привычно ООП, но в целом я бы ещё сравнил что лучше - это, или доп. поля
 * */

//#region Classes

/**
 *
 * @param {GameState} gameState
 */
function render(gameState) {
  $('#field').html('');
  renderField(gameState.field);
  renderEntities(gameState.entities);

  function renderEntity(e){
    let x = e.pos.x * 32;
    let y = (fieldSizeY - (e.pos.y + 1)) * 32;

    let tileClass;
    switch (e.constructor.name){
      case ("HealingPotion"):
        tileClass = 'tileHP';
        break;
      case ("Enemy1"):
        tileClass = 'tileE';
        break;
      case ("SwordBuff"):
        tileClass = 'tileSW';
        break;
      case ("Player"):
        tileClass = 'tileP';
        break;
    }

    let element = jQuery('<div/>', {
      class: 'tile' + ' ' + tileClass,
      style: 'left: ' + x + 'px; top:' + y + 'px;',
    });

    if (e instanceof Unit) {

      let hpBar = jQuery('<div/>', {
        class: 'health' ,
        style: 'width:' + e.getPercentOfHp() + '%;',
      });
      hpBar.appendTo(element);
    }

    element.appendTo('#field');
  }

  function renderEntities(entities) {
    for (let entity of entities) {
      renderEntity(entity);
    }
  }

  /**
   *
   * @param {Field} field
   */
  function renderField(field) {
    let tiles = field.tiles;
    let rowIndex = 0;
    let currentX = 0;
    let currentY = 0;
    for (let rowIndex = tiles.length - 1; rowIndex >= 0; rowIndex--) {
      currentX = 0;
      for (let columnIndex = 0; columnIndex < tiles[rowIndex].length; columnIndex++) {
        let tileClass = tiles[rowIndex][columnIndex].type === 0
          ?
          'tile-'
          :
          'tileW';
        jQuery('<div/>', {
          class: 'tile' + ' ' + tileClass,
          style: 'left: ' + currentX + 'px; top:' + currentY + 'px;',
        }).appendTo('#field');
        currentX += 32;
      }
      currentY += 32;
    }
  }
}



class Game {
  state;
  player;
  //Settings - вынес бы я это, но пока смысла не вижу
  playerMaxHp = 100;
  playerBaseDmg = 25;
  enemyMaxHp = 100;
  enemyBaseDmg = 5;
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
    //test();

    this.state = new GameState();

    this.generateRandomStartEntities();






    render(this.state);




    document.addEventListener('keydown', function(event) {
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

  doTurn(action){
    switch (action) {
    case 'PressW':
      if(!this.tryMove('u', this.player ))
        return;
      break;
    case 'PressS':
      if(!this.tryMove('d', this.player ))
        return;
      break;
    case 'PressA':
      if(!this.tryMove('l', this.player ))
        return;
      break;
    case 'PressD':
      if(!this.tryMove('r', this.player ))
        return;
      break;
    case 'PressSpace':
      this.areaAttack(this.player, this.player.pos,1);
      break;
    default:
      return;
    }

     this.aiTurn();

    //console.log('Units:');
    //console.log(this.state.entities.filter(e => e instanceof Unit));
    render(this.state);
  }

  //Todo upd researchers aistages for explicit loop in tunnels with closed ends
  //TODO сделать AI рандом того левши они или правши, для инверсии базовых поворотов
  //Спешу, поэтому пока что ai просто действуют через эту функцию
  aiTurn(){
    console.log('AI START TURNS');
    let aiEnemies = this.state.entities.filter(e=> e instanceof Enemy1);
    for (let aE of aiEnemies) {
      this.aiEnemyTurn(aE);
    }




  }

  aiEnemyTurn(aE){
    console.log(aE);
    //vision
    let newDir = this.aiTrySeekPlayer(aE);
    aE.lastPlayerSeekedDirection = newDir ?? aE.lastPlayerSeekedDirection;
    console.log('AI VISION PASSED. Direction:' +   aE.lastPlayerSeekedDirection);
    //try attack
    if (!this.aiTryFindAndAttackNearbyPlayer(aE, 1)) {
      //move
      if (aE.aiType === 'hunter') {
        let successMoved;
        do {
          if (aE.lastPlayerSeekedDirection !== '') {
            if (!this.tryMove(aE.lastPlayerSeekedDirection, aE)){
              if(!this.isAiEnemyOnPosition(movePositionOnDirection(getClonePosition(aE.pos),aE.lastPlayerSeekedDirection))) {//Todo AI Стоят если их несколько подряд и первому некуда свернуть
                aE.resetHaunt();
              }else
                break;
            }
            else
              break;
          } else {
            switch (aE.aiStage) {
              case 1:
              case 2:
              case 3:
                successMoved = this.tryMove(aE.wantMoveDirection, aE);
                if (!successMoved) {
                  aE.wantMoveDirection = getTurnLeftDirection(aE.wantMoveDirection);
                  aE.aiStage++;
                  if(this.isAiEnemyOnPosition(movePositionOnDirection(getClonePosition(aE.pos),aE.wantMoveDirection))) {
                    successMoved = true;
                  }
                }
                break;
              case 4:
                do {
                  let dimsFilter = [aE.lastMovedDirection];
                  aE.wantMoveDirection = getAnotherRandomDirection(dimsFilter);
                  successMoved = this.tryMove(aE.wantMoveDirection, aE);
                  if (!successMoved){
                    dimsFilter.push(aE.wantMoveDirection);
                    if(this.isAiEnemyOnPosition(movePositionOnDirection(getClonePosition(aE.pos),aE.wantMoveDirection))) {
                      successMoved = true;
                    }
                  }
                } while (successMoved);
                aE.aiStage = tryProckOfP(60)
                  ? 5
                  : getRandomInt(1, 2);
                break;
              case 5:
              case 6:
              case 7:
                successMoved = this.tryMove(aE.wantMoveDirection, aE);
                if (!successMoved) {
                  aE.wantMoveDirection = getTurnRightDirection(aE.wantMoveDirection);
                  aE.aiStage++;
                  if(this.isAiEnemyOnPosition(movePositionOnDirection(getClonePosition(aE.pos),aE.wantMoveDirection))){
                    successMoved=true;
                  }
                }
                break;
              case 8:
                let onTurnLeftPos = {x: aE.pos.x, y: aE.pos.y};
                movePositionOnDirection(onTurnLeftPos, getTurnLeftDirection(aE.wantMoveDirection));
                if (this.isTileExistsAndAvailableToMove(onTurnLeftPos))
                  aE.wantMoveDirection = getTurnLeftDirection(aE.wantMoveDirection);

                successMoved = this.tryMove(aE.wantMoveDirection, aE);
                if (!successMoved) {
                  aE.wantMoveDirection = getTurnRightDirection(aE.wantMoveDirection);
                  if(this.isAiEnemyOnPosition(movePositionOnDirection(getClonePosition(aE.pos),aE.wantMoveDirection))) {
                    successMoved = true;
                  }
                }
                if (successMoved)
                  if (tryProckOfP(2))
                    aE.aiStage = getRandomInt(1, 4);
                break;
              default:
                break;

            }
          }
        } while (!successMoved);
      } else if (aE.aiType === 'researcher') {

        let dimsFilter = [aE.lastMovedDirection];
        while (!this.tryMove(aE.wantMoveDirection, aE)) {
          dimsFilter.push(aE.wantMoveDirection);
          aE.wantMoveDirection = getAnotherRandomDirection(dimsFilter);
          if(dimsFilter.length>3) {
            break;
          }
        }
      } else {
        return;
      }
      let newDir = this.aiTrySeekPlayer(aE);
      aE.lastPlayerSeekedDirection = newDir ?? aE.lastPlayerSeekedDirection;
      console.log('AI MOVE PASSED');
    }
    return;
  }

  isAiEnemyOnPosition(pos){
  for (let e of this.state.entities.filter(e=>e instanceof AiEnemyUnit)) {
    if (isPositionEquals(pos, e.pos))
      return true;
  }
}


  getRectangleFromCenterAndRadiusSafeToArgs(center,radius){
    return {start:{x:center.x-radius,y:center.y-radius},
      size:{x:radius*2+1,y:radius*2+1}};
  }


  aiTryFindAndAttackNearbyPlayer(ai, attackRange){
    console.log('AI TRY ATTACK');
      let area = this.getRectangleFromCenterAndRadiusSafeToArgs(ai.pos,attackRange);
        if (isRectangleContainsPosition(area, this.player.pos)){
          this.attack(ai, this.player);
          return true;
        }
        return false;
    }

  aiTrySeekPlayer(ai) {
    for (let dir of ['u','d','l','r']) {
      if (this.aiTrySeekPlayerOnDirection(ai, dir))
        return dir;
    }
    return undefined;
  }


  aiTrySeekPlayerOnDirection(ai, dir){
    console.log('_____====___=__=________');
    let pointToSeek = getClonePosition(ai.pos);
    do {
        movePositionOnDirection(pointToSeek, dir);
        if (this.isTileExistsAndAvailableToLook(pointToSeek)){
          if (isPositionEquals(pointToSeek,this.player.pos)){
            console.log('%%%%%%%%%%%%%%%%%%%%$$$$$$$$$$$)))))))))))))))))))))))))))))))))');
            return true;}
        } else {
          console.log('@@@@@@@@@@@@@@@@@@@@');
          return false;
        }
      } while (true)
  }


  attack(attacker, target){
    this.damageEntity(target, attacker.dmg);
  }


  damageEntity(target, value){
    target.getDamage(value);
    if (target.hp === 0)
      this.state.removeFromEntities(target);
  }



  areaAttack(attacker, center, radius){
    let area = this.getRectangleFromCenterAndRadiusSafeToArgs(center,radius);
    for (let target of this.state.entities.filter(e=>e instanceof Unit && e !== attacker)) {
      if (isRectangleContainsPosition(area, target.pos))
        this.attack(attacker, target);
    }
    return true;
  }

  tryMove(direction, entity){
    let newPos = {x: entity.pos.x, y: entity.pos.y};
    movePositionOnDirection(newPos,direction);
    if (this.isTileExistsAndAvailableToMove(newPos))
    {
      entity.pos.x = newPos.x;
      entity.pos.y = newPos.y;

      if (entity instanceof Player)//вообще тут должна быть функция проверки может ли ent поднять предмет
        this.applyEffectsOnTileAfterMove(entity);

      if (entity instanceof AiEnemyUnit){
        entity.lastMovedDirection = direction;
      }

      return true;
    }
    return false;
  }

  applyEffectsOnTileAfterMove(entity) {
    let effectEntities = this.state.entities.filter(e=>isPositionEquals(e.pos,entity.pos) && e instanceof PickupableItem);
    for (let eE of effectEntities) {
      if (eE.pickUpByUnit(entity))
        this.state.removeFromEntities(eE);
    }

  }

  isTileExistsAndAvailableToMove(pos){
    if (this.state.field.isFieldContainsPosition(pos))
      if (this.state.field.tiles[pos.y][pos.x].type === 0){
        if (this.state.entities.filter(e=>e instanceof Unit).filter(e=>isPositionEquals(e.pos,pos)).length===0){
          return true;
        }
      }
    return false;
  }
  //Todo similar funcs can out "exists" part
  isTileExistsAndAvailableToLook(pos){
    if (this.state.field.isFieldContainsPosition(pos))
      if (this.state.field.tiles[pos.y][pos.x].type === 0)
          return true;

    return false;
  }

  generateRandomStartEntities() {

    let emptyTiles = this.state.field.tiles.flat().filter(tile => tile.type === 0 && !this.state.isTileContainEntity(tile)).map(tile => tile.pos);

    console.log(emptyTiles.length);
    // одиночный спавн тоже вытащить можно было бы
    let randomNumberOfEmptyTile = getRandomInt(1, emptyTiles.length);
    let newRandomEmptyPos  =  emptyTiles[randomNumberOfEmptyTile-1];
    this.spawnPlayer(this.state.entities, newRandomEmptyPos , this.playerMaxHp, this.playerBaseDmg);
    emptyTiles.splice(randomNumberOfEmptyTile-1,1);

    this.spawnBaseManyOnEmptyTiles(this.state.entities,emptyTiles, this.countSwordsBuffMax, this.spawnSwordBuff,
      [getRandomInt(this.swordBuffMinDamageBuff, this.swordBuffMaxDamageBuff)]);
    this.spawnBaseManyOnEmptyTiles(this.state.entities,emptyTiles, this.countHealingPotionMax, this.spawnHealingPotion,
      [getRandomInt(this.potionMinHealingHpCount, this.potionMaxHealingHpCount)]);
    this.spawnBaseManyOnEmptyTiles(this.state.entities,emptyTiles, this.countEnemy1Max, this.spawnEnemy1,
      [this.enemyMaxHp, this.enemyBaseDmg]);
    console.log(emptyTiles.length);
  }

  spawnBaseManyOnEmptyTiles(eCollection, emptyTiles, spawnCount, spawnFunction, spawnFunctionArgsExcludingPosition){
    if (emptyTiles.length === 0)
      return;
    while (spawnCount>0){
      let randomNumberOfEmptyTile = getRandomInt(1, emptyTiles.length);
      let newRandomEmptyPosition =  emptyTiles[randomNumberOfEmptyTile-1] ;
      console.log(newRandomEmptyPosition);
      spawnFunction(eCollection, newRandomEmptyPosition, ...spawnFunctionArgsExcludingPosition);
      emptyTiles.splice(randomNumberOfEmptyTile-1,1);

      spawnCount--;
    }
  }


  spawnPlayer(eCollection,pos,hp,dmg){
    let p = new Player({x:pos.x,y:pos.y},hp,dmg);
    eCollection.push(p);
    this.player = p;
  }

  spawnEnemy1(eCollection,pos,hp,dmg){eCollection.push(new Enemy1({x:pos.x,y:pos.y},hp,dmg));}
  spawnHealingPotion(eCollection,pos,c){eCollection.push(new HealingPotion({x:pos.x,y:pos.y},c));}
  spawnSwordBuff(eCollection,pos,c){eCollection.push(new SwordBuff({x:pos.x,y:pos.y}, c));}

}

function test() {
}
class Entity{
  pos;
  constructor(pos){
    this.pos=pos;
  }
}

class PickupableItem extends Entity{
  constructor(pos){
    super(pos);
  }
  pickUpByUnit(unit){
    if (this instanceof Potion){
      return this.potionPickUpByUnit(unit);
    }
    else if (this instanceof SwordBuff){
      return this.swordBuffPickUpByUnit(unit);
    }
  }
}

class Potion extends PickupableItem{
  constructor(pos){
    super(pos);
  }
  potionPickUpByUnit(e){
    if (this instanceof HealingPotion){
      return this.healingPotionPickUpByUnit(e);
    }
  }

}
class HealingPotion extends Potion{
  healingHpCount;
  constructor(pos, healingHpCount) {
    super(pos);
    this.healingHpCount = healingHpCount;

  }
  healingPotionPickUpByUnit(e){
    e.hp+=this.healingHpCount;
    return true;
  }
}



class SwordBuff extends PickupableItem{
  damageBuff;
  constructor(pos, damageBuff){
    super(pos);
    this.damageBuff = damageBuff;

  }
  swordBuffPickUpByUnit(e){
    e.dmg+=this.damageBuff;
    return true;
  }
}



class Unit extends Entity{
  maxHp;
  #hp;
  set hp(value){
    this.#hp = setNumberToBorders(value, 0, this.maxHp);
  }
  get hp(){
    return this.#hp;
  }
  getDamage(hpLoss){
    this.hp = this.hp - hpLoss;
  }
  getHeal(hpAdd){
    this.hp = this.hp + hpAdd;
  }
  constructor(pos, maxHp) {
    super(pos);
    this.maxHp = maxHp;
    this.hp = maxHp;

  }
  getPercentOfHp(){
    return (this.hp/this.maxHp)*100;
  }
}

class CombatUnit extends Unit{
  dmg;
  constructor(pos, maxHp, dmg) {
    super(pos, maxHp);
    this.dmg = dmg;
  }
}
class Player extends CombatUnit{

  constructor(pos, maxHp, dmg) {
    super(pos, maxHp, dmg);

  }
}



class AiEnemyUnit extends CombatUnit{
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
    if (tryProckOfP(15))
      this.aiType = 'researcher';
    else
      this.aiType = 'hunter';
    this.aiStage = 1;


  }
  resetHaunt(){
    this.aiStage = 1;
    this.lastPlayerSeekedDirection = '';
  }

}
class Enemy1 extends AiEnemyUnit{

  constructor(pos, maxHp, dmg) {
    super(pos, maxHp, dmg);

  }
}

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
      if (this.entities.filter(e => e instanceof Enemy1).length === 0)
        alert(
          '   !!!___VICTORY!___!!!\n' +
          'Your stats:\n' +
          'HP: ' + game.player.hp + ' / ' + game.player.maxHp + '\n' +
          'DMG: ' + game.player.dmg + '\n' +
          '\n' +
          '   Thanks for playing!');
      if (e instanceof Player)
        alert(
          '   -GAME OVER-\n' +
          'Your stats:\n' +
          'HP: ' + game.player.hp + ' / ' + game.player.maxHp + '\n' +
          'DMG: ' + game.player.dmg + '\n' +
          '\n' +
          'You has been defeat, but dont despair! Just try again!');
    }
  }

  isTileContainEntity(tile) {
    for (let entity of this.entities) {
      if (isPositionEquals(tile.pos, entity.pos))
        return true;
    }
    return false;
  }

  initEntities() {
    this.entities = Array();
  }
}

var fieldSizeX = 40;
var fieldSizeY = 24;
class Field {
  tiles;
  //Warning when modifying: if you change the minimum number or size of the field, the results of generation may contain halls count less than the minimum.
  //And like that for tunnels. Tunnels will generate while unreachable halls exists at least
  xLength = fieldSizeX;
  yLength = fieldSizeY;
  minTunnelsCountOnDirection = 3;
  maxTunnelsCountOnDirection = 5;
  minHallsCount = 5;
  maxHallsCount = 10;
  minHallsXY = 3;
  maxHallsXY = 8;

  halls;
  tunnels;//{orient (h/v), cord}

  constructor() {
    this.generateNewRandomField();

     //console.log(this.tiles);
  }

  generateNewRandomField() {
    do {
       try {
        this.initTiles();
        this.initHalls();
        this.initTunnels();
        /** planned tiles objects:
         * {tileType t (1 - wall), boolean c (is here can start hall) } */
        let mass = Array(this.yLength)
          .fill().map((row) => row = Array(this.xLength)
            .fill().map((tile) => tile = {t: 1, c: true}));
        this.generateRandomHalls(mass);
        mass = mass.map(row => row.map(tile => tile.t));
        this.generateTunnels(mass);
        for (let i = 0; i < this.tiles.length; i++) {
          for (let j = 0; j < this.tiles[0].length; j++) {
            this.tiles[i][j] = new Tile(mass[i][j],{x:j,y:i});
          }
        }


        return;
       } catch (ex) {
         alert('mine failed :)');
       }
    } while (true);
  }

  generateTunnels(mass) {
    let balanceTunnelCountV = getRandomInt(this.minTunnelsCountOnDirection, this.maxTunnelsCountOnDirection);
    let balanceTunnelCountH = getRandomInt(this.minTunnelsCountOnDirection, this.maxTunnelsCountOnDirection);
    console.log('BALANCETUNNELS----------------------------------- V:' + balanceTunnelCountV + ' H:' + balanceTunnelCountH);
    let orient, cord;
    for (let hall of this.halls) {
      if (!hall.connectedWithTunnels) {
        orient = getRandomInt(1, 2) === 1
          ? 'v'
          : 'h';
        cord = orient === 'v'
          ?
          getRandomInt(hall.start.x, endOfRectangle(hall, false))
          :
          getRandomInt(hall.start.y, endOfRectangle(hall, true));
        console.log('TUNNEL RANDOMIED--------------------------------------------:');
        console.log('ORIENT: ' + orient + ' CORD: ' + cord);
        console.log('BALANCE: V:' + balanceTunnelCountV + ' H:' + balanceTunnelCountH);
        this.generateTunnel(mass, cord, orient);
        if (orient === 'v') {
          balanceTunnelCountV--;
        } else {
          balanceTunnelCountH--;
        }
      }
    }
    while (balanceTunnelCountV > 0 || balanceTunnelCountH > 0) {
      orient = balanceTunnelCountV > 0 && balanceTunnelCountH > 0
        ?
        (getRandomInt(1, 2) === 1
          ? 'v'
          : 'h')
        :
        (balanceTunnelCountV > 0
          ? 'v'
          : 'h');
      cord = orient === 'v'
        ?
        getRandomInt(0, mass[0].length - 1)
        :
        getRandomInt(0, mass.length - 1);

      this.generateTunnel(mass, cord, orient);
      if (orient === 'v') {
        balanceTunnelCountV--;
      } else {
        balanceTunnelCountH--;
      }
    }
    console.log(mass);
    console.log(this.halls);
  }

  generateTunnel(mass, cord, orient) {
    let newTunnel = {orient: orient, cord: cord};
    let mine = (rectangle, currentTileY, currentTileX) => {
      console.log(mass);
      rectangle[currentTileY][currentTileX] = 0;
    };
    let tunnelRectangle = this.getRectangleOfTunnel(mass, newTunnel);
    doWithSubRectanglePrimitive(mass, tunnelRectangle.start.x, tunnelRectangle.start.y, tunnelRectangle.size.x, tunnelRectangle.size.y, mine);

    this.tunnels.push(newTunnel);

    console.log('HALLS BEFORE ITERATION REFRESH STATUSES---------------');
    console.log(this.halls.map(x => x.connectedWithTunnels));
    this.refreshHallsStatusesOnTunnel(mass, newTunnel);
    console.log('HALLS AFTER ITERATION REFRESH STATUSES---------------');
    console.log(this.halls.map(x => x.connectedWithTunnels));
  }

  getRectangleOfTunnel(mass, tunnel) {
    if (tunnel.orient === 'v') {
      return {start: {x: tunnel.cord, y: 0}, size: {x: 1, y: mass.length}};
    }
    if (tunnel.orient === 'h') {
      return {start: {x: 0, y: tunnel.cord}, size: {x: mass[0].length, y: 1}};
    }
  }

  refreshHallsStatusesOnTunnel(mass, tunnel) {
    let wideTunnel;
    if (tunnel.orient === 'v') {
      wideTunnel = {startX: tunnel.cord - 1, startY: 0, sizeX: 3, sizeY: mass.length};
    }
    if (tunnel.orient === 'h') {
      wideTunnel = {startX: 0, startY: tunnel.cord - 1, sizeX: mass[0].length, sizeY: 3};
    }
    cutRectangleToTargetRectangle(wideTunnel, mass);

    console.log('WiDeTuNnEl');
    let asd = {...wideTunnel};
    console.log(asd);
    this.doWithSubRectanglePrimitive(
      mass, wideTunnel.startX, wideTunnel.startY, wideTunnel.sizeX, wideTunnel.sizeY, this.trySetChainConnectedWithTunnelsOnPosition, this);
  }

  isFieldContainsPosition(pos){
    return isRectangleContainsPosition({start:{x:0,y:0},size:{x:this.tiles[0].length,y:this.tiles.length}}, pos);
  }

  trySetChainConnectedWithTunnelsOnPosition(mass, y, x, calledByObject = this) {
    let halls = calledByObject.halls;
    let getHallsByPosition = (y, x) => {
      let result = Array(0);
      for (let hall of halls) {
        if (isRectangleContainsPosition(hall, {x: x, y: y})) {
          result.push(hall);
        }
      }
      return result;
    };
    for (let hall of getHallsByPosition(y, x)) {
      if (!hall.connectedWithTunnels) {
        hall.connectedWithTunnels = true;

        calledByObject.tryDoWithWallsPrimitive(mass, hall, calledByObject.trySetChainConnectedWithTunnelsOnPosition, calledByObject);
      }
    }
  }

  tryDoWithWallsPrimitive(mass, rect, doThat, calledByObject) {
    console.log('IS HALL UNREACHABLE');
    console.log(rect);
    let onBorderLeft = rect.start.x === 0;
    let onBorderTop = rect.start.y === 0;
    let onBorderRight = rect.start.x + rect.size.x === mass[0].length;
    let onBorderBot = rect.start.y + rect.size.y === mass.length;
    let endX = endOfRectangle(rect, false);
    if (!onBorderLeft) {
      calledByObject.doWithWallPrimitive(mass, rect.start.x - 1, rect.start.y, endOfRectangle(rect, true), true, doThat, calledByObject);
    }
    if (!onBorderRight) {
      calledByObject.doWithWallPrimitive(mass, rect.start.x + rect.size.x, rect.start.y, endOfRectangle(rect, true), true, doThat, calledByObject);
    }
    if (!onBorderTop) {
      calledByObject.doWithWallPrimitive(mass, rect.start.y - 1, rect.start.x, endOfRectangle(rect, false), false, doThat, calledByObject);
    }
    if (!onBorderBot) {
      calledByObject.doWithWallPrimitive(mass, rect.start.y + rect.size.y, rect.start.x, endOfRectangle(rect, false), false, doThat, calledByObject);
    }
  }

  doWithWallPrimitive(mass, wall, startD, endD, isY, doThat, calledByObject) {
    let currentX, currentY;
    for (let tileD = startD; tileD <= endD; tileD++) {
      if (isY) {
        currentY = tileD;
        currentX = wall;
      } else {
        currentY = wall;
        currentX = tileD;
      }
      doThat(mass, currentY, currentX, calledByObject);
    }
    return true;
  }

  doWithSubRectanglePrimitive(rectangle, startX, startY, sizeX, sizeY, doThat, calledByObject) {
    let currentTileY = startY;
    for (let row = 1; row <= sizeY; row++, currentTileY++) {
      let currentTileX = startX;
      for (let col = 1; col <= sizeX; col++, currentTileX++) {
        doThat(rectangle, currentTileY, currentTileX, calledByObject);
      }
    }
  }

  isTunnelsContainsPosition(pos) {
    for (let tun of this.tunnels) {
      if (isStraightContainPosition(tun, pos)) {
        return true;
      }
    }
    return false;
  }

  isPositionReachTunnels(pos) {
    if (this.isTunnelsContainsPosition(pos)) {
      return true;
    }
    for (let hall of this.halls) {
      if (hall.connectedWithTunnels === true) {
        if (isRectangleContainsPosition(hall, pos)) {
          return true;
        }
      }
    }
    return false;
  }

  generateRandomHalls(mass) {

    //init falses
    mass.map((row) => {
      row[row.length - 1].c = false;
      row[row.length - 2].c = false;
    });
    mass[mass.length - 1].map((tile) => tile.c = false);
    mass[mass.length - 2].map((tile) => tile.c = false);

    let balanceHallCount = getRandomInt(this.minHallsCount, this.maxHallsCount);
    do {
      console.log('HALL GENERATOR NEW HALL balance: ' + balanceHallCount);
      console.log(mass.map((row) => row.map((tile) => tile.t)));

      //random start tile
      let tileStartNumber = getRandomInt(1, mass.flat().filter((tile) => tile.c === true).length);

      let tileStartThisHall = (() => {
        for (let row = 0; row < mass.length; row++) {
          for (let col = 0; col < mass[row].length; col++) {
            if (mass[row][col].c === true) {
              if (--tileStartNumber === 0) {
                return {x: col, y: row};
              }
            }
          }
        }
      })();

      //compute max sizes and randomize sizes
      let getMaxSizeOnDim = (d1, d2, isY) => {
        let tileD = d1 + 1;
        for (let sizeD = 2; sizeD <= this.maxHallsXY; sizeD++, tileD++) {
          if (tileD < (isY
            ? this.yLength
            : this.xLength)) {
            if ((isY
              ? mass[tileD][d2]
              : mass[d2][tileD]).t === 1) {
              continue;
            }
          }
          return sizeD - 1;
        }
        return this.maxHallsXY;
      };
      console.log('tilestart');
      console.log(tileStartThisHall);
      //console.log('mass18(y=17)');
      //console.log(mass);
      let maxSizeX = getMaxSizeOnDim(tileStartThisHall.x, tileStartThisHall.y, false);
      let maxSizeY = getMaxSizeOnDim(tileStartThisHall.y, tileStartThisHall.x, true);
      console.log('maxsizes x, y');
      console.log(maxSizeX + ', ' + maxSizeY);
      let sizeThisHall = {
        x: getRandomInt(this.minHallsXY, maxSizeX),
        y: getRandomInt(this.minHallsXY, maxSizeY),
      };

      console.log('sizethishall');
      console.log(sizeThisHall);

      //apply new hall to mass
      console.log(123);

      console.log('data and view after dowithsub:');
      console.log(mass);
      console.log(mass.map((row) => row.map((tile) => (tile.t === 1
        ? 'W'
        : 'e') + (tile.c
        ? '+'
        : 'O'))));
      //console.log(tileStartThisHall);
      //console.log(sizeThisHall);
      doWithSubRectangle(mass,
        tileStartThisHall.x, tileStartThisHall.y,
        sizeThisHall.x, sizeThisHall.y,
        (x) => {x.t = 0;},
      );
      this.halls.push({
        start: tileStartThisHall,
        size: sizeThisHall,
        connectedWithTunnels: false,
      });
      ///Recalculate c
      forceDoWithSubRectangle(mass,
        tileStartThisHall.x - 2, tileStartThisHall.y - 2,
        sizeThisHall.x + 2, sizeThisHall.y + 2,
        (x) => {x.c = false;},
      );
      //console.log("after endhall raw data:");
      //console.log(mass);
      console.log('after endhall view, flatmaps includes true c: ' + mass.flat().map((tile) => tile.c).includes(true));
      console.log(mass.map((row) => row.map((tile) => (tile.t === 1
        ? 'W'
        : 'e') + (tile.c
        ? '+'
        : 'O'))));

    } while (--balanceHallCount > 0 && mass.flat().map((tile) => tile.c).includes(true));
  }

  initTunnels() {
    this.tunnels = Array();

  }
    initHalls() {
    this.halls = Array();
  }

  initTiles() {
    this.tiles = Array(this.yLength)
      .fill().map(x => x = Array(this.xLength)
        .fill(new Tile(1)));
  }

}

class Tile {
  /**0 - trail
   * 1 - wall*/
  type;
  pos;

  /** @param {any} tileType
   * number 0 or 1
   * or (respectively)
   * string trail or wall
   * @param {{x: number, y: number}} position
   */
  constructor(tileType, position= undefined) {
    if (typeof tileType == 'number') {
      if (tileType >= 0 && tileType <= 1) {
          this.type = tileType;
      } else {
          throw 'Unexpected number to tileType';
      }
    } else {
        this.type = {trail: 0, wall: 1}[tileType];
        if (typeof this.type == 'undefined') {
            throw 'Unexpected string to tileType';
        }
    }
      this.pos = position ;
  }
}

//#endregion

//#region unnamed

//#endregion

//#region unnamed

//#endregion

//#region unnamed

//#endregion

//#region unnamed

//#endregion

//#region unnamed

//#endregion

//#region unnamed

//#endregion

//#region RectFunctions

/**
 * @param {{startX, startY, sizeX, sizeY}} params
 * cut this
 * @param target
 * to borders
 * */
function cutRectangleToTargetRectangle(params, target) {
  let sizeOffsetX = 0, sizeOffsetY = 0, d;
  if (params.startX < 0) {
    params.sizeX += params.startX;
    params.startX = 0;
  }
  if (params.startY < 0) {
    params.sizeY += params.startY;
    params.startY = 0;
  }
  d = (target[0].length - 1) - (params.startX + (params.sizeX - 1));
  if (d < 0) {
    params.sizeX += d;//target[0].length - params.startX;
  }
  d = (target.length - 1) - (params.startY + (params.sizeY - 1));
  if (d < 0) {
    params.sizeY += d;//target[0].length - params.startX;
  }
  //if (params.startY + params.sizeY - 1 >= target.length)
  //  params.sizeY = target.length - params.startY;
}

/**
 * Cut subrectangle to borders of rectangle and do with elements of specified places on Rectangle
 * @param rectangle
 * Main rectangle array[][]
 * @param startX
 * of subrectangle
 * @param startY
 * of subrectangle
 * @param sizeX
 * of subrectangle
 * @param sizeY
 * of subrectangle
 * @param doThat
 * something to do
 */
function forceDoWithSubRectangle(rectangle, startX, startY, sizeX, sizeY, doThat) {
  let cutedParams = {startX: startX, startY: startY, sizeX: sizeX, sizeY: sizeY};
  cutRectangleToTargetRectangle(cutedParams, rectangle);

  doWithSubRectangle(rectangle, cutedParams.startX, cutedParams.startY, cutedParams.sizeX, cutedParams.sizeY, doThat);
}

/**
 * Do with elements of specified places on Rectangle
 * @param rectangle
 * Main rectangle array[][]
 * @param startX
 * of subrectangle
 * @param startY
 * of subrectangle
 * @param sizeX
 * of subrectangle
 * @param sizeY
 * of subrectangle
 * @param doThat
 * something to do
 */

function doWithSubRectanglePrimitive(rectangle, startX, startY, sizeX, sizeY, doThat) {
  let currentTileY = startY;
  for (let row = 1; row <= sizeY; row++, currentTileY++) {
    let currentTileX = startX;
    for (let col = 1; col <= sizeX; col++, currentTileX++) {
      doThat(rectangle, currentTileY, currentTileX);
    }
  }
}

function doWithSubRectangle(rectangle, startX, startY, sizeX, sizeY, doThat) {
  let currentTileY = startY;
  for (let row = 1; row <= sizeY; row++, currentTileY++) {
    let currentTileX = startX;
    for (let col = 1; col <= sizeX; col++, currentTileX++) {
      doThat(rectangle[currentTileY][currentTileX]);
    }
  }
}

function isStraightContainPosition(straight, pos) {
  if (straight.orient === 'h') {
    if (pos.y === straight.cord) {
      return true;
    }
  }
  if (straight.orient === 'v') {
    if (pos.x === straight.cord) {
      return true;
    }
  }
  return false;
}

/**
 *
 * @param {{start:{x,y},size:{x,y}}} rectangle
 * @param {{x,y}} pos
 * @returns {boolean}
 */
function isRectangleContainsPosition(rectangle, pos) {
  if (
    pos.x >= rectangle.start.x &&
    pos.x <= endOfRectangle(rectangle, false) &&
    pos.y >= rectangle.start.y &&
    pos.y <= endOfRectangle(rectangle, true)
  ) {
    return true;
  } else {
    return false;
  }
}

function endOfRectangle(rect, isY) {
  return ((isY
    ? rect.start.y + rect.size.y
    : rect.start.x + rect.size.x) - 1);
}

function movePositionOnDirection(pos, dir){
  if (dir === 'u')
    pos.y++;
  if (dir === 'd')
    pos.y--;
  if (dir === 'l')
    pos.x--;
  if (dir === 'r')
    pos.x++;
  return pos;
}

function getClonePosition(pos){
  return {x:pos.x,y:pos.y};
}

function isPositionEquals(pos1, pos2){
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 *
 * @param {any} min
 * Min int
 * @param {any} max
 * Max int
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function getTurnLeftDirection(dir){
  if(dir === 'r')
    return 'u';
  if(dir === 'u')
    return 'l';
  if(dir === 'd')
    return 'r';
  if(dir === 'l')
    return 'd';
}
function getInverseDirection(dir){
  if(dir === 'r')
    return 'l';
  if(dir === 'u')
    return 'd';
  if(dir === 'd')
    return 'u';
  if(dir === 'l')
    return 'r';
}
function getTurnRightDirection(dir){
  if(dir === 'r')
    return 'd';
  if(dir === 'u')
    return 'r';
  if(dir === 'd')
    return 'l';
  if(dir === 'l')
    return 'u';
}
function getAnotherRandomDirection(dirs){
  let tmp = ['u','d','l','r'].filter(d=>!dirs.map(x=>x===d).includes(true));
  let r = getRandomInt(0, tmp.length-1);
  return tmp[r];
}
function getRandomDirection(){
  let r = getRandomInt(0,3);
  //return ['u','d','l','r'][r];
  if(r === 0)
    return 'u';
  if(r === 1)
    return 'd';
  if(r === 2)
    return 'l';
  if(r === 3)
    return 'r';
}

/**
 * @param {number} percent
 * 1-100%
 */
function tryProckOfP(percent) {
  return getRandomInt(1, 100) <= percent;

}
//#endregion

//#region Tests

function testcutRectangleToTargetRectangle() {
  let i = 1;
  let cutedParams = {startX: -5, startY: -8, sizeX: 27, sizeY: 82};
  let mass = Array(10).fill().map(x => x = Array(20).fill().map(y => y = i++));
  console.log(cutedParams);
  cutRectangleToTargetRectangle(cutedParams, mass);
  console.log(cutedParams);
  console.log(mass);
}

function setNumberToBorders(number, min, max){
  if (number < min)
    return min;
  else if (number > max)
    return max;
  else
    return number;

}


//#endregion

/*
let checkWall = (mass, wall, startD, endD, isY)=>{
    let currentX, currentY;
    Field.qwer++;
    for (let tileD = startD; tileD <= endD; tileD++) {
        //console.log(mass);
        if (isY){
            currentY = tileD;
            currentX = wall;
        }
        else {
            currentY = wall;
            currentX = tileD;
        }

        if (mass[currentY][currentX] !== 1) {
            if (this.isPositionReachTunnels({x:currentX, y:currentY}))
                return false;
        }
        if (isY)
            mass[tileD][wall] =  Field.qwer;
        else
            mass[wall][tileD] =  Field.qwer;
    }
    return true;
}

    static qwer = 0;

isHallUnreachableFromTunnels(mass, hall){
        console.log('IS HALL UNREACHABLE');
        console.log(hall);
        let onBorderLeft = hall.start.x === 0;
        let onBorderTop = hall.start.y === 0;
        let onBorderRight = hall.start.x + hall.size.x === mass[0].length;
        let onBorderBot = hall.start.y + hall.size.y === mass.length;
        let endX = endOfRectangle(hall, false);
        if (!onBorderLeft){
            if (checkWall(mass,hall.start.x - 1, hall.start.y, endOfRectangle(hall, true),true) === false)
                return false;
        }
        if (!onBorderRight){
            if (checkWall(mass,hall.start.x + hall.size.x, hall.start.y, endOfRectangle(hall, true),true) === false)
                return false;
        }
        if (!onBorderTop){
            if (checkWall(mass,hall.start.y - 1, hall.start.x, endOfRectangle(hall, false),false) === false)
                return false;
        }
        if (!onBorderBot){
            if (checkWall(mass,hall.start.y + hall.size.y, hall.start.x, endOfRectangle(hall, false),false) === false)
                return false;
        }
    }
 */
