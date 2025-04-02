document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const homepage = document.getElementById('homepage');
  const calendarPage = document.getElementById('calendar-page');
  const adminDashboard = document.getElementById('admin-dashboard');
  const ctaButton = document.querySelector('.cta-button');
  const backButton = document.querySelector('.back-button');
  const adminButton = document.getElementById('admin-button');
  const logoutButton = document.getElementById('logout-button');
  const bookingModal = document.getElementById('booking-modal');
  const adminLoginModal = document.getElementById('admin-login');
  const closeModals = document.querySelectorAll('.close-modal');
  const selectedTimeText = document.getElementById('selected-time-text');
  const bookingForm = document.getElementById('booking-form');
  const loginForm = document.getElementById('login-form');
  const bookingsList = document.getElementById('bookings-list');
  const calendarGrid = document.getElementById('calendarGrid');
  const prevWeekBtn = document.getElementById('prev-week');
  const nextWeekBtn = document.getElementById('next-week');
  const weekDisplay = document.getElementById('week-display');

  // Initialize page states
  homepage.classList.remove('hidden');
  calendarPage.classList.add('hidden');
  adminDashboard.classList.add('hidden');
  bookingModal.classList.add('hidden');
  adminLoginModal.classList.add('hidden');

  // Sample data
  let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  const ADMIN_PASSWORD = "riley1";

  // Week navigation
  let currentWeekOffset = 0; // 0 = current week, 1 = next week, etc.

  // Initialize the calendar
  function initCalendar() {
    calendarGrid.innerHTML = '';
    
    // Calculate the start date of the current week
    const now = new Date();
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() + (currentWeekOffset * 7));
    const startDate = getMonday(currentDate);
    
    // Update week display
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4); // Show Monday-Friday
    
    // Format dates as "3/31 - 4/4" style
    const startDateFormatted = formatDisplayDate(startDate);
    const endDateFormatted = formatDisplayDate(endDate);
    
    let weekText = `Current Week: ${startDateFormatted} - ${endDateFormatted}`;
    if (currentWeekOffset < 0) {
      weekText = `Previous Week: ${startDateFormatted} - ${endDateFormatted}`;
    } else if (currentWeekOffset > 0) {
      weekText = `Next Week: ${startDateFormatted} - ${endDateFormatted}`;
    }
    
    weekDisplay.textContent = weekText;
    
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
      days.forEach((day, dayIndex) => {
        const timeslot = document.createElement('div');
        timeslot.classList.add('timeslot');
        
        // Calculate the actual date for this timeslot
        const slotDate = new Date(startDate);
        slotDate.setDate(startDate.getDate() + dayIndex);
        const dateString = formatDate(slotDate);
        
        // Check if this timeslot is already booked
        const isBooked = bookings.some(booking => 
          booking.day === day && 
          booking.time === `${hour}:00` && 
          booking.weekStart === getMondayString(startDate)
        );
        
        if (isBooked) {
          timeslot.classList.add('booked');
          timeslot.textContent = 'Booked';
        } else {
          timeslot.classList.add('available');
          timeslot.textContent = 'Available';
          
          timeslot.addEventListener('click', function() {
            openBookingModal(day, hour, dateString, getMondayString(startDate));
          });
        }
        
        timeRow.appendChild(timeslot);
      });
      
      calendarGrid.appendChild(timeRow);
    }
  }

  // Helper function to get Monday of a given week
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Helper function to get Monday as string
  function getMondayString(date) {
    return formatDate(getMonday(new Date(date)));
  }

  // Format date as YYYY-MM-DD
  function formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  // Format date for display (e.g., "3/31")
  function formatDisplayDate(dateString) {
    const options = { month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Open booking modal with selected time
  function openBookingModal(day, hour, dateString, weekStart) {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayDate = formatDisplayDate(dateString);
    selectedTimeText.textContent = `${day}, ${displayDate} at ${displayHour}:00 ${ampm}`;
    
    // Store the selected time in the form
    bookingForm.dataset.day = day;
    bookingForm.dataset.time = `${hour}:00`;
    bookingForm.dataset.date = dateString;
    bookingForm.dataset.weekStart = weekStart;
    bookingForm.dataset.displayDate = `${day}, ${displayDate}`;
    
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
    const date = bookingForm.dataset.date;
    const weekStart = bookingForm.dataset.weekStart;
    const displayDate = bookingForm.dataset.displayDate;
    
    // Create new booking
    const newBooking = {
      id: Date.now(),
      day,
      time,
      date,
      displayDate,
      weekStart,
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

  // Handle admin button click
  adminButton.addEventListener('click', function(e) {
    e.preventDefault();
    adminLoginModal.classList.remove('hidden');
  });

  // Handle admin login form submission
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_PASSWORD) {
      // Successful login
      adminLoginModal.classList.add('hidden');
      homepage.classList.add('hidden');
      calendarPage.classList.add('hidden');
      adminDashboard.classList.remove('hidden');
      
      // Load bookings
      loadBookings();
    } else {
      alert('Incorrect password. Please try again.');
    }
  });

  // Load bookings for admin
  function loadBookings() {
    bookingsList.innerHTML = '';
    
    if (bookings.length === 0) {
      bookingsList.innerHTML = '<p>No bookings have been made yet.</p>';
      return;
    }
    
    // Add header
    const header = document.createElement('div');
    header.classList.add('booking-item', 'booking-header');
    header.innerHTML = `
      <div>Date</div>
      <div>Time</div>
      <div>Name</div>
      <div>Contact Info</div>
    `;
    bookingsList.appendChild(header);
    
    // Sort bookings by date and time
    const sortedBookings = [...bookings].sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    
    // Add bookings
    sortedBookings.forEach(booking => {
      const bookingItem = document.createElement('div');
      bookingItem.classList.add('booking-item');
      bookingItem.innerHTML = `
        <div>${booking.displayDate}</div>
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
  // Testimonial rotation
function rotateTestimonials() {
  const testimonialContainer = document.querySelector('.testimonial-container');
  const slides = document.querySelectorAll('.testimonial-slide');
  let currentIndex = 0;
  
  // Show first slide
  slides[currentIndex].classList.add('active');
  
  // Rotate every 7 seconds
  setInterval(() => {
    slides[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add('active');
  }, 7000);
}

// Call this function at the end of your DOMContentLoaded event listener
rotateTestimonials();
  // Helper function to format time
  function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    const hourNum = parseInt(hour);
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    return `${displayHour}:00 ${ampm}`;
  }

  // Week navigation handlers
  prevWeekBtn.addEventListener('click', function() {
    currentWeekOffset--;
    initCalendar();
  });

  nextWeekBtn.addEventListener('click', function() {
    currentWeekOffset++;
    initCalendar();
  });

  // Event listeners for navigation
  ctaButton.addEventListener('click', function (event) {
    event.preventDefault();
    currentWeekOffset = 0; // Reset to current week
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

  // Logout button
  logoutButton.addEventListener('click', function() {
    adminDashboard.classList.add('hidden');
    homepage.classList.remove('hidden');
    loginForm.reset();
  });

  // Initialize the calendar on first load
  initCalendar();
});