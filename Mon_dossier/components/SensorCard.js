export function createSensorCard(title, value, unit) {
    return `
      <div class="sensor-card">
        <h3>${title}</h3>
        <p>${value} <span>${unit}</span></p>
      </div>
    `;
  }