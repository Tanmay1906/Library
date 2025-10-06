// Manual Dashboard Test
// Open browser console and run this to simulate successful login

const testUser = {
  id: "cmgcpy14b0000phl9qava7d5x",
  name: "System Administrator", 
  email: "admin@librarymate.com",
  role: "owner",
  libraryId: "cmgcpy14b0000phl9qava7d5x"
};

const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZ2NweTE0YjAwMDBwaGw5cWF2YTdkNXgiLCJyb2xlIjoiTElCUkFSWV9PV05FUiIsImlhdCI6MTc1OTY2ODEzMiwiZXhwIjoxNzYwMjcyOTMyfQ.YWvQRhWE4iUxr_Pz-5WGgtGFkEl73uQZdcHdRT8WszE";

// Set authentication data
localStorage.setItem('user', JSON.stringify(testUser));
localStorage.setItem('token', testToken);

console.log('✅ Authentication data set');
console.log('👤 User:', testUser);
console.log('🔑 Token set');

// Reload the page to trigger auth state restoration
console.log('🔄 Reloading page to restore auth state...');
window.location.reload();