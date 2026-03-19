const express = require('express');
const router  = express.Router();

const blogs = [
  {
    id: 1,
    title: 'Understanding Volcano Monitoring with Satellites',
    author: 'Dr. Sarah Chen',
    date: '2024-12-10',
    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600',
    preview: 'Learn how ASTER and MODIS thermal sensors detect volcanic activity days before eruptions.',
    content: `Volcanoes are among Earth's most powerful natural forces. Satellite remote sensing has revolutionised how we monitor volcanic activity — detecting thermal anomalies, tracking gas emissions, and measuring ground deformation before an eruption occurs.

**ASTER (Advanced Spaceborne Thermal Emission and Reflection Radiometer)** aboard NASA's Terra satellite provides 90-metre resolution thermal infrared imagery. Volcanologists use ASTER to map lava lake temperatures, identify new fumarole fields, and track cooling lava flows.

**MODIS Thermal Anomaly** products flag pixels with anomalously high temperatures compared to background values. Its twice-daily coverage means alerts can be issued within hours of a new thermal event.

**Ground deformation via InSAR** (Interferometric SAR using Sentinel-1) reveals magma movement beneath the surface — inflation and deflation cycles that precede eruptive activity.

Together, these datasets give scientists a 24/7 eyes-on-the-volcano capability that was impossible just 30 years ago.`,
    relatedDatasets: [2, 3],
    tags: ['volcano', 'thermal', 'ASTER', 'MODIS']
  },
  {
    id: 2,
    title: 'Satellite Data for Flood Prediction',
    author: 'Prof. James Okafor',
    date: '2024-11-22',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae4?w=600',
    preview: 'How TRMM rainfall data and DEM models combine to forecast flood inundation zones.',
    content: `Floods are the most damaging natural disaster globally. Combining satellite precipitation data with terrain models allows forecasters to predict where and when flooding will occur.

**TRMM (Tropical Rainfall Measuring Mission)** provided 17 years of tropical and subtropical precipitation data. Its successor, **GPM (Global Precipitation Measurement)**, continues this record with improved coverage to 65°N/S.

**DEM (Digital Elevation Model)** data from SRTM forms the backbone of hydrological models. Flow-direction grids derived from SRTM reveal drainage basins, river networks, and low-lying areas prone to inundation.

**Sentinel-1 SAR** is particularly powerful for flood monitoring — its C-band radar penetrates cloud cover and rain to map flood extents in near real-time. Open water appears dark in SAR imagery, making flooded areas easy to detect.

Operational flood forecasting systems like GLOFAS now combine all these data streams with hydrological models to issue multi-day flood alerts.`,
    relatedDatasets: [4, 5, 6],
    tags: ['flood', 'TRMM', 'SAR', 'DEM']
  },
  {
    id: 3,
    title: 'Tracking Wildfires Using NASA Satellites',
    author: 'Dr. Amara Diallo',
    date: '2024-10-30',
    image: 'https://images.unsplash.com/photo-1602584380321-2d959da17d40?w=600',
    preview: 'MODIS active fire products and VIIRS 375m data provide near real-time wildfire mapping.',
    content: `Wildfires are increasing in frequency and severity globally. NASA's Earth observation fleet provides near real-time data on active fires, smoke plumes, and burned area.

**MODIS Fire and Thermal Anomaly products** (MOD14/MYD14) have been operational since 2000, providing a consistent 20+ year record of global fire activity. The 1-km resolution algorithm identifies sub-pixel fire using the 4-μm and 11-μm thermal bands.

**VIIRS I-band at 375 m** improves on MODIS with higher spatial resolution, allowing detection of smaller fires and providing more precise fire perimeter mapping.

**Burned Area products** from MODIS (MCD64) map the spatial extent and approximate date of burning, essential for carbon accounting and ecosystem recovery studies.

Real-time fire alerts from NASA FIRMS (Fire Information for Resource Management System) deliver MODIS and VIIRS fire locations within 3 hours of satellite overpass.`,
    relatedDatasets: [1],
    tags: ['wildfire', 'MODIS', 'VIIRS', 'fire']
  },
  {
    id: 4,
    title: 'Earthquake Damage Assessment from Space',
    author: 'Dr. Li Wei',
    date: '2024-09-15',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600',
    preview: 'How SAR coherence change and optical imagery help emergency responders after major earthquakes.',
    content: `In the hours after a major earthquake, satellite imagery becomes a critical tool for emergency responders trying to understand the scale of damage.

**SAR Coherence Change Detection** using Sentinel-1 identifies areas where the ground surface has changed between two acquisitions. High coherence loss indicates building collapse, landslides, or significant ground displacement.

**Optical damage proxies** using Sentinel-2 or Planet imagery allow analysts to visually inspect urban areas for collapsed structures, fires, or surface ruptures.

**USGS ShakeMap** provides near real-time peak ground motion values interpolated from seismic station recordings. Combined with building inventory data, ShakeMap drives loss estimation models used by emergency management agencies worldwide.

The Copernicus Emergency Management Service (CEMS) activates rapid mapping for major disasters, producing damage assessment maps within 12-24 hours.`,
    relatedDatasets: [11, 12],
    tags: ['earthquake', 'SAR', 'damage', 'Sentinel']
  },
  {
    id: 5,
    title: 'Cyclone Intensity Monitoring from Orbit',
    author: 'Dr. Priya Nair',
    date: '2024-08-18',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600',
    preview: 'Geostationary and polar-orbiting satellites combine to track tropical cyclone intensity.',
    content: `Tropical cyclones are monitored continuously from space using a combination of geostationary and polar-orbiting satellites.

**GOES-16 and GOES-18** provide 1-minute cadence imagery of the Western Hemisphere. The Advanced Baseline Imager's 16 spectral bands allow detailed cloud-top temperature analysis, which correlates with storm intensity.

**Microwave sounders** on polar orbiters (such as AMSU-A on NOAA satellites) can penetrate clouds to observe the warm core of a tropical cyclone — the definitive sign of a well-organised storm.

**CYGNSS (Cyclone Global Navigation Satellite System)** uses reflected GPS signals from the ocean surface to retrieve wind speeds inside tropical cyclones, a capability previously limited to risky aircraft reconnaissance.

**SMAP (Soil Moisture Active Passive)** measures ocean salinity and sea surface conditions that influence cyclone intensification, helping forecasters predict rapid intensification events.`,
    relatedDatasets: [7, 8],
    tags: ['cyclone', 'GOES', 'CYGNSS', 'microwave']
  }
];

// GET /api/blogs
router.get('/', (req, res) => {
  const summary = blogs.map(({ id, title, author, date, image, preview, tags }) =>
    ({ id, title, author, date, image, preview, tags })
  );
  res.json({ count: summary.length, blogs: summary });
});

// GET /api/blogs/:id
router.get('/:id', (req, res) => {
  const blog = blogs.find(b => b.id === parseInt(req.params.id));
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.json(blog);
});

module.exports = router;