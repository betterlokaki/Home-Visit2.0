const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MOCKS_DIR = path.join(__dirname, 'mocks');

// Configuration keys (matching config.json)
const CONFIG = {
  service1: {
    geometryOuterKey: 'geometries',
    geometryInnerKey: 'wkt',
    siteNameKey: 'siteNames',
    timeRangeOuterKey: 'timeRange',
    timeRangeInnerKey: 'dates',
    responseKey: 'sites'
  },
  service2: {
    geometryOuterKey: 'geometry',
    geometryInnerKey: 'wkt',
    secondsOuterKey: 'timeframes',
    secondsInnerKey: 'refreshSeconds',
    responseKey: 'history'
  }
};

// Cover status options
const COVER_STATUSES = ['Full', 'Partial', 'Empty'];

// Always return data for all sites (100% availability)
const DATA_AVAILABILITY_PROBABILITY = 1.0;

/**
 * Simple hash function to deterministically convert a string to a number
 * @param {string} str - String to hash
 * @returns {number} - Hash value between 0 and 100
 */
function hashToPercent(str) {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  // Convert first 8 hex characters to integer, then mod 100
  const num = parseInt(hash.substring(0, 8), 16);
  return num % 100;
}

/**
 * Deterministically determines if data should be available for a site
 * @param {string} siteName - Site name
 * @returns {boolean} - True if data should be available (consistent for same site)
 */
function shouldReturnData(siteName) {
  // Always return true - all sites should have data
  return true;
}

/**
 * Deterministically gets cover status for a site
 * @param {string} siteName - Site name
 * @returns {string} - Cover status ('Full', 'Partial', or 'Empty')
 */
function getCoverStatus(siteName) {
  const hash = hashToPercent(siteName + '_status');
  const index = hash % COVER_STATUSES.length;
  return COVER_STATUSES[index];
}

/**
 * Deterministically gets cover status for a time window
 * @param {string} windowKey - Unique key for the time window (e.g., siteName + windowStart)
 * @returns {string} - Cover status ('Full', 'Partial', or 'Empty')
 */
function getCoverStatusForWindow(windowKey) {
  const hash = hashToPercent(windowKey + '_status');
  const index = hash % COVER_STATUSES.length;
  return COVER_STATUSES[index];
}

/**
 * Deterministically determines if data should be available for a time window
 * @param {string} windowKey - Unique key for the time window (e.g., siteName + windowStart)
 * @returns {boolean} - True if data should be available (consistent for same window)
 */
function shouldReturnDataForWindow(windowKey) {
  // Always return true - all time windows should have data
  return true;
}

function generateProjectLink(siteName) {
  return `https://project-link.example.com/${siteName}`;
}

function calculateAnchorDate(timestamp) {
  const anchor = new Date(timestamp);
  anchor.setHours(0, 0, 0, 0);
  return anchor;
}

function calculateTimeWindows(refreshSeconds, days = 7) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  
  // Calculate anchor (midnight of the day containing startDate)
  const anchor = calculateAnchorDate(startDate);
  
  // Calculate window start for startDate
  const secondsSinceAnchor = Math.floor((startDate.getTime() - anchor.getTime()) / 1000);
  const windowNumber = Math.floor(secondsSinceAnchor / refreshSeconds);
  const windowStartSeconds = windowNumber * refreshSeconds;
  let currentWindow = new Date(anchor.getTime() + windowStartSeconds * 1000);
  
  // If currentWindow is before startDate, move to next window
  if (currentWindow < startDate) {
    currentWindow = new Date(currentWindow.getTime() + refreshSeconds * 1000);
  }
  
  const windows = [];
  
  // Generate windows from startDate to now
  while (currentWindow <= now) {
    windows.push(new Date(currentWindow));
    currentWindow = new Date(currentWindow.getTime() + refreshSeconds * 1000);
  }
  
  return windows;
}

app.post('/service1/current-status', (req, res) => {
  try {
    const { geometries, timeRange } = req.body;
    
    if (!geometries || !geometries.siteNames || !Array.isArray(geometries.siteNames)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    const siteNames = geometries.siteNames;
    const sites = [];

    for (const siteName of siteNames) {
      // Deterministically check if this site should have data
      // Same site will always have the same data availability
      if (shouldReturnData(siteName)) {
        sites.push({
          siteName: siteName,
          status: getCoverStatus(siteName), // Deterministic cover status
          projectLink: generateProjectLink(siteName)
        });
      }
      // If shouldReturnData() is false, we don't include this site in the response
      // This simulates "no data available" scenario
    }

    const response = {
      [CONFIG.service1.responseKey]: sites
    };

    res.json(response);
  } catch (error) {
    console.error('Error processing service1 request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/service2/historical-status', (req, res) => {
  try {
    const { geometry, timeframes } = req.body;
    
    if (!geometry || !geometry.wkt || !timeframes || !timeframes.refreshSeconds || !Array.isArray(timeframes.refreshSeconds)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    // Use the first refresh seconds value (assuming single site request)
    const refreshSeconds = timeframes.refreshSeconds[0] || 300;
    const timeWindows = calculateTimeWindows(refreshSeconds);
    
    // Create a unique key for this site using a hash of the geometry WKT
    // In a real scenario, we'd have site name, but for service2 we only have geometry
    // Using hash ensures consistency for the same geometry
    const siteKey = crypto.createHash('md5').update(geometry.wkt).digest('hex').substring(0, 16);
    
    const history = [];

    for (const windowStart of timeWindows) {
      // Create a unique key for this time window
      const windowKey = `${siteKey}_${windowStart.toISOString()}`;
      
      // Deterministically check if this window should have data
      // Same window will always have the same data availability
      if (shouldReturnDataForWindow(windowKey)) {
        history.push({
          date: windowStart.toISOString(),
          status: getCoverStatusForWindow(windowKey) // Deterministic cover status
        });
      }
      // If shouldReturnDataForWindow() is false, we don't include this window
      // This simulates missing data for that time window
    }

    const response = {
      [CONFIG.service2.responseKey]: history
    };

    res.json(response);
  } catch (error) {
    console.error('Error processing service2 request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Mock services running on port ${PORT}`);
  console.log(`Service1: http://localhost:${PORT}/service1/current-status`);
  console.log(`Service2: http://localhost:${PORT}/service2/historical-status`);
  console.log(`Data availability: ${DATA_AVAILABILITY_PROBABILITY * 100}% (all sites will have data)`);
});

