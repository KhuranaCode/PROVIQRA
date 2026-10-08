import { hydrateState, isBlockedBetween, getVisibleUsers, findConnection, getConnectionState, cleanText } from './src/core/state.js';
import { createDefaultState } from './src/core/storage.js';

console.log('================================================================');
console.log('🧪 RUNNING PROVIQRA CORE STATE & HYDRATION VERIFICATION');
console.log('================================================================\n');

// 1. Test Hydration & Migration
const defaults = createDefaultState('dark');
const corruptedRaw = {
  currentUserId: 'user_1',
  users: [{ id: 'user_1', name: 'Aaditya' }, { id: 'user_2', name: 'Rohan' }],
  blockedUserIds: ['user_2'],
  // conversations missing intentionally
};

const hydrated = hydrateState(corruptedRaw, defaults);
console.log('1️⃣ TESTING STATE HYDRATION & MIGRATION:');
if (hydrated.blocks.length === 1 && hydrated.blocks[0].blockerId === 'user_1' && hydrated.blocks[0].blockedId === 'user_2') {
  console.log('✅ PASS: Migrated legacy blockedUserIds to directional blocks!');
} else {
  console.error('❌ FAIL: Migration failed', hydrated.blocks);
  process.exit(1);
}

if (Array.isArray(hydrated.conversations) && hydrated.conversations.length > 0) {
  console.log('✅ PASS: Hydrated missing conversations array from defaults!');
} else {
  console.error('❌ FAIL: Failed to populate missing conversations');
  process.exit(1);
}

// 2. Test Directional Visibility
console.log('\n2️⃣ TESTING DIRECTIONAL VISIBILITY & BLOCKS:');
const sampleUsers = [
  { id: 'user_1', name: 'Aaditya' },
  { id: 'user_2', name: 'Rohan' },
  { id: 'user_3', name: 'Sarah' }
];
const blocks = [{ blockerId: 'user_1', blockedId: 'user_2' }];

const visibleToAaditya = getVisibleUsers(sampleUsers, blocks, 'user_1');
const visibleToSarah = getVisibleUsers(sampleUsers, blocks, 'user_3');
const visibleToRohan = getVisibleUsers(sampleUsers, blocks, 'user_2');

if (visibleToAaditya.length === 2 && !visibleToAaditya.some(u => u.id === 'user_2')) {
  console.log('✅ PASS: Aaditya does not see blocked user Rohan');
} else {
  console.error('❌ FAIL: Aaditya should not see Rohan');
  process.exit(1);
}

if (visibleToRohan.length === 2 && !visibleToRohan.some(u => u.id === 'user_1')) {
  console.log('✅ PASS: Rohan does not see user who blocked him (Aaditya)');
} else {
  console.error('❌ FAIL: Rohan should not see Aaditya');
  process.exit(1);
}

if (visibleToSarah.length === 3) {
  console.log('✅ PASS: Sarah sees all 3 users (unaffected by others\' blocks)');
} else {
  console.error('❌ FAIL: Sarah should see all 3 users');
  process.exit(1);
}

// 3. Test Connection State Machine
console.log('\n3️⃣ TESTING CONNECTION STATE MACHINE:');
const sampleConns = [
  { id: 'c1', senderId: 'user_1', receiverId: 'user_2', status: 'pending' },
  { id: 'c2', senderId: 'user_3', receiverId: 'user_1', status: 'accepted' }
];

const state1to2 = getConnectionState(sampleConns, 'user_1', 'user_2');
const state2to1 = getConnectionState(sampleConns, 'user_2', 'user_1');
const state1to3 = getConnectionState(sampleConns, 'user_1', 'user_3');

if (state1to2 === 'outgoing' && state2to1 === 'incoming' && state1to3 === 'connected') {
  console.log('✅ PASS: Connection state matches perspective (outgoing, incoming, connected)!');
} else {
  console.error('❌ FAIL: Incorrect connection states:', { state1to2, state2to1, state1to3 });
  process.exit(1);
}

// 4. Test Text Sanitization
console.log('\n4️⃣ TESTING INPUT SANITIZATION:');
const dirty = '   hello world \n\t   ';
const cleaned = cleanText(dirty);
if (cleaned === 'hello world') {
  console.log('✅ PASS: cleanText properly strips leading and trailing whitespaces!');
} else {
  console.error('❌ FAIL: cleanText failed', JSON.stringify(cleaned));
  process.exit(1);
}

console.log('\n✨ ALL CORE STATE & HYDRATION CHECKS PASSED SUCCESSFULLY!\n');
