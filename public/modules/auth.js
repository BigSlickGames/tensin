const authModule = {
  id: 'auth',
  name: 'Account',
  icon: '👤',
  type: 'system',
  description: 'Sign in or create an account',
  version: '1.0.0',
  author: 'System',

  start: (container) => {
    const isAuthenticated = window.AuthManager.isAuthenticated();
    const currentUser = window.AuthManager.getCurrentUser();
    const isTelegram = window.TelegramAdapter && window.TelegramAdapter.isAvailable;

    if (isAuthenticated) {
      renderProfile(container, currentUser);
    } else if (isTelegram) {
      renderTelegramAuth(container);
    } else {
      renderAuthForm(container);
    }
  },

  stop: () => {
    // Cleanup if needed
  }
};

window.ModuleRegistry.register(authModule);

function renderTelegramAuth(container) {
  const telegramUser = window.TelegramAdapter.getUser();

  const html = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
      <div style="width: 100%; max-width: 400px; background: #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎮</div>
        <h1 style="color: #f9fafb; font-size: 28px; font-weight: bold; margin: 0 0 8px 0;">Welcome ${telegramUser.first_name}!</h1>
        <p style="color: #9ca3af; font-size: 14px; margin: 0 0 32px 0;">Continue with your Telegram account</p>

        <div id="telegram-auth-error" style="display: none; padding: 12px; background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; color: #fca5a5; font-size: 14px; margin-bottom: 16px; text-align: left;"></div>

        <button id="telegram-login-btn" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #0088cc 0%, #006699 100%); border: none; border-radius: 8px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4);">
          Continue with Telegram
        </button>
      </div>
    </div>
  `;

  container.innerHTML = html;

  const loginBtn = document.getElementById('telegram-login-btn');
  const errorDiv = document.getElementById('telegram-auth-error');

  loginBtn.addEventListener('click', async () => {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Authenticating...';
    errorDiv.style.display = 'none';

    const result = await window.AuthManager.authenticateWithTelegram();

    if (result.success) {
      window.UIManager.showMenu();
    } else {
      errorDiv.textContent = result.error || 'Authentication failed. Please try again.';
      errorDiv.style.display = 'block';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Continue with Telegram';
    }
  });

  loginBtn.addEventListener('mouseenter', () => {
    loginBtn.style.transform = 'translateY(-2px)';
  });

  loginBtn.addEventListener('mouseleave', () => {
    loginBtn.style.transform = 'translateY(0)';
  });
}

function renderAuthForm(container) {
  const html = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
      <div style="width: 100%; max-width: 400px; background: #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎮</div>
          <h1 style="color: #f9fafb; font-size: 28px; font-weight: bold; margin: 0 0 8px 0;">Welcome Back</h1>
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">Sign in to continue your gaming journey</p>
        </div>

        <button id="google-signin-btn" style="width: 100%; padding: 14px; background: white; border: 1px solid #dadce0; border-radius: 8px; color: #3c4043; font-size: 16px; font-weight: 500; cursor: pointer; transition: background 0.2s, box-shadow 0.2s; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style="text-align: center; margin: 20px 0; position: relative;">
          <span style="color: #6b7280; background: #1f2937; padding: 0 12px; position: relative; z-index: 1;">or</span>
          <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #374151; z-index: 0;"></div>
        </div>

        <div id="auth-tabs" style="display: flex; gap: 8px; margin-bottom: 24px; background: #111827; border-radius: 12px; padding: 4px;">
          <button id="signin-tab" class="auth-tab active" style="flex: 1; padding: 12px; border: none; background: #3b82f6; color: white; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            Sign In
          </button>
          <button id="signup-tab" class="auth-tab" style="flex: 1; padding: 12px; border: none; background: transparent; color: #9ca3af; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            Sign Up
          </button>
        </div>

        <div id="signin-form" class="auth-form">
          <form id="signin-form-element" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; color: #f9fafb; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Email</label>
              <input type="email" id="signin-email" required style="width: 100%; padding: 12px; background: #111827; border: 2px solid #374151; border-radius: 8px; color: #f9fafb; font-size: 14px; transition: border-color 0.2s;" placeholder="Enter your email">
            </div>
            <div>
              <label style="display: block; color: #f9fafb; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Password</label>
              <input type="password" id="signin-password" required style="width: 100%; padding: 12px; background: #111827; border: 2px solid #374151; border-radius: 8px; color: #f9fafb; font-size: 14px; transition: border-color 0.2s;" placeholder="Enter your password">
            </div>
            <div id="signin-error" style="display: none; padding: 12px; background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; color: #fca5a5; font-size: 14px;"></div>
            <button type="submit" id="signin-btn" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; border-radius: 8px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">
              Sign In
            </button>
          </form>
        </div>

        <div id="signup-form" class="auth-form" style="display: none;">
          <form id="signup-form-element" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; color: #f9fafb; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Email</label>
              <input type="email" id="signup-email" required style="width: 100%; padding: 12px; background: #111827; border: 2px solid #374151; border-radius: 8px; color: #f9fafb; font-size: 14px; transition: border-color 0.2s;" placeholder="Enter your email">
            </div>
            <div>
              <label style="display: block; color: #f9fafb; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Username</label>
              <input type="text" id="signup-username" required style="width: 100%; padding: 12px; background: #111827; border: 2px solid #374151; border-radius: 8px; color: #f9fafb; font-size: 14px; transition: border-color 0.2s;" placeholder="Choose a username">
            </div>
            <div>
              <label style="display: block; color: #f9fafb; font-size: 14px; font-weight: 500; margin-bottom: 8px;">First Name</label>
              <input type="text" id="signup-firstname" required style="width: 100%; padding: 12px; background: #111827; border: 2px solid #374151; border-radius: 8px; color: #f9fafb; font-size: 14px; transition: border-color 0.2s;" placeholder="Enter your first name">
            </div>
            <div>
              <label style="display: block; color: #f9fafb; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Last Name (Optional)</label>
              <input type="text" id="signup-lastname" style="width: 100%; padding: 12px; background: #111827; border: 2px solid #374151; border-radius: 8px; color: #f9fafb; font-size: 14px; transition: border-color 0.2s;" placeholder="Enter your last name">
            </div>
            <div>
              <label style="display: block; color: #f9fafb; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Password</label>
              <input type="password" id="signup-password" required minlength="6" style="width: 100%; padding: 12px; background: #111827; border: 2px solid #374151; border-radius: 8px; color: #f9fafb; font-size: 14px; transition: border-color 0.2s;" placeholder="Create a password (min 6 characters)">
            </div>
            <div id="signup-error" style="display: none; padding: 12px; background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; color: #fca5a5; font-size: 14px;"></div>
            <button type="submit" id="signup-btn" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; border-radius: 8px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  const signinTab = document.getElementById('signin-tab');
  const signupTab = document.getElementById('signup-tab');
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');

  signinTab.addEventListener('click', () => {
    signinTab.style.background = '#3b82f6';
    signinTab.style.color = 'white';
    signupTab.style.background = 'transparent';
    signupTab.style.color = '#9ca3af';
    signinForm.style.display = 'block';
    signupForm.style.display = 'none';
  });

  signupTab.addEventListener('click', () => {
    signupTab.style.background = '#10b981';
    signupTab.style.color = 'white';
    signinTab.style.background = 'transparent';
    signinTab.style.color = '#9ca3af';
    signupForm.style.display = 'block';
    signinForm.style.display = 'none';
  });

  const googleSigninBtn = document.getElementById('google-signin-btn');
  googleSigninBtn.addEventListener('click', async () => {
    googleSigninBtn.disabled = true;
    googleSigninBtn.textContent = 'Redirecting to Google...';

    const result = await window.AuthManager.signInWithGoogle();

    if (!result.success) {
      googleSigninBtn.disabled = false;
      googleSigninBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z" fill="#FBBC05"/><path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/></svg>Continue with Google';
      alert(result.error || 'Google sign in failed');
    }
  });

  document.getElementById('signin-form-element').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const errorDiv = document.getElementById('signin-error');
    const btn = document.getElementById('signin-btn');

    btn.disabled = true;
    btn.textContent = 'Signing in...';
    errorDiv.style.display = 'none';

    const result = await window.AuthManager.signInWithEmail(email, password);

    if (result.success) {
      window.UIManager.showMenu();
    } else {
      errorDiv.textContent = result.error || 'Sign in failed';
      errorDiv.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });

  document.getElementById('signup-form-element').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const username = document.getElementById('signup-username').value;
    const firstname = document.getElementById('signup-firstname').value;
    const lastname = document.getElementById('signup-lastname').value;
    const password = document.getElementById('signup-password').value;
    const errorDiv = document.getElementById('signup-error');
    const btn = document.getElementById('signup-btn');

    btn.disabled = true;
    btn.textContent = 'Creating account...';
    errorDiv.style.display = 'none';

    const result = await window.AuthManager.signUpWithEmail(email, username, password, firstname, lastname);

    if (result.success) {
      window.UIManager.showMenu();
    } else {
      errorDiv.textContent = result.error || 'Sign up failed';
      errorDiv.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });

  const inputs = container.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', (e) => {
      e.target.style.borderColor = '#3b82f6';
    });
    input.addEventListener('blur', (e) => {
      e.target.style.borderColor = '#374151';
    });
  });

  const buttons = container.querySelectorAll('button[type="submit"]');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', (e) => {
      e.target.style.transform = 'translateY(-2px)';
    });
    btn.addEventListener('mouseleave', (e) => {
      e.target.style.transform = 'translateY(0)';
    });
  });
}

function renderProfile(container, user) {
  const expToNextLevel = ((user.level || 1) * 1000) - (user.experience || 0);
  const expProgress = ((user.experience || 0) % 1000) / 1000 * 100;

  const html = `
    <div style="min-height: 100vh; padding: 20px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 16px; padding: 32px; margin-bottom: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 40px;">
              👤
            </div>
            <h1 style="color: white; font-size: 28px; font-weight: bold; margin: 0 0 8px 0;">${user.username || user.first_name}</h1>
            <p style="color: rgba(255, 255, 255, 0.8); font-size: 16px; margin: 0;">${user.first_name} ${user.last_name || ''}</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-align: center;">
              <div style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin-bottom: 4px;">Level</div>
              <div style="color: white; font-size: 24px; font-weight: bold;">${user.level || 1}</div>
            </div>
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-align: center;">
              <div style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin-bottom: 4px;">Bankroll</div>
              <div style="color: #fbbf24; font-size: 24px; font-weight: bold;">${(user.bankroll || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div style="background: #1f2937; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
          <h2 style="color: #f9fafb; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">Experience Progress</h2>
          <div style="background: #111827; border-radius: 8px; height: 24px; overflow: hidden; margin-bottom: 8px;">
            <div style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); height: 100%; width: ${expProgress}%; transition: width 0.3s;"></div>
          </div>
          <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">${expToNextLevel} XP to Level ${(user.level || 1) + 1}</p>
        </div>

        <div style="background: #1f2937; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
          <h2 style="color: #f9fafb; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">Statistics</h2>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; padding: 12px; background: #111827; border-radius: 8px;">
              <span style="color: #9ca3af;">Total Score</span>
              <span style="color: #f9fafb; font-weight: bold;">${(user.total_score || 0).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px; background: #111827; border-radius: 8px;">
              <span style="color: #9ca3af;">Total Wins</span>
              <span style="color: #f9fafb; font-weight: bold;">${user.total_wins || 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px; background: #111827; border-radius: 8px;">
              <span style="color: #9ca3af;">Experience</span>
              <span style="color: #f9fafb; font-weight: bold;">${(user.experience || 0).toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        <button id="signout-btn" style="width: 100%; padding: 14px; background: #374151; border: none; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
          Sign Out
        </button>
      </div>
    </div>
  `;

  container.innerHTML = html;

  document.getElementById('signout-btn').addEventListener('click', async () => {
    await window.AuthManager.signOut();
    window.UIManager.showMenu();
  });
}
