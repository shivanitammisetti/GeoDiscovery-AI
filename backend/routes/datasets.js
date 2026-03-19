const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('./users');

const datasets = [
  {
    id: 1, name: 'MODIS Thermal Anomalies',
    satellite: 'Terra / Aqua', resolution: '1 km',
    event: 'wildfire', level: 'beginner',
    description: 'Detects active fires and thermal anomalies globally using mid-infrared bands.',
    useCases: ['Wildfire mapping', 'Post-fire damage assessment', 'Burn scar analysis'],
    url: 'https://modis.gsfc.nasa.gov/data/dataprod/mod14.php',
    tags: ['thermal', 'fire', 'infrared']
  },
  {
    id: 2, name: 'ASTER Surface Temperature',
    satellite: 'Terra', resolution: '90 m',
    event: 'volcano', level: 'intermediate',
    description: 'High-resolution thermal infrared data for volcanic activity and lava flow monitoring.',
    useCases: ['Volcano monitoring', 'Lava flow tracking', 'Geothermal mapping'],
    url: 'https://asterweb.jpl.nasa.gov/',
    tags: ['thermal', 'volcano', 'temperature']
  },
  {
    id: 3, name: 'MISR Aerosol Optical Depth',
    satellite: 'Terra', resolution: '275 m',
    event: 'volcano', level: 'advanced',
    description: 'Multi-angle imaging captures aerosol and ash plume dispersal from volcanic eruptions.',
    useCases: ['Ash plume tracking', 'Air quality monitoring', 'Climate impact assessment'],
    url: 'https://misr.jpl.nasa.gov/',
    tags: ['aerosol', 'volcano', 'atmosphere']
  },
  {
    id: 4, name: 'TRMM Precipitation',
    satellite: 'TRMM', resolution: '0.25°',
    event: 'flood', level: 'beginner',
    description: 'Tropical rainfall measurements used to monitor and predict flood-causing precipitation events.',
    useCases: ['Flood prediction', 'Rainfall mapping', 'Hydrology research'],
    url: 'https://trmm.gsfc.nasa.gov/',
    tags: ['precipitation', 'flood', 'rainfall']
  },
  {
    id: 5, name: 'SRTM Digital Elevation Model',
    satellite: 'Space Shuttle', resolution: '30 m',
    event: 'flood', level: 'intermediate',
    description: 'High-resolution elevation data essential for flood inundation modelling.',
    useCases: ['Flood inundation modelling', 'Drainage basin delineation', 'Terrain analysis'],
    url: 'https://www2.jpl.nasa.gov/srtm/',
    tags: ['elevation', 'flood', 'terrain']
  },
  {
    id: 6, name: 'Sentinel-1 SAR',
    satellite: 'Sentinel-1 A/B', resolution: '10 m',
    event: 'flood', level: 'advanced',
    description: 'Synthetic aperture radar can penetrate clouds to map flood extents in near real-time.',
    useCases: ['Flood extent mapping', 'Displacement detection', 'Infrastructure damage'],
    url: 'https://sentinel.esa.int/web/sentinel/missions/sentinel-1',
    tags: ['SAR', 'flood', 'radar']
  },
  {
    id: 7, name: 'GOES-16 Rapid Scan',
    satellite: 'GOES-16', resolution: '500 m',
    event: 'cyclone', level: 'beginner',
    description: 'Geostationary rapid-scan imagery for cyclone track and intensity monitoring.',
    useCases: ['Storm tracking', 'Intensity estimation', 'Landfall prediction'],
    url: 'https://www.goes-r.gov/',
    tags: ['geostationary', 'cyclone', 'weather']
  },
  {
    id: 8, name: 'CYGNSS Wind Speed',
    satellite: 'CYGNSS Constellation', resolution: '25 km',
    event: 'cyclone', level: 'advanced',
    description: 'GPS reflectometry provides ocean wind speeds inside and near tropical cyclones.',
    useCases: ['Wind speed retrieval', 'Cyclone inner-core analysis', 'Storm surge prediction'],
    url: 'https://cygnss.engin.umich.edu/',
    tags: ['wind', 'cyclone', 'ocean']
  },
  {
    id: 9, name: 'MODIS Snow Cover',
    satellite: 'Terra / Aqua', resolution: '500 m',
    event: 'avalanche', level: 'beginner',
    description: 'Daily snow cover and albedo maps used to assess avalanche risk terrain.',
    useCases: ['Avalanche hazard mapping', 'Snowpack monitoring', 'Water resource assessment'],
    url: 'https://modis.gsfc.nasa.gov/data/dataprod/mod10.php',
    tags: ['snow', 'avalanche', 'cryosphere']
  },
  {
    id: 10, name: 'SRTM Slope Analysis',
    satellite: 'Space Shuttle', resolution: '30 m',
    event: 'avalanche', level: 'intermediate',
    description: 'Derived slope maps from DEM data identify terrain prone to snow avalanches.',
    useCases: ['Avalanche path delineation', 'Hazard zone mapping', 'Mountain terrain analysis'],
    url: 'https://www2.jpl.nasa.gov/srtm/',
    tags: ['slope', 'avalanche', 'terrain']
  },
  {
    id: 11, name: 'USGS ShakeMap',
    satellite: 'Ground Network', resolution: 'Variable',
    event: 'earthquake', level: 'beginner',
    description: 'Near real-time maps of ground shaking intensity following earthquakes.',
    useCases: ['Emergency response', 'Structural damage assessment', 'Loss estimation'],
    url: 'https://earthquake.usgs.gov/data/shakemap/',
    tags: ['seismic', 'earthquake', 'shaking']
  },
  {
    id: 12, name: 'Sentinel-2 Multispectral',
    satellite: 'Sentinel-2 A/B', resolution: '10 m',
    event: 'earthquake', level: 'advanced',
    description: 'High-resolution optical imagery for post-earthquake damage and landslide mapping.',
    useCases: ['Damage assessment', 'Landslide mapping', 'Infrastructure analysis'],
    url: 'https://sentinel.esa.int/web/sentinel/missions/sentinel-2',
    tags: ['optical', 'earthquake', 'multispectral']
  }
];

