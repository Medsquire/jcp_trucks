import mongoose from 'mongoose';

import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:3001/api';

async function testSiteRadius() {
  const db = await import('./api/utils/db.js');
  await db.default();
  
  const Site = (await import('./api/models/Site.js')).default;
  
  // Create a dummy site
  await Site.deleteMany({});
  await Site.create({
    siteid: "SITE001",
    sitename: "Aarya Enterprises",
    latitude: 13.281944,
    longitude: 79.594917
  });
  console.log('Dummy site created in DB.');

  // Check in at the exact location
  console.log('Sending Attendance Check-in...');
  const attPost = await fetch(`${BASE_URL}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '7777777777',
      checkInTime: new Date().toISOString(),
      checkInImages: { dash: 'dash.jpg', person: 'person.jpg' },
      checkInLocation: { lat: 13.281944, lng: 79.594917 },
      status: 'checked-in'
    })
  });
  
  const data = await attPost.json();
  console.log('Attendance Result Sitename:', data.sitename);
  
  process.exit(0);
}

testSiteRadius().catch(console.error);
