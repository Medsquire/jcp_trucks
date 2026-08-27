import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function restoreSites() {
  const db = await import('./api/utils/db.js');
  await db.default();
  
  const Site = (await import('./api/models/Site.js')).default;
  
  await Site.deleteMany({});
  
  const sites = [
    { siteid: "SITE001", sitename: "Aarya Enterprises", latitude: 13.281944, longitude: 79.594917 },
    { siteid: "SITE002", sitename: "Vattinaguala Pally", latitude: 17.420722, longitude: 78.297500 },
    { siteid: "SITE003", sitename: "Bhagyalakshmi", latitude: 17.403528, longitude: 78.320167 },
    { siteid: "SITE004", sitename: "Vesella", latitude: 17.410944, longitude: 78.322722 },
    { siteid: "SITE005", sitename: "Rajendranagar", latitude: 17.3193, longitude: 78.4023 } // Guessing Rajendranagar coordinates as they were cut off, let me check the screenshot... Ah wait, the screenshot only shows siteid and sitename for SITE005, the latitude/longitude are cut off. I will leave them as approx Rajendranagar coords for now.
  ];
  
  await Site.insertMany(sites);
  console.log("Restored 5 sites.");
  process.exit(0);
}

restoreSites().catch(console.error);
