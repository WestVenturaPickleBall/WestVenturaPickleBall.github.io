document.addEventListener('DOMContentLoaded', function() {
  // Page navigation
  const homepage = document.getElementById('homepage');
  const calendarPage = document.getElementById('calendar-page');
  const ctaButton = document.querySelector('.cta-button');
  const backButton = document.querySelector('.back-button');
  
  // Modal elements
  const modal = document.getElementById('booking-modal');
  const closeModal = document.querySelector('.close-modal');
  const bookingForm = document.getElementById('booking-form');
  const selectedTimeDisplay = document.getElementById('selected-time-display');
  
  let selectedTimeSlot = null;

  // Initialize modal as hidden
  modal.classList.add('hidden');

  // Page navigation handlers
  ctaButton.addEventListener('click', function(event) {
    event.preventDefault();
    homepage.classList.add('hidden');
    calendarPage.classList.remove('hidden');
    initializeCalendar();
  });
  
  backButton.addEventListener('click', function(event) {
    event.preventDefault();
    calendarPage.classList.add('hidden');
    homepage.classList.remove('hidden');
  });

  // Modal handlers
  closeModal.addEventListener('click', function() {
    modal.classList.add('hidden');
  });

  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.classList.add('hidden');
    }
  });

  bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    if (selectedTimeSlot) {
      // Mark as booked
      selectedTimeSlot.classList.add('booked');
      selectedTimeSlot.textContent = `${selectedTimeSlot.dataset.time} - Booked`;
      selectedTimeSlot.dataset.booked = "true";
      selectedTimeSlot.dataset.name = name;
      selectedTimeSlot.dataset.email = email;
      
      // Store booking in localStorage
      const bookingData = {
        time: selectedTimeSlot.dataset.time,
        day: selectedTimeSlot.dataset.day,
        name: name,
        email: email,
        timestamp: new Date().toISOString()
      };
      
      const bookings = JSON.parse(localStorage.getItem('pickleballBookings') || '[]');
      bookings.push(bookingData);
      localStorage.setItem('pickleballBookings', JSON.stringify(bookings));
    }
    
    bookingForm.reset();
    modal.classList.add('hidden');
  });

  function initializeCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = [];
    
    // Generate times from 9AM to 5PM
    for (let hour = 9; hour <= 17; hour++) {
      const timeString = hour <= 12 ? `${hour}:00 AM` : `${hour-12}:00 PM`;
      times.push(timeString);
    }
    
    // Load existing bookings
    const bookings = JSON.parse(localStorage.getItem('pickleballBookings') || '[]');
    
    days.forEach(day => {
      times.forEach(time => {
        const timeslot = document.createElement('div');
        timeslot.classList.add('timeslot');
        
        // Check if this slot is already booked
        const booking = bookings.find(b => b.day === day && b.time === time);
        
        if (booking) {
          timeslot.classList.add('booked');
          timeslot.textContent = `${time} - Booked`;
          timeslot.dataset.booked = "true";
          timeslot.dataset.name = booking.name;
          timeslot.dataset.email = booking.email;
        } else {
          timeslot.textContent = time;
          timeslot.dataset.booked = "false";
        }
        
        timeslot.dataset.day = day;
        timeslot.dataset.time = time;
        
        timeslot.addEventListener('click', function() {
          if (timeslot.dataset.booked === "false") {
            selectedTimeSlot = timeslot;
            selectedTimeDisplay.textContent = `Booking: ${day} at ${time}`;
            modal.classList.remove('hidden');
          }
        });
        
        calendarGrid.appendChild(timeslot);
      });
    });
  }
});