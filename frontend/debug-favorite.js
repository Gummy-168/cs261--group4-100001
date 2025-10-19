// Debug script - วางใน Browser Console เพื่อตรวจสอบระบบ Favorite

console.log('🔍 ===== DEBUG: Favorite System =====');

// 1. เช็ค Token
const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
const userId = localStorage.getItem('userId');

console.log('1️⃣ Authentication Status:');
console.log('  - Token exists:', !!token);
console.log('  - Token value:', token ? token.substring(0, 20) + '...' : 'None');
console.log('  - User ID:', userId);

// 2. เช็ค Auth State
console.log('\n2️⃣ Auth State (ถ้ามี):');
// ต้องเข้าถึงจาก React DevTools หรือ check ใน component

// 3. ทดสอบเรียก API Favorites
console.log('\n3️⃣ Testing Favorite API:');

if (token && userId) {
  // Test add favorite
  fetch('http://localhost:8080/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      userId: parseInt(userId),
      eventId: 1 // ลองใช้ eventId = 1
    })
  })
  .then(res => {
    console.log('  - Add Favorite Response Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('  - Add Favorite Response Data:', data);
  })
  .catch(err => {
    console.error('  - Add Favorite Error:', err);
  });

  // Test get favorites
  setTimeout(() => {
    fetch(`http://localhost:8080/api/favorites/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      console.log('  - Get Favorites Response Status:', res.status);
      return res.json();
    })
    .then(data => {
      console.log('  - Get Favorites Response Data:', data);
    })
    .catch(err => {
      console.error('  - Get Favorites Error:', err);
    });
  }, 1000);
} else {
  console.log('  ⚠️ Cannot test API - Token or UserId missing');
}

console.log('\n✅ Debug script completed!');
console.log('📝 Check the results above for any issues.');
