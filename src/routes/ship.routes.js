const express = require('express');
const router = express.Router();

const ShipController = require('../controllers/ship.controller');
const { validateShip, validateShipIdParam } = require('../middlewares/validation');

router.post('/ships/update', validateShip, ShipController.update);
router.get('/ships', ShipController.getAll);
router.get('/ships/:id', validateShipIdParam, ShipController.getOne);
router.get('/ships/:id/history', validateShipIdParam, ShipController.history);

module.exports = router;