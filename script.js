document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const homepage = document.getElementById('homepage');
  const calendarPage = document.getElementById('calendar-page');
  const ctaButton = document.querySelector('.cta-button');
  const backButton = document.querySelector('.back-button');
  const prevWeekBtn = document.getElementById('prev-week');
  const nextWeekBtn = document.getElementById('next-week');
  const weekDisplay = document.getElementById('week-display');
  const modal = document.getElementById('booking-modal');
  const closeModal = document.querySelector('.close-modal');
  const bookingForm = document.getElementById('booking-form');
  const selectedTimeDisplay = document.getElementById('selected-time-display');
  const calendarGrid = document.getElementById('calendar-grid');
  const adminBtn = document.getElementById('admin-btn');
  const adminModal = document.getElementById('admin-modal');
  const closeAdminModal = document.querySelector('.close-admin-modal');
  const bookingsList = document.getElementById('bookings-list');

  let selectedTimeSlot = null;
  let currentWeekOffset = 0;

  // Initialize
  modal.classList.add('hidden');
  adminModal.classList.add('hidden');

  // Event Listeners
  ctaButton.addEventListener('click', showCalendarPage);
  backButton.addEventListener('click', showHomepage);
  prevWeekBtn.addEventListener('click', () => { currentWeekOffset--; renderCalendar(); });
  nextWeekBtn.addEventListener('click', () => { currentWeekOffset++; renderCalendar(); });
  closeModal.addEventListener('click', () => modal.classList.add('hidden'));
  bookingForm.addEventListener('submit', handleBookingSubmit);
  adminBtn.addEventListener('click', showAdminModal);
  closeAdminModal.addEventListener('click', () => adminModal.classList.add('hidden'));

  // Functions
  function showCalendarPage() {
    homepage.classList.add('hidden');
    calendarPage.classList.remove('hidden');
    renderCalendar();
  }

  function showHomepage() {
    calendarPage.classList.add('hidden');
    homepage.classList.remove('hidden');
  }

  function renderCalendar() {
    const startDate = getStartOfWeek(currentWeekOffset);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    
    weekDisplay.textContent = `Week of ${formatDate(startDate)} to ${formatDate(new Date(endDate.setDate(endDate.getDate() - 1))}`;
    
    calendarGrid.innerHTML = '';
    createCalendarHeader();
    createTimeSlots(startDate);
  }

  function createCalendarHeader() {
    const headerRow = document.createElement('div');
    headerRow.className = 'calendar-header-row';
    
    // Empty cell for time column
    headerRow.appendChild(createHeaderCell('Time'));
    
    // Create day headers (Monday-Sunday)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const startDate = getStartOfWeek(currentWeekOffset);
    
    days.forEach((day, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      headerRow.appendChild(createHeaderCell(`${day}<br>${formatShortDate(date)}`));
    });
    
    calendarGrid.appendChild(headerRow);
  }

  function createHeaderCell(content) {
    const cell = document.createElement('div');
    cell.className = 'calendar-header-cell';
    cell.innerHTML = content;
    return cell;
  }

  function createTimeSlots(startDate) {
    const times = [];
    // Generate times from 9AM to 5PM hourly
    for (let hour = 9; hour <= 17; hour++) {
      times.push(`${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`);
    }

    times.forEach(time => {
      const timeRow = document.createElement('div');
      timeRow.className = 'calendar-time-row';
      
      // Time label cell
      const timeCell = document.createElement('div');
      timeCell.className = 'calendar-time-cell';
      timeCell.textContent = time;
      timeRow.appendChild(timeCell);
      
      // Create cells for each day
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      days.forEach((day, dayIndex) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + dayIndex);
        const dateString = date.toISOString().split('T')[0];
        
        const slot = document.createElement('div');
        slot.className = 'calendar-slot';
        slot.dataset.date = dateString;
        slot.dataset.time = time;
        slot.dataset.day = day;
        
        // Check if slot is booked
        const booking = getBooking(dateString, time);
        if (booking) {
          slot.classList.add('booked');
          slot.dataset.name = booking.name;
          slot.dataset.email = booking.email;
          slot.innerHTML = `<span class="booked-indicator">Booked</span>`;
        } else {
          slot.addEventListener('click', () => openBookingModal(slot));
        }
        
        timeRow.appendChild(slot);
      });
      
      calendarGrid.appendChild(timeRow);
    });
  }

  function openBookingModal(slot) {
    selectedTimeSlot = slot;
    selectedTimeDisplay.textContent = `${slot.dataset.day}, ${formatDate(new Date(slot.dataset.date))} at ${slot.dataset.time}`;
    modal.classList.remove('hidden');
  }

  function handleBookingSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    if (selectedTimeSlot) {
    
      selectedTimeSlot.classList.add('booked');
      selectedTimeSlot.innerHTML = `<span class="booked-indicator">Booked</span>`;
      selectedTimeSlot.dataset.name = name;
      selectedTimeSlot.dataset.email = email;
      
      saveBooking({
        date: selectedTimeSlot.dataset.date,
        time: selectedTimeSlot.dataset.time,
        day: selectedTimeSlot.dataset.day,
        name: name,
        email: email,
        timestamp: new Date().toISOString()
      });
    }
    
    bookingForm.reset();
    modal.classList.add('hidden');
  }

  function showAdminModal() {
    const bookings = JSON.parse(localStorage.getItem('pickleballBookings') || [];
    bookingsList.innerHTML = '';
    
    if (bookings.length === 0) {
      bookingsList.innerHTML = '<p>No bookings yet.</p>';
    } else {
      bookings.forEach(booking => {
        const bookingItem = document.createElement('div');
        bookingItem.className = 'booking-item';
        bookingItem.innerHTML = `
          <p><strong>${booking.day}</strong> - ${formatDate(new Date(booking.date))} at ${booking.time}</p>
          <p>Name: ${booking.name}</p>
          <p>Email: ${booking.email}</p>
          <hr>
        `;
        bookingsList.appendChild(bookingItem);
      });
    }
    
    adminModal.classList.remove('hidden');
  }

  // Helper functions
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

  function saveBooking(booking) {
    const bookings = JSON.parse(localStorage.getItem('pickleballBookings') || [];
    bookings.push(booking);
    localStorage.setItem('pickleballBookings', JSON.stringify(bookings));
  }

  function getBooking(date, time) {
    const bookings = JSON.parse(localStorage.getItem('pickleballBookings') || []);
    return bookings.find(b => b.date === date && b.time === time);
  }

  // Initialize
  renderCalendar();
});