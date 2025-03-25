export function renderNavbar() {
    return `
      <nav class="navbar">
        <a href="/dashboard">Dashboard</a>
        <a href="/settings">Paramètres</a>
        <div id="user-auth"></div>
      </nav>
    `;
  }