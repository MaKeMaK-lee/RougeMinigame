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
            this.tiles[i][j] = new Tile(mass[i][j], {x: j, y: i});
          }
        }
        return;
      } catch (ex) {

      }
    } while (true);
  }

  generateTunnels(mass) {
    let balanceTunnelCountV = getRandomInt(this.minTunnelsCountOnDirection, this.maxTunnelsCountOnDirection);
    let balanceTunnelCountH = getRandomInt(this.minTunnelsCountOnDirection, this.maxTunnelsCountOnDirection);
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
  }

  generateTunnel(mass, cord, orient) {
    let newTunnel = {orient: orient, cord: cord};
    let mine = (rectangle, currentTileY, currentTileX) => {
      rectangle[currentTileY][currentTileX] = 0;
    };
    let tunnelRectangle = this.getRectangleOfTunnel(mass, newTunnel);
    doWithSubRectangle(mass, tunnelRectangle.start.x, tunnelRectangle.start.y, tunnelRectangle.size.x, tunnelRectangle.size.y, mine);

    this.tunnels.push(newTunnel);
    this.refreshHallsStatusesOnTunnel(mass, newTunnel);
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

    doWithSubRectangle(
      mass, wideTunnel.startX, wideTunnel.startY, wideTunnel.sizeX, wideTunnel.sizeY,
      this.trySetChainConnectedWithTunnelsOnPosition, this
    );
  }

  isFieldContainsPosition(pos) {
    return isRectangleContainsPosition({start: {x: 0, y: 0}, size: {x: this.tiles[0].length, y: this.tiles.length}}, pos);
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
      let maxSizeX = getMaxSizeOnDim(tileStartThisHall.x, tileStartThisHall.y, false);
      let maxSizeY = getMaxSizeOnDim(tileStartThisHall.y, tileStartThisHall.x, true);
      let sizeThisHall = {
        x: getRandomInt(this.minHallsXY, maxSizeX),
        y: getRandomInt(this.minHallsXY, maxSizeY),
      };
      //apply new hall to mass
      doWithSubRectangle(mass,
        tileStartThisHall.x, tileStartThisHall.y,
        sizeThisHall.x, sizeThisHall.y,
        (x) => {x.t = 0;},
        undefined,
        true
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
        true
      );
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
