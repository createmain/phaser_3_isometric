/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var SAT = require('sat');

var GetTilesWithin = require('./GetTilesWithin');
var WorldToTileX = require('./WorldToTileX');
var WorldToTileY = require('./WorldToTileY');
var GetFastValue = require('../../utils/object/GetFastValue');

/**
 * Gets the tiles in the given rectangular area (in world coordinates) of the layer.
 *
 * @function Phaser.Tilemaps.Components.GetTilesWithinWorldXY
 * @private
 * @since 3.0.0
 *
 * @param {number} worldX - The world x coordinate for the top-left of the area.
 * @param {number} worldY - The world y coordinate for the top-left of the area.
 * @param {number} width - The width of the area.
 * @param {number} height - The height of the area.
 * @param {object} [filteringOptions] - Optional filters to apply when getting the tiles.
 * @param {boolean} [filteringOptions.isNotEmpty=false] - If true, only return tiles that don't have -1 for an index.
 * @param {boolean} [filteringOptions.isColliding=false] - If true, only return tiles that collide on at least one side.
 * @param {boolean} [filteringOptions.hasInterestingFace=false] - If true, only return tiles that have at least one interesting face.
 * @param {Phaser.Cameras.Scene2D.Camera} [camera=main camera] - The Camera to use when factoring in which tiles to return.
 * @param {Phaser.Tilemaps.LayerData} layer - The Tilemap Layer to act upon.
 * 
 * @return {Phaser.Tilemaps.Tile[]} Array of Tile objects.
 */
function getCandidates(layer, tileX, tileY) {

    var scope = 3;
    var candidates = [];
    for(var x = -scope; x <= scope ; x++) {
        for(var y = -scope; y <= scope ; y ++) {
            if(tileX + x > -1 && tileX + x < layer.width) { //In world
                if (tileY + y > -1 && tileY + y < layer.height) { // In world
                    var tile = layer.data[tileY + y][tileX + x];
                    if(tile !== null) {
                        if(tile.index > -1) {
                            candidates.push(tile);
                        }
                    }
                }
            }
        }
    }
    return candidates;
}
var GetTilesWithinWorldXY = function (worldX, worldY, width, height, filteringOptions, camera, layer)
{
    if (layer.tilemapLayer.tilemap.orientation === "isometric") {
        //TODO: Camera 적용 필요
        //좌표계 수정 필요
        //지도의 X를 기준으로 y값이 0일때 X와 Y 값을 구하여 넓이로 나누어 tile의 X와 Y위치 값을 구함
        var centeredX = worldX + width / 2;
        var centeredY = worldY + height / 2;
        //var centeredY = worldY + height - layer.tileHeight / 2; //<--Unit의 크기 바닥으로 collision 처리하려면, 조정 필요
        var ratio = layer.tileWidth / layer.tileHeight;
        var centerX = layer.tileWidth / 2 * layer.height;
        var zeroYforY = centeredX - centeredY * ratio - centerX;
        var zeroYforX = centeredX + centeredY * ratio - centerX;

        //console.log(zeroYforX + " / " + zeroYforY);

        var tileX = Math.floor(zeroYforX / layer.tileWidth);
        var tileY = - Math.floor(zeroYforY / layer.tileWidth);

        //console.log(tileX + " / " + tileY);
        
        var isNotEmpty = GetFastValue(filteringOptions, 'isNotEmpty', false);
        var isColliding = GetFastValue(filteringOptions, 'isColliding', false);
        var hasInterestingFace = GetFastValue(filteringOptions, 'hasInterestingFace', false);

        var candidates = getCandidates(layer, tileX, tileY);
        
        var results = [];
        for (var i = 0; i < candidates.length ; i++) {

            var tile = candidates[i];
            
            if (tile !== null)
            {
                
                if(tile.index > 0) {
                    if (isNotEmpty && tile.index === -1) { continue; }
                    if (isColliding && !tile.collides) { continue; }
                    if (hasInterestingFace && !tile.hasInterestingFace) { continue; }

                   results.push(tile);
                }
            }
        }
        return results;
    } else {
        // Top left corner of the rect, rounded down to include partial tiles
        var xStart = WorldToTileX(worldX, true, camera, layer);
        var yStart = WorldToTileY(worldY, true, camera, layer);
    
        // Bottom right corner of the rect, rounded up to include partial tiles
        var xEnd = Math.ceil(WorldToTileX(worldX + width, false, camera, layer));
        var yEnd = Math.ceil(WorldToTileY(worldY + height, false, camera, layer));
    
        return GetTilesWithin(xStart, yStart, xEnd - xStart, yEnd - yStart, filteringOptions, layer);
    }
};

module.exports = GetTilesWithinWorldXY;
