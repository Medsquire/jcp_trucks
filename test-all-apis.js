

const BASE_URL = 'http://localhost:3001/api';

async function testAll() {
  console.log('--- STARTING E2E API TEST ---');

  // 1. LOGIN
  console.log('\\n1. Testing Login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9999999999', password: '1234567' })
  });
  const adminUser = await loginRes.json();
  console.log('Login Result:', adminUser.phone ? 'SUCCESS' : 'FAILED', adminUser.phone);

  const driverLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '7777777777', password: '1234567' })
  });
  const driverUser = await driverLoginRes.json();
  console.log('Driver Login Result:', driverUser.phone ? 'SUCCESS' : 'FAILED');

  // 2. ATTENDANCE POST
  console.log('\\n2. Testing Attendance POST...');
  const attPost = await fetch(`${BASE_URL}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: driverUser.phone,
      checkInTime: new Date().toISOString(),
      checkInImages: { dash: 'dash.jpg', person: 'person.jpg' },
      checkInLocation: { lat: 12.3456, lng: 78.9012 },
      status: 'checked-in'
    })
  });
  const attData = await attPost.json();
  console.log('Attendance Created:', attData._id ? 'SUCCESS' : 'FAILED');

  // 3. FUEL POST
  console.log('\\n3. Testing Fuel POST...');
  const fuelPost = await fetch(`${BASE_URL}/fuel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: driverUser.phone,
      initialPhoto: 'initial.jpg',
      finalPhoto: 'final.jpg'
    })
  });
  const fuelData = await fuelPost.json();
  console.log('Fuel Created:', fuelData._id ? 'SUCCESS' : 'FAILED');

  // 4. MAINTENANCE POST
  console.log('\\n4. Testing Maintenance POST...');
  const maintPost = await fetch(`${BASE_URL}/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: driverUser.phone,
      details: 'Flat tire',
      photos: ['tire.jpg']
    })
  });
  const maintData = await maintPost.json();
  console.log('Maintenance Created:', maintData._id ? 'SUCCESS' : 'FAILED');

  // 5. GET AS ADMIN
  console.log('\\n5. Testing GET routes as Admin...');
  const getAtt = await fetch(`${BASE_URL}/attendance`).then(r => r.json());
  console.log('Attendance Records Count:', getAtt.length);

  const getFuel = await fetch(`${BASE_URL}/fuel`).then(r => r.json());
  console.log('Fuel Records Count:', getFuel.length);

  const getMaint = await fetch(`${BASE_URL}/maintenance`).then(r => r.json());
  console.log('Maintenance Records Count:', getMaint.length);

  const getUsers = await fetch(`${BASE_URL}/users`).then(r => r.json());
  console.log('Users Count:', getUsers.length);

  // 6. POST NEW USER
  console.log('\\n6. Testing Create New User POST...');
  const newUserPost = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Driver 3',
      phone: '3333333333',
      password: 'testpassword',
      roleId: 3,
      supervisorPhone: '8888888888'
    })
  });
  const newUserData = await newUserPost.json();
  console.log('New User Created:', newUserData.phone ? 'SUCCESS' : 'FAILED', newUserData.message || '');

  console.log('\\n--- END OF TESTS ---');
}

testAll().catch(console.error);
