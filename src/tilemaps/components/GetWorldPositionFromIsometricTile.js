/**
 * @author       JooHyun Kim <createmain@gmail.com>
 * @copyright    2020 Createmain Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

/**
 * Gets World Position from IsometricTile.
 *
 * @function Phaser.Tilemaps.Components.GetTilesWithin
 * @private
 * @since 3.0.0
 *
 * @param {Phaser.Tilemaps.Tile} tile - tile.
 * @param {Phaser.Tilemaps.LayerData} layer - The Tilemap Layer to act upon.
 * 
 * @return {integer[]} Array of Tile objects.
 */
var GetWorldPositionFromIsometricTile = function (tile, layer)
{
    var bigAxis = layer.width >= layer.height ? layer.width : layer.height;
    var paddingX = bigAxis * layer.tileWidth * 0.5;
    var hw = layer.tileWidth * 0.5; //half width
    var hh = layer.tileHeight * 0.5; //half height

    var tx = paddingX + tile.x * hw - tile.y * hw;
    var ty = tile.y * hh + tile.x * hh;

    var list = [tx, ty,
        tx + hw, ty + hh,
        tx, ty + layer.tileHeight,
        tx - hw, ty + hh];

    return list;
};

module.exports = GetWorldPositionFromIsometricTile;
