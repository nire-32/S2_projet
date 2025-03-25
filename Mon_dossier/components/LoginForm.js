export function renderLoginForm() {
    return `
      <form id="login-form">
        <input type="email" placeholder="Email" required>
        <input type="password" placeholder="Mot de passe" required>
        <button type="submit">Connexion</button>
      </form>
    `;
  }