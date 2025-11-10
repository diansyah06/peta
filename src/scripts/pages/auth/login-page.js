import LoginPresenter from './login-presenter';
import * as CityCareAPI from '../../data/api';
import * as AuthModel from '../../utils/auth';

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="container" style="max-width:400px; margin-top: 50px;">
        <article class="login-form-container">
          <h2 class="login__title" style="text-align:center; margin-bottom: 20px;">Masuk Akun</h2>

          <form id="login-form" class="login-form" style="display:flex; flex-direction:column; gap:10px;">
            <div class="form-control">
              <label for="email-input">Email</label>
              <input id="email-input" type="email" name="email" placeholder="Contoh: nama@email.com" required>
            </div>
            <div class="form-control">
              <label for="password-input">Password</label>
              <input id="password-input" type="password" name="password" placeholder="Masukkan password Anda" required>
            </div>
            <div class="form-buttons" style="margin-top: 20px;">
              <div id="submit-button-container">
                <button class="btn" type="submit" style="width: 100%; padding: 10px; background-color: #69bdea; color: white; border: none; border-radius: 5px;">Masuk</button>
              </div>
              <p class="login-form__do-not-have-account" style="text-align:center; margin-top: 15px;">
                Belum punya akun? <a href="#/register">Daftar</a>
              </p>
            </div>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    
    // Inisialisasi presenter (hanya jika tidak ada token)
    this.#presenter = new LoginPresenter({
      view: this,
      model: CityCareAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = {
        email: document.getElementById('email-input').value,
        password: document.getElementById('password-input').value,
      };
      await this.#presenter.handleLogin(data);
    });
  }

  showSubmitLoadingButton(text = 'Masuk...') {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled style="width: 100%; padding: 10px; background-color: #69bdea; color: white; border: none; border-radius: 5px; opacity: 0.7;">
        <i class="fas fa-spinner loader-button"></i> ${text}
      </button>
    `;
  }

  hideSubmitLoadingButton(text = 'Masuk') {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" style="width: 100%; padding: 10px; background-color: #69bdea; color: white; border: none; border-radius: 5px;">${text}</button>
    `;
  }

  loginSuccessfully(message) {
    console.log('Login success:', message);
    window.location.hash = '#/home';
  }

  loginFailed(message) {
    alert(`Login Gagal: ${message}`);
  }
}