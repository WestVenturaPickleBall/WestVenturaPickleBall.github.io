document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const homepage = document.getElementById('homepage');
  const calendarPage = document.getElementById('calendar-page');
  const bookNowBtn = document.getElementById('book-now-btn');
  const backToHomeBtn = document.getElementById('back-to-home');
  const prevWeekBtn = document.getElementById('prev-week');
  const nextWeekBtn = document.getElementById('next-week');
  const weekDisplay = document.getElementById('week-display');
  const calendarGrid = document.getElementById('calendar-grid');
  const bookingModal = document.getElementById('booking-modal');
  const closeModalBtn = document.querySelector('.close-modal');
  const bookingForm = document.getElementById('booking-form');
  const selectedTimeDisplay = document.getElementById('selected-time-display');
  const adminModal = document.getElementById('admin-modal');
  const viewBookingsBtn = document.getElementById('view-bookings-btn');
  const closeAdminModalBtn = document.querySelector('.close-admin-modal');
  const bookingsList = document.getElementById('bookings-list');

  // State
  let currentWeekOffset = 0;
  let selectedSlot = null;

  // Event Listeners
  bookNowBtn.addEventListener('click', function(e) {
    e.preventDefault();
    homepage.classList.add('hidden');
    calendarPage.classList.remove('hidden');
    renderCalendar();
  });

  backToHomeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    calendarPage.classList.add('hidden');
    homepage.classList.remove('hidden');
  });

  prevWeekBtn.addEventListener('click', function() {
    currentWeekOffset--;
    renderCalendar();
  });

  nextWeekBtn.addEventListener('click', function() {
    currentWeekOffset++;
    renderCalendar();
  });

  closeModalBtn.addEventListener('click', function() {
    bookingModal.classList.add('hidden');
  });

  viewBookingsBtn.addEventListener('click', function() {
    showAdminModal();
  });

  closeAdminModalBtn.addEventListener('click', function() {
    adminModal.classList.add('hidden');
  });

  bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    if (selectedSlot) {
      // Save booking
      const booking = {
        date: selectedSlot.dataset.date,
        day: selectedSlot.dataset.day,
        time: selectedSlot.dataset.time,
        name: name,
        email: email,
        timestamp: new Date().toISOString()
      };

      saveBooking(booking);
      
      // Update UI
      selectedSlot.classList.add('booked');
      selectedSlot.textContent = 'Booked';
      selectedSlot.removeEventListener('click', handleSlotClick);
      
      // Close modal
      bookingModal.classList.add('hidden');
      bookingForm.reset();
    }
  });

  // Calendar Functions
  function renderCalendar() {
    const startDate = getStartOfWeek(currentWeekOffset);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // +6 days for full week
    
    weekDisplay.textContent = `Week of ${formatDate(startDate)} to ${formatDate(endDate)}`;
    
    calendarGrid.innerHTML = '';
    createCalendarHeader();
    createTimeSlots(startDate);
  }

  function createCalendarHeader() {
    const headerRow = document.createElement('div');
    headerRow.className = 'calendar-header';
    headerRow.textContent = 'Time';
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const startDate = getStartOfWeek(currentWeekOffset);
    
    days.forEach(function(day, index) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-header';
      dayHeader.textContent = `${day} (${formatShortDate(date)})`;
      dayHeader.dataset.date = date.toISOString().split('T')[0];
      headerRow.appendChild(dayHeader);
    });
    
    calendarGrid.appendChild(headerRow);
  }

  function createTimeSlots(startDate) {
    const times = [];
    for (let hour = 9; hour <= 17; hour++) {
      times.push(`${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`);
    }

    times.forEach(function(time) {
      const timeRow = document.createElement('div');
      timeRow.className = 'calendar-time';
      timeRow.textContent = time;
      
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      days.forEach(function(day, index) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        const dateString = date.toISOString().split('T')[0];
        
        const slot = document.createElement('div');
        slot.className = 'calendar-slot';
        slot.dataset.date = dateString;
        slot.dataset.day = day;
        slot.dataset.time = time;
        
        // Check if slot is booked
        const booking = getBooking(dateString, time);
        if (booking) {
          slot.classList.add('booked');
          slot.textContent = 'Booked';
        } else {
          slot.addEventListener('click', handleSlotClick);
        }
        
        timeRow.appendChild(slot);
      });
      
      calendarGrid.appendChild(timeRow);
    });
  }

  function handleSlotClick() {
    selectedSlot = this;
    selectedTimeDisplay.textContent = `Selected: ${this.dataset.day}, ${formatDate(new Date(this.dataset.date))} at ${this.dataset.time}`;
    bookingModal.classList.remove('hidden');
  }

  // Admin Functions
  function showAdminModal() {
    const bookings = JSON.parse(localStorage.getItem('pickleballBookings')) || [];
    bookingsList.innerHTML = '';
    
    if (bookings.length === 0) {
      bookingsList.innerHTML = '<p>No bookings yet.</p>';
    } else {
      bookings.forEach(function(booking) {
        const bookingItem = document.createElement('div');
        bookingItem.className = 'booking-item';
        bookingItem.innerHTML = `
          <p><strong>${booking.day}</strong> - ${formatDate(new Date(booking.date))} at ${booking.time}</p>
          <p>Name: ${booking.name}</p>
          <p>Email: ${booking.email}</p>
        `;
        bookingsList.appendChild(bookingItem);
      });
    }
    
    adminModal.classList.remove('hidden');
  }

  // Storage Functions
  function saveBooking(booking) {
    const bookings = JSON.parse(localStorage.getItem('pickleballBookings')) || [];
    bookings.push(booking);
    localStorage.setItem('pickleballBookings', JSON.stringify(bookings));
  }

  function getBooking(date, time) {
    const bookings = JSON.parse(localStorage.getItem('pickleballBookings')) || [];
    return bookings.find(function(booking) {
      return booking.date === date && booking.time === time;
    });
  }

  // Utility Functions
  function getStartOfWeek(weekOffset = 0) {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const startDate = new Date(date.setDate(diff));
    startDate.setDate(startDate.getDate() + (weekOffset * 7));
    startDate.setHours(0, 0, 0, 0);
    return startDate;
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatShortDate(date) {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  }

  // Initialize
  renderCalendar();
});