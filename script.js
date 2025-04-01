document.addEventListener('DOMContentLoaded', function() {
  // Page navigation
  const homepage = document.getElementById('homepage');
  const calendarPage = document.getElementById('calendar-page');
  const ctaButton = document.querySelector('.cta-button');
  const backButton = document.querySelector('.back-button');
  
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

  // Modal elements
  const modal = document.getElementById('booking-modal');
  const closeModal = document.querySelector('.close-modal');
  const bookingForm = document.getElementById('booking-form');
  const selectedTimeDisplay = document.getElementById('selected-time-display');
  
  let selectedTimeSlot = null;

  // Close modal when clicking X
  closeModal.addEventListener('click', function() {
    modal.classList.add('hidden');
  });

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // Form submission
  bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    if (selectedTimeSlot) {
      // Mark as booked
      selectedTimeSlot.classList.add('booked');
      selectedTimeSlot.innerHTML = `
        <strong>${selectedTimeSlot.dataset.time}</strong>
        <div class="booked-by">Booked by: ${name}</div>
      `;
      selectedTimeSlot.dataset.booked = "true";
      
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
    
    // Reset form and close modal
    bookingForm.reset();
    modal.classList.add('hidden');
  });

  function initializeCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = ''; // Clear existing slots
    
    const days = ['Monday', 'Wednesday', 'Friday'];
    const times = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];
    
    // Load existing bookings
    const bookings = JSON.parse(localStorage.getItem('pickleballBookings') || '[]');
    
    days.forEach(day => {
      times.forEach(time => {
        const timeslot = document.createElement('div');
        timeslot.classList.add('timeslot');
        
        // Check if this slot is already booked
        const isBooked = bookings.some(booking => 
          booking.day === day && booking.time === time
        );
        
        if (isBooked) {
          const booking = bookings.find(b => b.day === day && b.time === time);
          timeslot.classList.add('booked');
          timeslot.innerHTML = `
            <strong>${time}</strong>
            <div class="booked-by">Booked by: ${booking.name}</div>
          `;
          timeslot.dataset.booked = "true";
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