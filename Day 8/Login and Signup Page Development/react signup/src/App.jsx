import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'professional-auth-members'
const SESSION_KEY = 'professional-auth-current-member'

const initialRegister = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false,
}

const initialLogin = {
  email: '',
  password: '',
  remember: true,
}

function getMembers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveMembers(members) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
}

function getSavedMember() {
  const savedId = localStorage.getItem(SESSION_KEY)
  if (!savedId) return null
  return getMembers().find((item) => item.id === savedId) || null
}

function App() {
  const savedMember = getSavedMember()
  const [screen, setScreen] = useState(savedMember ? 'home' : 'signup')
  const [member, setMember] = useState(savedMember)
  const [registerForm, setRegisterForm] = useState(initialRegister)
  const [loginForm, setLoginForm] = useState(initialLogin)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [pendingMember, setPendingMember] = useState(null)

  const firstName = useMemo(() => {
    if (!member?.name) return 'Member'
    return member.name.trim().split(' ')[0]
  }, [member])

  useEffect(() => {
    if (!pendingMember) return undefined

    const redirectTimer = setTimeout(() => {
      setMember(pendingMember)
      setScreen('home')
      setPendingMember(null)
    }, 1400)

    return () => clearTimeout(redirectTimer)
  }, [pendingMember])

  function updateRegister(event) {
    const { name, value, checked, type } = event.target
    setRegisterForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function updateLogin(event) {
    const { name, value, checked, type } = event.target
    setLoginForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function switchScreen(nextScreen) {
    setScreen(nextScreen)
    setMessage({ type: '', text: '' })
  }

  function handleRegister(event) {
    event.preventDefault()

    const name = registerForm.name.trim()
    const email = registerForm.email.trim().toLowerCase()
    const password = registerForm.password

    if (!name || !email || !password || !registerForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Please complete all required fields.' })
      return
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }

    if (password !== registerForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    if (!registerForm.agree) {
      setMessage({ type: 'error', text: 'Please accept the member agreement.' })
      return
    }

    const members = getMembers()
    const existingMember = members.find((item) => item.email === email)

    if (existingMember) {
      setMessage({ type: 'error', text: 'An account already exists for this email.' })
      return
    }

    const newMember = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      joinedAt: new Date().toISOString(),
    }

    saveMembers([...members, newMember])
    localStorage.setItem(SESSION_KEY, newMember.id)
    setRegisterForm(initialRegister)
    setPendingMember(newMember)
    setMessage({
      type: 'success',
      text: 'Registered successfully. Redirecting to your home page...',
    })
  }

  function handleLogin(event) {
    event.preventDefault()

    const email = loginForm.email.trim().toLowerCase()
    const password = loginForm.password
    const matchedMember = getMembers().find(
      (item) => item.email === email && item.password === password,
    )

    if (!matchedMember) {
      setMessage({
        type: 'error',
        text: 'We could not find an account with those credentials.',
      })
      return
    }

    if (loginForm.remember) {
      localStorage.setItem(SESSION_KEY, matchedMember.id)
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
    setLoginForm((current) => ({ ...initialLogin, remember: current.remember }))
    setPendingMember(matchedMember)
    setMessage({
      type: 'success',
      text: 'Signed in successfully. Redirecting to your home page...',
    })
  }

  function handleSignOut() {
    localStorage.removeItem(SESSION_KEY)
    setMember(null)
    setScreen('signin')
    setMessage({ type: '', text: '' })
  }

  if (screen === 'home' && member) {
    return (
      <main className="home-shell">
        <nav className="topbar" aria-label="Member navigation">
          <a className="brand" href="#" onClick={(event) => event.preventDefault()}>
            <span className="brand-mark">N</span>
            Nexus Member
          </a>
          <button className="ghost-button" type="button" onClick={handleSignOut}>
            Sign out
          </button>
        </nav>

        <section className="home-hero">
          <div>
            <p className="eyebrow">Member workspace</p>
            <h1>Welcome home, {firstName}</h1>
            <p>
              Your profile is active. From here you can manage account details,
              review new member benefits, and continue into the app experience.
            </p>
            {message.text && <p className={`status ${message.type}`}>{message.text}</p>}
          </div>
          <div className="profile-panel">
            <span className="avatar">{firstName.charAt(0).toUpperCase()}</span>
            <div>
              <h2>{member.name}</h2>
              <p>{member.email}</p>
            </div>
          </div>
        </section>

        <section className="dashboard-grid" aria-label="Account overview">
          <article>
            <span className="metric">01</span>
            <h3>Verified Access</h3>
            <p>Your account can now reach the member dashboard and account tools.</p>
          </article>
          <article>
            <span className="metric">24/7</span>
            <h3>Member Support</h3>
            <p>Get assistance with billing, profile changes, and onboarding steps.</p>
          </article>
          <article>
            <span className="metric">100%</span>
            <h3>Profile Ready</h3>
            <p>Your registration details were saved locally for this demo app.</p>
          </article>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Membership benefits">
        <nav className="auth-brand">
          <span className="brand-mark">N</span>
          Nexus Member
        </nav>

        <div className="visual-content">
          <p className="eyebrow">Professional member access</p>
          <h1>Start your member workspace in minutes.</h1>
          <p>
            Create a new account or sign in with existing credentials to continue
            to your member home page.
          </p>
        </div>

        <div className="trust-strip" aria-label="Service highlights">
          <span>Local demo credential flow</span>
          <span>Instant member redirect</span>
          <span>Responsive design</span>
        </div>
      </section>

      <section className="auth-panel" aria-label="Authentication form">
        <div className="tabs" role="tablist" aria-label="Choose authentication mode">
          <button
            className={screen === 'signup' ? 'active' : ''}
            type="button"
            onClick={() => switchScreen('signup')}
          >
            Register
          </button>
          <button
            className={screen === 'signin' ? 'active' : ''}
            type="button"
            onClick={() => switchScreen('signin')}
          >
            Sign in
          </button>
        </div>

        {screen === 'signup' ? (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-heading">
              <p className="eyebrow">New member</p>
              <h2>Create your account</h2>
            </div>

            <label>
              Full name
              <input
                autoComplete="name"
                name="name"
                onChange={updateRegister}
                placeholder="Aarav Mehta"
                type="text"
                value={registerForm.name}
              />
            </label>

            <label>
              Email address
              <input
                autoComplete="email"
                name="email"
                onChange={updateRegister}
                placeholder="you@example.com"
                type="email"
                value={registerForm.email}
              />
            </label>

            <div className="field-row">
              <label>
                Password
                <input
                  autoComplete="new-password"
                  name="password"
                  onChange={updateRegister}
                  placeholder="Minimum 8 characters"
                  type="password"
                  value={registerForm.password}
                />
              </label>

              <label>
                Confirm password
                <input
                  autoComplete="new-password"
                  name="confirmPassword"
                  onChange={updateRegister}
                  placeholder="Repeat password"
                  type="password"
                  value={registerForm.confirmPassword}
                />
              </label>
            </div>

            <label className="check-line">
              <input
                checked={registerForm.agree}
                name="agree"
                onChange={updateRegister}
                type="checkbox"
              />
              I agree to create a member account.
            </label>

            {message.text && <p className={`status ${message.type}`}>{message.text}</p>}

            <button className="primary-button" type="submit">
              Create account
            </button>
            <p className="switch-copy">
              Already have credentials?
              <button type="button" onClick={() => switchScreen('signin')}>
                Sign in
              </button>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-heading">
              <p className="eyebrow">Returning member</p>
              <h2>Sign in to continue</h2>
            </div>

            <label>
              Email address
              <input
                autoComplete="email"
                name="email"
                onChange={updateLogin}
                placeholder="you@example.com"
                type="email"
                value={loginForm.email}
              />
            </label>

            <label>
              Password
              <input
                autoComplete="current-password"
                name="password"
                onChange={updateLogin}
                placeholder="Enter your password"
                type="password"
                value={loginForm.password}
              />
            </label>

            <label className="check-line">
              <input
                checked={loginForm.remember}
                name="remember"
                onChange={updateLogin}
                type="checkbox"
              />
              Keep me signed in on this device.
            </label>

            {message.text && <p className={`status ${message.type}`}>{message.text}</p>}

            <button className="primary-button" type="submit">
              Sign in
            </button>
            <p className="switch-copy">
              New here?
              <button type="button" onClick={() => switchScreen('signup')}>
                Register now
              </button>
            </p>
          </form>
        )}
      </section>
    </main>
  )
}

export default App
