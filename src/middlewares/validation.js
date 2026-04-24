function badRequest(res, message) {
  return res.status(400).json({
    success: false,
    message
  });
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateShip(req, res, next) {
  const { id, name, lat, lng, heading, speed, timestamp } = req.body;

  if (typeof id !== 'string' || id.trim().length === 0) {
    return badRequest(res, 'id is required and must be a non-empty string');
  }

  if (!isFiniteNumber(lat) || !isFiniteNumber(lng)) {
    return badRequest(res, 'lat and lng must be finite numbers');
  }

  if (!isFiniteNumber(heading)) {
    return badRequest(res, 'heading must be a finite number');
  }

  if (!isFiniteNumber(speed)) {
    return badRequest(res, 'speed must be a finite number');
  }

  if (speed < 0) {
    return badRequest(res, 'speed cannot be negative');
  }

  if (!isFiniteNumber(timestamp)) {
    return badRequest(res, 'timestamp must be a finite number');
  }

  req.body.id = id.trim();
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return badRequest(res, 'name must be a non-empty string when provided');
    }
    req.body.name = name.trim();
  }
  req.body.heading = ((heading % 360) + 360) % 360;

  next();
}

function validateShipIdParam(req, res, next) {
  const { id } = req.params;

  if (typeof id !== 'string' || id.trim().length === 0) {
    return badRequest(res, 'id parameter is required');
  }

  req.params.id = id.trim();
  next();
}

module.exports = { validateShip, validateShipIdParam };