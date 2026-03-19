const express = require('express');
const router  = express.Router();

const terms = [
  'flood', 'volcano', 'wildfire', 'cyclone', 'avalanche', 'earthquake',
  'MODIS', 'ASTER', 'TRMM', 'SAR', 'Sentinel-1', 'Sentinel-2',
  'SRTM', 'GOES-16', 'CYGNSS', 'ShakeMap', 'VIIRS', 'thermal',
  'precipitation', 'elevation', 'aerosol', 'snow cover', 'wind speed'
];

// GET /api/suggestions?q=vol
router.get('/', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q || q.length < 2) return res.json({ suggestions: [] });

  const matches = terms
    .filter(t => t.toLowerCase().startsWith(q))
    .slice(0, 6);

  res.json({ suggestions: matches });
});

module.exports = router;