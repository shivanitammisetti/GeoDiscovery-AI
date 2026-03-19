document.addEventListener("DOMContentLoaded", loadEvents);

async function loadEvents() {
  const container = document.getElementById("events-container");

  try {
    const data = await API.getEvents();

    const events = data.events || [];

    container.innerHTML = events.map(event => `
      <div class="event-card">
        <h3>${event.title}</h3>
        <p><strong>Category:</strong> ${event.category}</p>
        <p><strong>Date:</strong> ${event.date}</p>
      </div>
    `).join("");

  } catch (err) {
    container.innerHTML = "Failed to load NASA events.";
  }
}