
const NAPKIN_API_URL = 'https://api.napkin.ai/api';
const TOKEN = 'sk-96055da43bee71077403dda23a9ebb4443ef51e849d631995b2f18ccce1ec804';

async function testAuth(token, msg) {
  console.log(`\n--- Testing: ${msg} ---`);
  try {
    const res = await fetch(`${NAPKIN_API_URL}/create-visual-request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Test neurodiversity concept',
        language: 'en',
      })
    });
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text.substring(0, 200)}`);
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

async function run() {
  await testAuth(TOKEN, 'Full token with sk-');
  await testAuth(TOKEN.replace('sk-', ''), 'Token WITHOUT sk-');
  await testAuth(TOKEN, 'Trying X-API-Key'); // Manual edit in headers below if needed
}

run();
