const ShipRepository = require('../repositories/ship.repository');
const { calculateDistance } = require('../utils/distance');
const { log, error } = require('../utils/logger');

class ShipService {
  static buildOrderedHistory(ship, incomingPoint) {
    const points = [
      ...(ship.history || []),
      incomingPoint
    ];

    return points
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-500);
  }

  static calculateTotalDistance(points) {
    if (points.length < 2) {
      return 0;
    }

    let total = 0;
    for (let i = 1; i < points.length; i += 1) {
      total += calculateDistance(
        points[i - 1].lat,
        points[i - 1].lng,
        points[i].lat,
        points[i].lng
      );
    }
    return total;
  }

  static async updateShip(data) {
    try {
      const { id, name, lat, lng, heading, speed, timestamp } = data;
      const incomingPoint = { lat, lng, heading, speed, timestamp };

      let ship = await ShipRepository.findByShipId(id);

      if (!ship) {
        log(`CREATE ship ${id}`);

        const newShip = await ShipRepository.create({
          shipId: id,
          name,
          lat,
          lng,
          heading,
          speed,
          timestamp,
          history: [incomingPoint]
        });

        this.sendToClients(newShip);

        return newShip;
      }

      const orderedHistory = this.buildOrderedHistory(ship, incomingPoint);
      const latestPoint = orderedHistory[orderedHistory.length - 1];

      if (timestamp < ship.timestamp) {
        log(`OUT-OF-ORDER data for ${id}`);
      }

      ship.history = orderedHistory;
      ship.distanceTraveled = this.calculateTotalDistance(orderedHistory);

      ship.lat = latestPoint.lat;
      ship.lng = latestPoint.lng;
      ship.heading = latestPoint.heading;
      ship.speed = latestPoint.speed;
      ship.timestamp = latestPoint.timestamp;
      if (typeof name === 'string' && name.trim().length > 0) {
        ship.name = name.trim();
      }

      const updated = await ShipRepository.save(ship);

      log(`UPDATE ship ${id}`);

      this.sendToClients(updated);

      return updated;

    } catch (err) {
      error(err.message);
      throw err;
    }
  }

  static sendToClients(data) {
    // Resolve app exports at call-time to avoid circular-import undefined during bootstrap.
    const { clients = [] } = require('../app');
    clients.forEach(client => {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }

  static getShips() {
    return ShipRepository.findAll();
  }

  static getShipById(id) {
    return ShipRepository.findById(id);
  }

  static async getHistory(id) {
    const ship = await ShipRepository.findById(id);
    return ship ? ship.history : [];
  }
}

module.exports = ShipService;