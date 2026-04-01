document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');

  // Check if already logged in
  if (sessionStorage.getItem('isAdmin') === 'true') {
    window.location.href = 'admin.html';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      // Simulated Secure Authentication
      if (username === 'admin' && password === 'password123') {
        // Success
        errorMsg.classList.remove('active');
        sessionStorage.setItem('isAdmin', 'true');
        
        // Show success state
        const btn = loginForm.querySelector('.btn-login');
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Authenticated...';
        btn.style.backgroundColor = '#2ecc71';
        
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 800);
      } else {
        // Failure
        errorMsg.classList.add('active');
        
        // Reset animation
        setTimeout(() => {
          errorMsg.classList.remove('active');
          // small hack to restart animation if they fail twice quickly
          void errorMsg.offsetWidth;
          errorMsg.classList.add('active');
        }, 10);
      }
    });
  }
});
