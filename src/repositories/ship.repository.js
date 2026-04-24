const Ship = require('../models/ship.model');

class ShipRepository {

  static findByShipId(shipId) {
    return Ship.findOne({ shipId });
  }

  static create(data) {
    return Ship.create(data);
  }

  static save(ship) {
    return ship.save();
  }

  static findAll() {
    return Ship.find();
  }

  static findById(shipId) {
    return Ship.findOne({ shipId });
  }
}

module.exports = ShipRepository;