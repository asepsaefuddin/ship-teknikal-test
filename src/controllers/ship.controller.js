const ShipService = require('../services/ship.service');

class ShipController {
  static handleError(res, err) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }

  static async update(req, res) {
    try {
      const result = await ShipService.updateShip(req.body);
      res.json(result);
    } catch (err) {
      return ShipController.handleError(res, err);
    }
  }

  static async getAll(req, res) {
    try {
      const ships = await ShipService.getShips();
      return res.json(ships);
    } catch (err) {
      return ShipController.handleError(res, err);
    }
  }

  static async getOne(req, res) {
    try {
      const ship = await ShipService.getShipById(req.params.id);
      if (!ship) {
        return res.status(404).json({
          success: false,
          message: 'Ship not found'
        });
      }
      return res.json(ship);
    } catch (err) {
      return ShipController.handleError(res, err);
    }
  }

  static async history(req, res) {
    try {
      const ship = await ShipService.getShipById(req.params.id);
      if (!ship) {
        return res.status(404).json({
          success: false,
          message: 'Ship not found'
        });
      }

      const history = await ShipService.getHistory(req.params.id);
      return res.json(history);
    } catch (err) {
      return ShipController.handleError(res, err);
    }
  }
}

module.exports = ShipController;