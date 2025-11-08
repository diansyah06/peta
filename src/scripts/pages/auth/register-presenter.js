export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async handleRegister({ name, email, password }) {
    this.#view.showSubmitLoadingButton('Mendaftar...');

    try {
      const response = await this.#model.getRegistered({ name, email, password });

      if (!response.ok) {
        console.error('Register gagal:', response);
        this.#view.registerFailed(response.message || 'Server error');
        return;
      }

      this.#view.registerSuccessfully('Pendaftaran berhasil! Silakan masuk.');
    } catch (error) {
      console.error('Register error:', error);
      this.#view.registerFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton('Daftar Akun');
    }
  }
}