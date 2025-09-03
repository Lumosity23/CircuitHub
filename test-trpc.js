async function testTRPC() {
  try {
    console.log('Testing tRPC signup...');
    
    const response = await fetch('http://localhost:3000/api/trpc/auth.signUp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        json: {
          email: 'test@example.com',
          password: 'testpassword123',
          name: 'Test User'
        }
      }])
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testTRPC();