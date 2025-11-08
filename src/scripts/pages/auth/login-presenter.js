export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async handleLogin({ email, password }) {
    this.#view.showSubmitLoadingButton('Masuk...');

    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        console.error('Login gagal:', response);
        this.#view.loginFailed(response.message || 'Server error');
        return;
      }

      // Simpan token ke localStorage
      this.#authModel.putAccessToken(response.data.accessToken);

      // Beri tahu view kalau login berhasil
      this.#view.loginSuccessfully(response.message || 'Login berhasil!');
    } catch (error) {
      console.error('Error login:', error);
      this.#view.loginFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton('Masuk');
    }
  }
}
