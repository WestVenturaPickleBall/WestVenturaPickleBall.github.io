document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const homepage = document.getElementById('homepage');
  const calendarPage = document.getElementById('calendar-page');
  const adminDashboard = document.getElementById('admin-dashboard');
  const ctaButton = document.querySelector('.cta-button');
  const backButton = document.querySelector('.back-button');
  const adminButton = document.getElementById('admin-button'); // Changed to getElementById
  const logoutButton = document.getElementById('logout-button');
  const bookingModal = document.getElementById('booking-modal');
  const adminLoginModal = document.getElementById('admin-login');
  const closeModals = document.querySelectorAll('.close-modal');
  const selectedTimeText = document.getElementById('selected-time-text');
  const bookingForm = document.getElementById('booking-form');
  const loginForm = document.getElementById('login-form');
  const bookingsList = document.getElementById('bookings-list');
  const calendarGrid = document.getElementById('calendarGrid');

  // Initialize page states
  homepage.classList.remove('hidden');
  calendarPage.classList.add('hidden');
  adminDashboard.classList.add('hidden');
  bookingModal.classList.add('hidden');
  adminLoginModal.classList.add('hidden');

  // Sample data
  let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  const ADMIN_PASSWORD = "riley1";

  // Initialize the calendar
  function initCalendar() {
    calendarGrid.innerHTML = '';
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const startTime = 9; // 9 AM
    const endTime = 18; // 6 PM

    for (let hour = startTime; hour < endTime; hour++) {
      const timeRow = document.createElement('div');
      timeRow.classList.add('time-row');
      
      // Add time label
      const timeLabel = document.createElement('div');
      timeLabel.classList.add('time-label');
      const displayHour = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      timeLabel.textContent = `${displayHour}:00 ${ampm}`;
      timeRow.appendChild(timeLabel);
      
      // Add timeslots for each day
      days.forEach(day => {
        const timeslot = document.createElement('div');
        timeslot.classList.add('timeslot');
        
        const isBooked = bookings.some(booking => 
          booking.day === day && booking.time === `${hour}:00`
        );
        
        if (isBooked) {
          timeslot.classList.add('booked');
          timeslot.textContent = 'Booked';
        } else {
          timeslot.classList.add('available');
          timeslot.textContent = 'Available';
          timeslot.addEventListener('click', () => openBookingModal(day, hour));
        }
        
        timeRow.appendChild(timeslot);
      });
      
      calendarGrid.appendChild(timeRow);
    }
  }

  // Open booking modal
  function openBookingModal(day, hour) {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    selectedTimeText.textContent = `Selected Time: ${day} at ${displayHour}:00 ${ampm}`;
    bookingForm.dataset.day = day;
    bookingForm.dataset.time = `${hour}:00`;
    bookingModal.classList.remove('hidden');
  }

  // Handle booking form
  bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newBooking = {
      id: Date.now(),
      day: bookingForm.dataset.day,
      time: bookingForm.dataset.time,
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      comments: document.getElementById('comments').value,
      bookedAt: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    bookingForm.reset();
    bookingModal.classList.add('hidden');
    initCalendar();
    alert('Booking confirmed!');
  });

  // ADMIN FUNCTIONALITY
  // Handle admin button click
  adminButton.addEventListener('click', function(e) {
    e.preventDefault();
    adminLoginModal.classList.remove('hidden');
  });

  // Handle admin login
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_PASSWORD) {
      adminLoginModal.classList.add('hidden');
      homepage.classList.add('hidden');
      calendarPage.classList.add('hidden');
      adminDashboard.classList.remove('hidden');
      loadBookings();
    } else {
      alert('Incorrect password.');
    }
  });

  // Load bookings for admin
  function loadBookings() {
    bookingsList.innerHTML = '';
    
    if (bookings.length === 0) {
      bookingsList.innerHTML = '<p>No bookings yet</p>';
      return;
    }
    
    // Create header
    const header = document.createElement('div');
    header.classList.add('booking-item', 'booking-header');
    header.innerHTML = `
      <div>Day</div>
      <div>Time</div>
      <div>Name</div>
      <div>Contact</div>
    `;
    bookingsList.appendChild(header);
    
    // Add bookings
    bookings.forEach(booking => {
      const bookingItem = document.createElement('div');
      bookingItem.classList.add('booking-item');
      bookingItem.innerHTML = `
        <div>${booking.day}</div>
        <div>${formatTime(booking.time)}</div>
        <div>${booking.name}</div>
        <div>
          <p>${booking.email}</p>
          ${booking.comments ? `<p>${booking.comments}</p>` : ''}
        </div>
      `;
      bookingsList.appendChild(bookingItem);
    });
  }

  // Helper function
  function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    const hourNum = parseInt(hour);
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    return `${displayHour}:00 ${ampm}`;
  }

  // Navigation
  ctaButton.addEventListener('click', function(e) {
    e.preventDefault();
    homepage.classList.add('hidden');
    calendarPage.classList.remove('hidden');
    initCalendar();
  });

  backButton.addEventListener('click', function(e) {
    e.preventDefault();
    calendarPage.classList.add('hidden');
    adminDashboard.classList.add('hidden');
    homepage.classList.remove('hidden');
  });

  // Close modals
  closeModals.forEach(btn => {
    btn.addEventListener('click', function() {
      bookingModal.classList.add('hidden');
      adminLoginModal.classList.add('hidden');
    });
  });

  window.addEventListener('click', function(e) {
    if (e.target === bookingModal) bookingModal.classList.add('hidden');
    if (e.target === adminLoginModal) adminLoginModal.classList.add('hidden');
  });

  // Logout
  logoutButton.addEventListener('click', function() {
    adminDashboard.classList.add('hidden');
    homepage.classList.remove('hidden');
    document.getElementById('admin-password').value = '';
  });

  // Initialize
  initCalendar();
});