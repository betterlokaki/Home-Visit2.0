const http = require('http');

const MOCK_SERVICE_URL = 'http://localhost:3001';
const CONFIG = {
  service1: {
    geometryOuterKey: 'geometries',
    geometryInnerKey: 'wkt',
    siteNameKey: 'siteNames',
    timeRangeOuterKey: 'timeRange',
    timeRangeInnerKey: 'dates',
  },
  service2: {
    geometryOuterKey: 'geometry',
    geometryInnerKey: 'wkt',
    secondsOuterKey: 'timeframes',
    secondsInnerKey: 'refreshSeconds',
  },
};

// Site data from init.sql
const SITES = [
  {
    siteName: 'site_001',
    geometry: 'POLYGON((-74.0060 40.7128, -74.0050 40.7128, -74.0050 40.7138, -74.0060 40.7138, -74.0060 40.7128))',
    refreshSeconds: 300,
  },
  {
    siteName: 'site_002',
    geometry: 'POLYGON((-73.9650 40.7829, -73.9550 40.7829, -73.9550 40.7929, -73.9650 40.7929, -73.9650 40.7829))',
    refreshSeconds: 300,
  },
  {
    siteName: 'site_003',
    geometry: 'POLYGON((-73.9850 40.6782, -73.9750 40.6782, -73.9750 40.6882, -73.9850 40.6882, -73.9850 40.6782))',
    refreshSeconds: 600,
  },
];

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const url = new URL(path, MOCK_SERVICE_URL);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function testService1() {
  console.log('\n=== Testing Service1: Current Status and Links ===\n');

  const now = new Date();
  const fromTime = new Date(now.getTime() - 300 * 1000);

  const request = {
    [CONFIG.service1.geometryOuterKey]: {
      [CONFIG.service1.geometryInnerKey]: SITES.map((s) => s.geometry),
      [CONFIG.service1.siteNameKey]: SITES.map((s) => s.siteName),
    },
    [CONFIG.service1.timeRangeOuterKey]: {
      [CONFIG.service1.timeRangeInnerKey]: {
        From: fromTime.toISOString(),
        To: now.toISOString(),
      },
    },
  };

  console.log('Request:', JSON.stringify(request, null, 2));
  console.log('\nSending request...\n');

  try {
    const response = await makeRequest('/service1/current-status', request);
    console.log('Status Code:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.sites) {
      console.log('\n✅ Service1 test PASSED');
      console.log(`   Received ${response.data.sites.length} site(s)`);
      response.data.sites.forEach((site) => {
        console.log(`   - ${site.siteName}: ${site.status} (${site.projectLink})`);
      });
      return true;
    } else {
      console.log('\n❌ Service1 test FAILED');
      return false;
    }
  } catch (error) {
    console.log('\n❌ Service1 test FAILED with error:', error.message);
    return false;
  }
}

async function testService2() {
  console.log('\n=== Testing Service2: Historical Cover Status ===\n');

  const site = SITES[0];
  const weekInSeconds = 7 * 24 * 60 * 60;
  const refreshSeconds = site.refreshSeconds;
  const timeframes = [];
  for (let i = 0; i < weekInSeconds; i += refreshSeconds) {
    timeframes.push(refreshSeconds);
  }

  const request = {
    [CONFIG.service2.geometryOuterKey]: {
      [CONFIG.service2.geometryInnerKey]: site.geometry,
    },
    [CONFIG.service2.secondsOuterKey]: {
      [CONFIG.service2.secondsInnerKey]: timeframes,
    },
  };

  console.log('Request:', JSON.stringify(request, null, 2));
  console.log('\nSending request...\n');

  try {
    const response = await makeRequest('/service2/historical-status', request);
    console.log('Status Code:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.history) {
      console.log('\n✅ Service2 test PASSED');
      console.log(`   Received ${response.data.history.length} historical record(s)`);
      response.data.history.slice(0, 5).forEach((record) => {
        console.log(`   - ${record.date}: ${record.status}`);
      });
      if (response.data.history.length > 5) {
        console.log(`   ... and ${response.data.history.length - 5} more`);
      }
      return true;
    } else {
      console.log('\n❌ Service2 test FAILED');
      return false;
    }
  } catch (error) {
    console.log('\n❌ Service2 test FAILED with error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Mock Services Tests\n');
  console.log('='.repeat(50));

  const service1Result = await testService1();
  const service2Result = await testService2();

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:');
  console.log(`   Service1: ${service1Result ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Service2: ${service2Result ? '✅ PASSED' : '❌ FAILED'}`);

  if (service1Result && service2Result) {
    console.log('\n🎉 All tests PASSED!');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests FAILED!');
    process.exit(1);
  }
}

runTests();

