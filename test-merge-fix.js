// TEST SCRIPT - Verify v1.2.1 Fix
// Chạy script này trong Browser Console (F12) để test

console.log('🧪 Starting v1.2.1 Fix Test...\n');

// Giả sử có account ID (thay bằng ID thực tế)
const TEST_ACCOUNT_ID = '6745a123b456c789d012e345'; // ⚠️ THAY BẰNG ID THẬT

async function testMergeCustomFields() {
  console.log('Test 1: Merge customFields\n');
  
  // Step 1: Tạo account với 3 fields
  console.log('Step 1: Creating account with 3 fields...');
  const createResponse = await fetch('http://localhost:5000/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customFields: {
        field1: 'value1',
        field2: 'value2',
        field3: 'value3'
      },
      userId: 'USER_ID_HERE' // ⚠️ THAY BẰNG USER ID THẬT
    })
  });
  const account = await createResponse.json();
  console.log('✓ Created:', account.customFields);
  
  const accountId = account._id;
  
  // Step 2: Update với 1 field mới
  console.log('\nStep 2: Updating with 1 new field...');
  const updateResponse = await fetch(`http://localhost:5000/api/accounts/${accountId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customFields: {
        field4: 'value4'
      }
    })
  });
  const updated = await updateResponse.json();
  console.log('✓ Updated:', updated.customFields);
  
  // Step 3: Verify
  console.log('\nStep 3: Verifying...');
  const getResponse = await fetch(`http://localhost:5000/api/accounts/${accountId}`);
  const verified = await getResponse.json();
  
  const expectedFields = ['field1', 'field2', 'field3', 'field4'];
  const actualFields = Object.keys(verified.customFields);
  
  const allPresent = expectedFields.every(f => actualFields.includes(f));
  
  if (allPresent) {
    console.log('✅ TEST PASSED! All fields present:', verified.customFields);
  } else {
    console.log('❌ TEST FAILED!');
    console.log('Expected:', expectedFields);
    console.log('Actual:', actualFields);
    console.log('Missing:', expectedFields.filter(f => !actualFields.includes(f)));
  }
  
  // Cleanup
  console.log('\nCleaning up test account...');
  await fetch(`http://localhost:5000/api/accounts/${accountId}`, {
    method: 'DELETE'
  });
  console.log('✓ Cleanup complete');
}

async function testUpdateExistingField() {
  console.log('\n\nTest 2: Update existing field\n');
  
  // Step 1: Tạo account
  console.log('Step 1: Creating account...');
  const createResponse = await fetch('http://localhost:5000/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customFields: {
        name: 'Original Name',
        email: 'original@email.com'
      },
      userId: 'USER_ID_HERE' // ⚠️ THAY BẰNG USER ID THẬT
    })
  });
  const account = await createResponse.json();
  console.log('✓ Created:', account.customFields);
  
  const accountId = account._id;
  
  // Step 2: Update existing field
  console.log('\nStep 2: Updating existing field...');
  const updateResponse = await fetch(`http://localhost:5000/api/accounts/${accountId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customFields: {
        name: 'Updated Name'
      }
    })
  });
  const updated = await updateResponse.json();
  console.log('✓ Updated:', updated.customFields);
  
  // Step 3: Verify
  console.log('\nStep 3: Verifying...');
  const getResponse = await fetch(`http://localhost:5000/api/accounts/${accountId}`);
  const verified = await getResponse.json();
  
  const nameUpdated = verified.customFields.name === 'Updated Name';
  const emailPreserved = verified.customFields.email === 'original@email.com';
  
  if (nameUpdated && emailPreserved) {
    console.log('✅ TEST PASSED!');
    console.log('Name updated:', verified.customFields.name);
    console.log('Email preserved:', verified.customFields.email);
  } else {
    console.log('❌ TEST FAILED!');
    console.log('Actual:', verified.customFields);
  }
  
  // Cleanup
  console.log('\nCleaning up test account...');
  await fetch(`http://localhost:5000/api/accounts/${accountId}`, {
    method: 'DELETE'
  });
  console.log('✓ Cleanup complete');
}

async function testMultipleSaves() {
  console.log('\n\nTest 3: Multiple sequential saves\n');
  
  // Step 1: Tạo account rỗng
  console.log('Step 1: Creating empty account...');
  const createResponse = await fetch('http://localhost:5000/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customFields: {},
      userId: 'USER_ID_HERE' // ⚠️ THAY BẰNG USER ID THẬT
    })
  });
  const account = await createResponse.json();
  const accountId = account._id;
  console.log('✓ Created account:', accountId);
  
  // Step 2-5: Sequential saves
  const saves = [
    { field1: 'A' },
    { field2: 'B' },
    { field3: 'C' },
    { field4: 'D' }
  ];
  
  for (let i = 0; i < saves.length; i++) {
    console.log(`\nSave ${i + 1}:`, saves[i]);
    await fetch(`http://localhost:5000/api/accounts/${accountId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customFields: saves[i] })
    });
  }
  
  // Step 6: Verify
  console.log('\nVerifying final state...');
  const getResponse = await fetch(`http://localhost:5000/api/accounts/${accountId}`);
  const verified = await getResponse.json();
  
  const expectedFields = ['field1', 'field2', 'field3', 'field4'];
  const actualFields = Object.keys(verified.customFields);
  const allPresent = expectedFields.every(f => actualFields.includes(f));
  
  if (allPresent) {
    console.log('✅ TEST PASSED! All sequential saves preserved:');
    console.log(verified.customFields);
  } else {
    console.log('❌ TEST FAILED!');
    console.log('Expected:', expectedFields);
    console.log('Actual:', actualFields);
  }
  
  // Cleanup
  console.log('\nCleaning up test account...');
  await fetch(`http://localhost:5000/api/accounts/${accountId}`, {
    method: 'DELETE'
  });
  console.log('✓ Cleanup complete');
}

// Run all tests
(async function runAllTests() {
  try {
    console.log('═══════════════════════════════════════');
    console.log('  v1.2.1 FIX VERIFICATION TEST SUITE');
    console.log('═══════════════════════════════════════\n');
    
    await testMergeCustomFields();
    await testUpdateExistingField();
    await testMultipleSaves();
    
    console.log('\n═══════════════════════════════════════');
    console.log('  ALL TESTS COMPLETED');
    console.log('═══════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ TEST ERROR:', error);
  }
})();
