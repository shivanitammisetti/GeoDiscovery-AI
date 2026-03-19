const express = require('express');
const router  = express.Router();

router.get('/', async (req, res) => {
  try {
    const BASE = process.env.NASA_EONET_URL || 'https://eonet.gsfc.nasa.gov/api/v3';
    
    const response = await fetch(`${BASE}/events?status=open&limit=50`);
    
    if (!response.ok) {
      throw new Error(`NASA API responded with ${response.status}`);
    }
    
    const data = await response.json();

    const events = data.events.map(event => ({
      id:          event.id,
      title:       event.title,
      category:    event.categories[0]?.title || 'Other',
      date:        event.geometry[0]?.date,
      coordinates: event.geometry[0]?.coordinates
    }));

    res.json({ success: true, count: events.length, events });

  } catch (error) {
    console.error('NASA EONET error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch NASA events', 
      detail: error.message 
    });
  }
});

module.exports = router;

// const express = require('express');
// const router  = express.Router();
// const fetch   = require('node-fetch');

// router.get('/', async (req, res) => {
//   try {
//     const BASE = process.env.NASA_EONET_URL || 'https://eonet.gsfc.nasa.gov/api/v3';
//     const response = await fetch(`${BASE}/events?status=open&limit=50`);
//     const data     = await response.json();

//     const events = data.events.map(event => ({
//       id:          event.id,
//       title:       event.title,
//       category:    event.categories[0]?.title || 'Other',
//       date:        event.geometry[0]?.date,
//       coordinates: event.geometry[0]?.coordinates
//     }));

//     res.json({ success: true, count: events.length, events });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch NASA events', detail: error.message });
//   }
// });

// module.exports = router;