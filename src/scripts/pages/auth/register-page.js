import RegisterPresenter from './register-presenter';
import * as CityCareAPI from '../../data/api';

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="container" style="max-width:400px; margin-top: 50px;">
        <div class="register-form-container">
          <h2 class="register__title" style="text-align:center; margin-bottom: 20px;">Daftar Akun</h2>

          <form id="register-form" class="register-form" style="display:flex; flex-direction:column; gap:10px;">
            <div class="form-control">
              <label for="name-input">Nama lengkap</label>
              <input id="name-input" type="text" name="name" placeholder="Masukkan nama lengkap Anda" required>
            </div>
            <div class="form-control">
              <label for="email-input">Email</label>
              <input id="email-input" type="email" name="email" placeholder="Contoh: nama@email.com" required>
            </div>
            <div class="form-control">
              <label for="password-input">Password</label>
              <input id="password-input" type="password" name="password" placeholder="Masukkan password baru" required>
            </div>
            <div class="form-buttons" style="margin-top: 20px;">
              <div id="submit-button-container">
                <button class="btn" type="submit" style="width: 100%; padding: 10px; background-color: #69bdea; color: white; border: none; border-radius: 5px;">Daftar Akun</button>
              </div>
              <p class="register-form__already-have-account" style="text-align:center; margin-top: 15px;">Sudah punya akun? <a href="#/login">Masuk</a></p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: CityCareAPI,
    });

    this.#setupForm();
  }

  #setupForm() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        name: document.getElementById('name-input').value,
        email: document.getElementById('email-input').value,
        password: document.getElementById('password-input').value,
      };

      await this.#presenter.handleRegister(data);
    });
  }

  showSubmitLoadingButton(text = 'Mendaftar...') {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled style="width: 100%; padding: 10px; background-color: #69bdea; color: white; border: none; border-radius: 5px; opacity: 0.7;">
        <i class="fas fa-spinner loader-button"></i> ${text}
      </button>
    `;
  }

  hideSubmitLoadingButton(text = 'Daftar Akun') {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" style="width: 100%; padding: 10px; background-color: #69bdea; color: white; border: none; border-radius: 5px;">${text}</button>
    `;
  }

  registerSuccessfully(message) {
    alert(message || 'Pendaftaran berhasil! Silakan masuk.');
    window.location.hash = '/login';
  }

  registerFailed(message) {
    alert(message || 'Pendaftaran gagal. Coba lagi nanti.');
  }
}