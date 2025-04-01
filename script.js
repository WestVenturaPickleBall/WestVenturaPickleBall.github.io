document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const homepage = document.getElementById('homepage');
  const calendarPage = document.getElementById('calendar-page');
  const adminDashboard = document.getElementById('admin-dashboard');
  const ctaButton = document.querySelector('.cta-button');
  const backButton = document.querySelector('.back-button');
  const adminButton = document.querySelector('.admin-button');
  const logoutButton = document.getElementById('logout-button');
  const bookingModal = document.getElementById('booking-modal');
  const adminLoginModal = document.getElementById('admin-login');
  const closeModals = document.querySelectorAll('.close-modal');
  const selectedTimeText = document.getElementById('selected-time-text');
  const bookingForm = document.getElementById('booking-form');
  const loginForm = document.getElementById('login-form');
  const bookingsList = document.getElementById('bookings-list');
  const calendarGrid = document.getElementById('calendarGrid');

  // Sample data (in a real app, this would come from a database)
  let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  const adminCredentials = {
    email: "admin@westventurapickleball.com",
    password: "Pickleball123"
  };

  // Initialize the calendar
  function initCalendar() {
    calendarGrid.innerHTML = '';
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const startTime = 9; // 9 AM
    const endTime = 18; // 6 PM

    // Create time slots
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
        
        const timeString = `${day} at ${displayHour}:00 ${ampm}`;
        timeslot.dataset.day = day;
        timeslot.dataset.time = `${hour}:00`;
        
        // Check if this timeslot is already booked
        const isBooked = bookings.some(booking => 
          booking.day === day && booking.time === `${hour}:00`
        );
        
        if (isBooked) {
          timeslot.classList.add('booked');
          timeslot.textContent = 'Booked';
        } else {
          timeslot.classList.add('available');
          timeslot.textContent = 'Available';
          
          timeslot.addEventListener('click', function() {
            openBookingModal(day, hour);
          });
        }
        
        timeRow.appendChild(timeslot);
      });
      
      calendarGrid.appendChild(timeRow);
    }
  }

  // Open booking modal with selected time
  function openBookingModal(day, hour) {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    selectedTimeText.textContent = `Selected Time: ${day} at ${displayHour}:00 ${ampm}`;
    
    // Store the selected time in the form
    bookingForm.dataset.day = day;
    bookingForm.dataset.time = `${hour}:00`;
    
    bookingModal.classList.remove('hidden');
  }

  // Handle booking form submission
  bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const comments = document.getElementById('comments').value;
    const day = bookingForm.dataset.day;
    const time = bookingForm.dataset.time;
    
    // Create new booking
    const newBooking = {
      id: Date.now(),
      day,
      time,
      name,
      email,
      comments,
      bookedAt: new Date().toISOString()
    };
    
    // Add to bookings array and save to localStorage
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Reset form and close modal
    bookingForm.reset();
    bookingModal.classList.add('hidden');
    
    // Reinitialize calendar to show updated availability
    initCalendar();
    
    alert('Your booking has been confirmed!');
  });

  // Handle admin login
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    if (email === adminCredentials.email && password === adminCredentials.password) {
      // Successful login
      adminLoginModal.classList.add('hidden');
      homepage.classList.add('hidden');
      calendarPage.classList.add('hidden');
      adminDashboard.classList.remove('hidden');
      
      // Load bookings
      loadBookings();
    } else {
      alert('Invalid credentials. Please try again.');
    }
  });

  // Load bookings for admin
  function loadBookings() {
    bookingsList.innerHTML = '';
    
    // Add header
    const header = document.createElement('div');
    header.classList.add('booking-item', 'booking-header');
    header.innerHTML = `
      <div>Day</div>
      <div>Time</div>
      <div>Name</div>
      <div>Contact Info</div>
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
          <p>Email: ${booking.email}</p>
          ${booking.comments ? `<p>Comments: ${booking.comments}</p>` : ''}
          <small>Booked on: ${new Date(booking.bookedAt).toLocaleString()}</small>
        </div>
      `;
      bookingsList.appendChild(bookingItem);
    });
  }

  // Helper function to format time
  function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    const hourNum = parseInt(hour);
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${minute} ${ampm}`;
  }

  // Event listeners for navigation
  ctaButton.addEventListener('click', function (event) {
    event.preventDefault();
    homepage.classList.add('hidden');
    calendarPage.classList.remove('hidden');
    initCalendar();
  });

  backButton.addEventListener('click', function (event) {
    event.preventDefault();
    calendarPage.classList.add('hidden');
    adminDashboard.classList.add('hidden');
    homepage.classList.remove('hidden');
  });

  adminButton.addEventListener('click', function (event) {
    event.preventDefault();
    adminLoginModal.classList.remove('hidden');
  });

  logoutButton.addEventListener('click', function() {
    adminDashboard.classList.add('hidden');
    homepage.classList.remove('hidden');
    loginForm.reset();
  });

  // Close modals when clicking X
  closeModals.forEach(btn => {
    btn.addEventListener('click', function() {
      bookingModal.classList.add('hidden');
      adminLoginModal.classList.add('hidden');
    });
  });

  // Close modals when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === bookingModal) {
      bookingModal.classList.add('hidden');
    }
    if (event.target === adminLoginModal) {
      adminLoginModal.classList.add('hidden');
    }
  });

  // Initialize the calendar on first load
  initCalendar();
});