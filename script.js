document.addEventListener('DOMContentLoaded', function () {
  const homepage = document.getElementById('homepage');
  const calendarPage = document.getElementById('calendar-page');
  const ctaButton = document.querySelector('.cta-button');
  const backButton = document.querySelector('.back-button');

  // Show calendar page when CTA button is clicked
  ctaButton.addEventListener('click', function (event) {
    event.preventDefault();
    homepage.classList.add('hidden');
    calendarPage.classList.remove('hidden');
  });

  // Show homepage when Back button is clicked
  backButton.addEventListener('click', function (event) {
    event.preventDefault();
    calendarPage.classList.add('hidden');
    homepage.classList.remove('hidden');
  });

  // Initialize Simple Calendar
  const calendarGrid = document.getElementById('calendarGrid');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const startTime = 9; // 9 AM
  const endTime = 18; // 6 PM

  // Function to create a timeslot
  function createTimeslot(time, day) {
    const timeslot = document.createElement('div');
    timeslot.classList.add('timeslot');
    timeslot.textContent = `${day} - ${time}:00`;
    timeslot.addEventListener('click', function () {
      timeslot.classList.toggle('booked');
    });
    calendarGrid.appendChild(timeslot);
  }

  // Populate the calendar with timeslots
  days.forEach(day => {
    for (let hour = startTime; hour < endTime; hour++) {
      createTimeslot(hour, day);
    }
  });
});