// Role → allowed levels
const roleLevels = {
  Student:   ['beginner', 'intermediate'],
  Scientist: ['beginner', 'intermediate', 'advanced']
};

function filterByRole(data, role) {
  const allowed = roleLevels[role] || roleLevels['Student'];
  return data.filter(d => allowed.includes(d.level));
}

function recommend(event, excludeId = null, role = 'Student') {
  const source     = datasets.find(d => d.id === excludeId);
  const sourceTags = source ? source.tags : [];

  return datasets
    .filter(d => d.id !== excludeId)
    .map(d => {
      let score = 0;
      if (d.event === event) score += 10;
      score += d.tags.filter(t => sourceTags.includes(t)).length * 3;
      return { ...d, score };
    })
    .filter(d => (roleLevels[role] || roleLevels['Student']).includes(d.level))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// GET /api/datasets
router.get('/', (req, res) => {
  const { event, search, sort } = req.query;

  // Get role from JWT if present (optional auth)
  let role = 'Student';
  const header = req.headers.authorization;
  if (header) {
    try {
      const jwt  = require('jsonwebtoken');
      const user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'geodiscovery_secret');
      role = user.role;
    } catch {}
  }

  let result = filterByRole(datasets, role);

  if (event)  result = result.filter(d => d.event === event.toLowerCase());
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.tags.some(t => t.includes(q))
    );
  }

  // Sort: new-to-old / old-to-new / easy-to-hard / hard-to-easy
  const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };
  if (sort === 'easy-first')  result.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
  if (sort === 'hard-first')  result.sort((a, b) => levelOrder[b.level] - levelOrder[a.level]);

  res.json({ count: result.length, role, datasets: result });
});

// GET /api/datasets/:id
router.get('/:id', (req, res) => {
  const dataset = datasets.find(d => d.id === parseInt(req.params.id));
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
  res.json(dataset);
});

// GET /api/datasets/event/:event
router.get('/event/:event', (req, res) => {
  const result = datasets.filter(d => d.event === req.params.event.toLowerCase());
  res.json({ count: result.length, datasets: result });
});

// GET /api/datasets/recommend/:event
router.get('/recommend/:event', (req, res) => {
  const { excludeId } = req.query;
  let role = 'Student';
  const header = req.headers.authorization;
  if (header) {
    try {
      const jwt  = require('jsonwebtoken');
      const user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'geodiscovery_secret');
      role = user.role;
    } catch {}
  }
  const recs = recommend(req.params.event, excludeId ? parseInt(excludeId) : null, role);
  res.json({ event: req.params.event, role, recommendations: recs });
});

module.exports = router;