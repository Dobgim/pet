// Immediately check session before page fully renders to prevent flashing protected content
if (sessionStorage.getItem('isAdmin') !== 'true') {
  // Not authenticated, kick back to login
  window.location.replace('admin-login.html');
}

document.addEventListener('DOMContentLoaded', () => {
  // Add a logout button to the navbar if we are on the admin page
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.style.color = '#e74c3c';
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('isAdmin');
      window.location.href = 'admin-login.html';
    });
    navLinks.appendChild(logoutBtn);
  }
});
