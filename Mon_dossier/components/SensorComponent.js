// components/SensorComponent.js
export default {
    template: `
      <div class="sensor-card">
        <h3>{{ title }}</h3>
        <p>{{ value }} {{ unit }}</p>
      </div>
    `,
    props: ['title', 'value', 'unit']
  };