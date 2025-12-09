/**
 * Complete end-to-end test of quiz submission flow
 * Tests: Frontend -> Next.js API -> API Gateway -> DynamoDB
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const NEXT_API_URL = process.env.NEXT_API_URL || 'http://localhost:3000';

// Test user ID (replace with actual user ID from your system)
const TEST_USER_ID = process.argv[2] || 'b1ebc5b0-d021-70a0-1153-306c2a931635';

console.log('🧪 Testing Complete Quiz Submission Flow\n');
console.log(`API Gateway: ${API_URL}`);
console.log(`Next.js API: ${NEXT_API_URL}`);
console.log(`Test User ID: ${TEST_USER_ID}\n`);

// Sample quiz answers (10-15 answers required)
const sampleAnswers = [
  { questionId: 'q1', value: 4 },
  { questionId: 'q2', value: 5 },
  { questionId: 'q3', value: 3 },
  { questionId: 'q4', value: 4 },
  { questionId: 'q5', value: 5 },
  { questionId: 'q6', value: 3 },
  { questionId: 'q7', value: 4 },
  { questionId: 'q8', value: 5 },
  { questionId: 'q9', value: 3 },
  { questionId: 'q10', value: 4 },
  { questionId: 'q11', value: 5 },
  { questionId: 'q12', value: 3 },
];

const submissionData = {
  userId: TEST_USER_ID,
  answers: sampleAnswers,
};

async function testDirectAPI() {
  console.log('📡 Test 1: Direct API Gateway call\n');
  try {
    const response = await fetch(`${API_URL}/motivation/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData),
    });

    const text = await response.text();
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response:\n${text}\n`);

    if (response.ok) {
      const data = JSON.parse(text);
      if (data.success) {
        console.log('✅ Direct API call succeeded!');
        console.log(`Profile: ${data.data.profile.primaryMotivator}`);
        console.log(`Persona: ${data.data.persona.name}\n`);
        return true;
      } else {
        console.log('❌ Direct API call returned error');
        return false;
      }
    } else {
      console.log('❌ Direct API call failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Direct API call error:', error.message);
    return false;
  }
}

async function testNextJSAPI() {
  console.log('📡 Test 2: Next.js API route call\n');
  try {
    const response = await fetch(`${NEXT_API_URL}/api/motivation/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData),
    });

    const text = await response.text();
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response:\n${text}\n`);

    if (response.ok) {
      const data = JSON.parse(text);
      if (data.success) {
        console.log('✅ Next.js API call succeeded!');
        console.log(`Profile: ${data.data.profile.primaryMotivator}`);
        console.log(`Persona: ${data.data.persona.name}\n`);
        return true;
      } else {
        console.log('❌ Next.js API call returned error');
        return false;
      }
    } else {
      console.log('❌ Next.js API call failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Next.js API call error:', error.message);
    console.log('\n💡 Make sure Next.js dev server is running on port 3000\n');
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  const directResult = await testDirectAPI();
  console.log('='.repeat(60));
  const nextResult = await testNextJSAPI();
  console.log('='.repeat(60));

  console.log('\n📊 Test Summary:');
  console.log(`  Direct API Gateway: ${directResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Next.js API Route: ${nextResult ? '✅ PASS' : '❌ FAIL'}`);

  if (!directResult) {
    console.log('\n⚠️  Direct API Gateway test failed. Check:');
    console.log('  1. API server is running (pnpm --filter api-gateway dev)');
    console.log('  2. Environment variables are set (.env file)');
    console.log('  3. DynamoDB table exists and is accessible');
    console.log('  4. User exists in database');
  }

  if (!nextResult && directResult) {
    console.log('\n⚠️  Next.js API test failed but direct API works. Check:');
    console.log('  1. Next.js dev server is running (pnpm --filter web dev)');
    console.log('  2. NEXT_PUBLIC_API_URL is set correctly');
  }
}

runTests().catch(console.error);

