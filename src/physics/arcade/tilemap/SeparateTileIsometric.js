/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var SAT = require('sat'); //isometric collision check
var GetWorldPositionFromIsometricTile = require('../components/GetWorldPositionFromIsometricTile');

/**
 * The core separation function to separate a physics body and a tile.
 *
 * @function Phaser.Physics.Arcade.Tilemap.SeparateTile
 * @since 3.0.0
 *
 * @param {number} i - The index of the tile within the map data.
 * @param {Phaser.Physics.Arcade.Body} body - The Body object to separate.
 * @param {Phaser.Tilemaps.Tile} tile - The tile to collide against.
 * @param {Phaser.Geom.Rectangle} tileWorldRect - A rectangle-like object defining the dimensions of the tile.
 * @param {(Phaser.Tilemaps.DynamicTilemapLayer|Phaser.Tilemaps.StaticTilemapLayer)} tilemapLayer - The tilemapLayer to collide against.
 * @param {number} tileBias - The tile bias value. Populated by the `World.TILE_BIAS` constant.
 * @param {boolean} isLayer - Is this check coming from a TilemapLayer or an array of tiles?
 *
 * @return {boolean} `true` if the body was separated, otherwise `false`.
 */
var SeparateTileIsometric = function (i, body, tile, tileWorldRect, tilemapLayer, tileBias, isLayer)
{
    var collision = false;
   
    var area = GetWorldPositionFromIsometricTile(tile);
                
    var V = SAT.Vector;
    var P = SAT.Polygon;
    
    // A square
    var tileArea = new P(new V(0,0), [
        new V(area[0],area[1]), new V(area[2],area[3]), new V(area[4],area[5]), new V(area[6],area[7])
    ]);

    var response = new SAT.Response();

    var left = new P(new V(0,0), [
        new V(body.x, body.y),
        new V(body.x, body.y + body.height)
    ]);
    var right = new P(new V(0,0), [
        new V(body.x + body.width, body.y),
        new V(body.x + body.width, body.y + body.height)
    ]);
    var north = new P(new V(0,0), [
        new V(body.x, body.y),
        new V(body.x + body.width, body.y)
    ]);
    var south = new P(new V(0,0), [
        new V(body.x, body.y + body.height),
        new V(body.x + body.width, body.y + body.height)
    ]);


    //Points Check
    if (SAT.pointInPolygon(new V(body.x, body.y + body.height), tileArea)) { //왼쪽 아래
        //기울기
        var degreeY =  (area[3] - area[1]) / (area[2] - area[0]);
        var degreeX =  (area[2] - area[0]) / (area[3] - area[1]);
        //body.y와 body.height를 더한 것은 왼쪽 아래 점의 위치 이기 때문이다.
        var diffX = body.x - area[0] - degreeX * (body.y + body.height - area[1]);
        //body.x만 가지고 계산한것은 왼쪽 위나 아래의 x위치는 같기 때문이다.
        var diffY = body.y + body.height - area[1] - degreeY * (body.x - area[0]);

        body.position.x -= diffX; //위치 보정
        body.position.y -= diffY; //위치 보정
        collision = true;
    } else if (SAT.pointInPolygon(new V(body.x, body.y), tileArea)) { //왼쪽 위에
        //기울기
        var degreeY =  (area[3] - area[5]) / (area[2] - area[4]);
        var degreeX =  (area[2] - area[4]) / (area[5] - area[3]);
        var diffX = body.x - area[4];
        diffX -= degreeX * (area[5] - body.y);
        var diffY = area[5] - body.y;
        diffY += degreeY * (body.x - area[4]);

        body.position.x -= diffX;
        body.position.y += diffY;
        collision = true;
    } else if (SAT.pointInPolygon(new V(body.x + body.width, body.y + body.height), tileArea)) { //오른쪽 아래
        //기울기
        var degreeY =  (area[1] - area[7]) / (area[0] - area[6]);
        var degreeX =  (area[0] - area[6]) / (area[7] - area[1]);
        var diffX = body.x + body.width - area[6];
        diffX -= degreeX * (area[7] - body.y - body.height);
        var diffY = area[7] - body.y - body.height;
        diffY += degreeY * (body.x + body.width - area[6]);

        body.position.x -= diffX;
        body.position.y += diffY;
        collision = true;
    } else if (SAT.pointInPolygon(new V(body.x + body.width, body.y), tileArea)) { //오른쪽 위에
        var degreeY =  (area[5] - area[7]) / (area[4] - area[6]);
        var degreeX =  (area[4] - area[6]) / (area[5] - area[7]);
        var diffX = body.x + body.width - area[6] - degreeX * (body.y - area[7]);
        var diffY = body.y - area[7] - degreeY * (body.x + body.width - area[6]);

        body.position.x -= diffX;
        body.position.y -= diffY;
        collision = true;
    } else {
        //LineCheck
        if (SAT.testPolygonPolygon(tileArea, left, response)) {
            body.position.x += (area[2] - body.x);
            collision = true;
        }
        if (SAT.testPolygonPolygon(tileArea, right, response)) {
            body.position.x -= (body.x + body.width - area[6]);
            collision = true;
        }
        if (SAT.testPolygonPolygon(tileArea, north, response)) {
            body.position.y += (area[5] - body.y);
            collision = true;
        }
        if (SAT.testPolygonPolygon(tileArea, south, response)) {
            body.position.y -= (body.y + body.height - area[1]);
            collision = true;
        }
    }
    //console.log(collision);
    return collision;
};

module.exports = SeparateTileIsometric;
