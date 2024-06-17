import './style.css'
import {
  showSignUp,
  showSignIn,
  trySignUp,
  trySignIn
} from './functions.js';

document.querySelector('#app').innerHTML = `
  <div class="auth-container" id="auth-container">
    <div class="form-container sign-up-container">
      <form id="signUpForm" action="#" method="post">
        <h1>Create Account</h1>
        <input name="username" value="vasyl" type="text" placeholder="Username" required />
        <input name="password" value="vasyl" type="password" placeholder="Password" required />
        <button onclick="trySignUp()">Sign Up</button>
      </form>
    </div>
    <div class="form-container sign-in-container">
      <form id="signInForm" action="#" method="post">
        <h1>Sign in</h1>
        <input name="username" value="vasyl" type="text" placeholder="Username" required />
        <input name="password" value="vasyl" type="password" placeholder="Password" required />
        <a href="#">Forgot your password?</a>
        <button type="submit" onclick="trySignIn()">Sign In</button>
      </form>
    </div>
    <div class="overlay-container">
      <div class="overlay">
        <div class="overlay-panel overlay-left">
          <h1>Welcome Back!</h1>
          <p>To keep connected with us please login with your personal info</p>
          <button class="ghost" onclick="showSignIn()">Sign In</button>
        </div>
        <div class="overlay-panel overlay-right">
          <h1>Hello, Friend!</h1>
          <p>Enter your personal details and start journey with us</p>
          <button class="ghost" onclick="showSignUp()">Sign Up</button>
        </div>
      </div>
    </div>
  </div>
  <div class="main-container">
    <ul>
      <li><a href="#home">Home</a></li>
      <li><a href="#news">News</a></li>
      <li><a href="#contact">Contact</a></li>
      <li><a href="#about">About</a></li>
    </ul>
  </div>
`
