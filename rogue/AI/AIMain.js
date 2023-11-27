//Todo fix ai may stay if face to face
//Todo upd researchers aistages for explicit loop in tunnels with closed ends
//TODO сделать AI рандом того левши они или правши, для инверсии базовых поворотов
//Спешу, поэтому пока что ai просто действуют через эту функцию
function aiTurn(calledByObject)
{
  let calledByGame = calledByObject;

  let aiEnemies = calledByGame.state.entities.filter(e => e instanceof AiEnemyUnit);
  for (let aE of aiEnemies) {
    aiEnemyTurn(aE);
  }

  function aiEnemyTurn(aE)
  {
    //vision
    let newDir = aiTrySeekPlayer(aE);
    aE.lastPlayerSeekedDirection = newDir ?? aE.lastPlayerSeekedDirection;
    //try attack
    if (!aiTryFindAndAttackNearbyPlayer(aE, 1)) {
      //move
      if (aE.aiType === 'hunter') {// если это охотник, т.е. пытающийся найти игрока ии
        /**флаг окончания фазы движения, после неё не имеет силы
         */
        let successMoved;
        do {// если игрок был увиден где-то ранее, идти в ту сторону
          if (aE.lastPlayerSeekedDirection !== '') {
            if (!calledByGame.tryMove(aE.lastPlayerSeekedDirection, aE)) {
              if (!isAiEnemyOnPosition(movePositionOnDirection(getClonePosition(aE.pos), aE.lastPlayerSeekedDirection))) {//Todo AI Стоят если их несколько подряд и первому некуда свернуть
                aE.resetHaunt();//если упёрся, сбрасывает пар-ры и ищет заново
              } else {
                break;//если упёрся в себеподобного, окончание фазы движения без шага (ждёт)
                // todo пойти туда после себепод. на этом же ходу (увидеть в кого упёрся, дать ему функц. движения и т.д.)
              }
            } else {
              break;//выход из цикла (конец фазы движения) если шагнул
            }
          } else {//если не видел игрока
            switch (aE.aiStage) {
              case 1:
              case 2:
              case 3://несколько поворотов
                successMoved = calledByGame.tryMove(aE.wantMoveDirection, aE);
                if (!successMoved) {
                  aE.aiStage++;
                  if (aiTurnToDirectAndCheckAiEnemyOnNextTile(aE, 'left',)) {
                    successMoved = true;
                  }
                }
                break;
              case 4:
                do {//попытки пойти в другую рандомную сторону
                  let dimsFilter = [aE.lastMovedDirection];//неудачные направления попыток идти
                  aE.wantMoveDirection = getAnotherRandomDirection(dimsFilter);//случайная смена напр
                  successMoved = calledByGame.tryMove(aE.wantMoveDirection, aE);// попытка идти
                  if (!successMoved) {
                    dimsFilter.push(aE.wantMoveDirection);
                    if (isAiEnemyOnPosition(movePositionOnDirection(getClonePosition(aE.pos), aE.wantMoveDirection))) {
                      successMoved = true;//пропуск если из-за кореша
                    }
                  }
                } while (successMoved);
                aE.aiStage = tryProckOfP(60)//шанс в 60% перейти на 5, или падает на 1-2 стадии
                  ? 5
                  : getRandomInt(1, 2);
                break;
              case 5:
              case 6:
              case 7:
                successMoved = calledByGame.tryMove(aE.wantMoveDirection, aE);
                if (!successMoved) {
                  aE.aiStage++;
                  if (aiTurnToDirectAndCheckAiEnemyOnNextTile(aE, 'right',)) {//поворот
                    successMoved = true;
                  }
                }
                break;
              case 8://ходит ищет способом похожим на правило лабиринта
                //но при некоторых обстоятельствах могу какое-то время курить бамбук в 2на2 квадрате
                let onTurnLeftPos = {x: aE.pos.x, y: aE.pos.y};
                movePositionOnDirection(onTurnLeftPos, getTurnedDirection(aE.wantMoveDirection, 'left'));
                if (calledByGame.isTileExistsAndAvailableToMove(onTurnLeftPos)) {
                  aE.wantMoveDirection = getTurnedDirection(aE.wantMoveDirection, 'left');
                }
                successMoved = calledByGame.tryMove(aE.wantMoveDirection, aE);
                if (!successMoved) {
                  if (aiTurnToDirectAndCheckAiEnemyOnNextTile(aE, 'right',)) {
                    successMoved = true;
                  }
                }
                if (successMoved) {
                  if (tryProckOfP(2)) {
                    aE.aiStage = getRandomInt(1, 4);
                  }
                }
                break;
              default:
                break;
            }
          }
        } while (!successMoved);
      } else if (aE.aiType === 'researcher') {//если побоку на игрока ходит в рандомных напр.
        let dimsFilter = [aE.lastMovedDirection];
        while (!calledByGame.tryMove(aE.wantMoveDirection, aE)) {
          dimsFilter.push(aE.wantMoveDirection);
          aE.wantMoveDirection = getAnotherRandomDirection(dimsFilter);
          if (dimsFilter.length > 3) {
            break;
          }
        }
      } else {
        return;
      }
      //vision from new position
      let newDir = aiTrySeekPlayer(aE);
      aE.lastPlayerSeekedDirection = newDir ?? aE.lastPlayerSeekedDirection;
    }
    //return;
  }

  function isAiEnemyOnPosition(pos)
  {
    for (let e of calledByGame.state.entities.filter(e => e instanceof AiEnemyUnit)) {
      if (isPositionEquals(pos, e.pos)) {
        return true;
      }
    }
  }

  function aiTryFindAndAttackNearbyPlayer(ai, attackRange)
  {
    let area = getRectangleFromCenterAndRadiusSafeToArgs(ai.pos, attackRange);
    if (isRectangleContainsPosition(area, calledByGame.state.player.pos)) {
      calledByGame.attack(ai, calledByGame.state.player);
      return true;
    }
    return false;
  }

  function aiTrySeekPlayer(ai)
  {
    for (let dir of ['u', 'd', 'l', 'r']) {
      if (aiTrySeekPlayerOnDirection(ai, dir)) {
        return dir;
      }
    }
    return undefined;
  }

  function aiTrySeekPlayerOnDirection(ai, dir)
  {
    let pointToSeek = getClonePosition(ai.pos);
    do {
      movePositionOnDirection(pointToSeek, dir);
      if (calledByGame.isTileExistsAndAvailableToLook(pointToSeek)) {
        if (isPositionEquals(pointToSeek, calledByGame.state.player.pos)) {
          return true;
        }
      } else {
        return false;
      }
    } while (true);
  }

  function aiTurnToDirectAndCheckAiEnemyOnNextTile(aE, side)
  {
    aE.wantMoveDirection = getTurnedDirection(aE.wantMoveDirection, side);
    return isAiEnemyOnPosition(movePositionOnDirection(getClonePosition(aE.pos), aE.wantMoveDirection));

  }
}
