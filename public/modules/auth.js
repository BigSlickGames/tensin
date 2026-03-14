window.ModuleRegistry.register({
  id: 'auth',
  name: 'Account',
  icon: '👤',
  type: 'system',
  description: 'Sign in or create an account',
  version: '1.0.0',
  author: 'System',

  render: (container) => {
    const isAuthenticated = window.AuthManager.isAuthenticated();
    const currentUser = window.AuthManager.getCurrentUser();

    if (isAuthenticated) {
      renderProfile(container, currentUser);
    } else {
      renderAuthForm(container);
    }
  }
});

function renderAuthForm(container) {
  const html = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
      <div style="width: 100%; max-width: 400px; background: #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎮</div>
          <h1 style="color: #f9fafb; font-size: 28px; font-weight: bold; margin: 0 0 8px 0;">Welcome Back</h1>
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">Sign in to continue your gaming journey</p>
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
              <label style="display: block; color: #f9fafb; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Username</label>
              <input type="text" id="signin-username" required style="width: 100%; padding: 12px; background: #111827; border: 2px solid #374151; border-radius: 8px; color: #f9fafb; font-size: 14px; transition: border-color 0.2s;" placeholder="Enter your username">
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

  document.getElementById('signin-form-element').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;
    const errorDiv = document.getElementById('signin-error');
    const btn = document.getElementById('signin-btn');

    btn.disabled = true;
    btn.textContent = 'Signing in...';
    errorDiv.style.display = 'none';

    const result = await window.AuthManager.signIn(username, password);

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
    const username = document.getElementById('signup-username').value;
    const firstname = document.getElementById('signup-firstname').value;
    const lastname = document.getElementById('signup-lastname').value;
    const password = document.getElementById('signup-password').value;
    const errorDiv = document.getElementById('signup-error');
    const btn = document.getElementById('signup-btn');

    btn.disabled = true;
    btn.textContent = 'Creating account...';
    errorDiv.style.display = 'none';

    const result = await window.AuthManager.signUp(username, password, firstname, lastname);

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
