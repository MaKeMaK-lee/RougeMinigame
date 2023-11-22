
//возможно лучше хранить координаты клеток и не пересчитывать их каждый раз
/**
 * @param {GameState} gameState
 */
function render(gameState) {
  $('#field').html('');
  renderField(gameState.field);
  renderEntities(gameState.entities);

  function renderEntity(e) {
    let x = e.pos.x * 32;
    let y = (fieldSizeY - (e.pos.y + 1)) * 32;

    let tileClass;
    switch (e.constructor.name) {
      case ('HealingPotion'):
        tileClass = 'tileHP';
        break;
      case ('Enemy1'):
        tileClass = 'tileE';
        break;
      case ('SwordBuff'):
        tileClass = 'tileSW';
        break;
      case ('Player'):
        tileClass = 'tileP';
        break;
    }

    let element = jQuery('<div/>', {
      class: 'tile' + ' ' + tileClass,
      style: 'left: ' + x + 'px; top:' + y + 'px;',
    });

    if (e instanceof Unit) {
      let hpBar = jQuery('<div/>', {
        class: 'health',
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
   * @param {Field} field
   */
  function renderField(field) {
    let tiles = field.tiles;
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
