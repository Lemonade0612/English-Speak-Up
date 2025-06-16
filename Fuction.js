document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('speakUpForm');
  const tableBody = document.getElementById('tableBody');
  const dateInput = document.getElementById('day');
  const weekDisplay = document.getElementById('weekDisplay');

  const weekRanges = [
    { week: "Week 1", start: "2025-06-24", end: "2025-06-27" },
    { week: "Week 2", start: "2025-07-01", end: "2025-07-04" },
    { week: "Week 3", start: "2025-07-08", end: "2025-07-11" },
    { week: "Week 4", start: "2025-07-15", end: "2025-07-18" },
    { week: "Week 5", start: "2025-07-22", end: "2025-07-25" },
    { week: "Week 6", start: "2025-07-29", end: "2025-07-31" },
  ];

  function getCurrentWeek() {
    const now = new Date();
    return weekRanges.find(w => new Date(w.start) <= now && now <= new Date(w.end));
  }

  function getWeekByDate(dateStr) {
    const date = new Date(dateStr);
    return weekRanges.find(w => new Date(w.start) <= date && date <= new Date(w.end));
  }

  function saveTableData() {
    const data = [];
    for (const row of tableBody.rows) {
      if (row.classList.contains('week-end-row')) continue;
      const cells = row.querySelectorAll('td');
      data.push({
        week: cells[0].textContent,
        day: cells[1].textContent,
        tutor: cells[2].textContent,
        topic: cells[3].textContent,
        activities: cells[4].textContent,
        attendees: cells[5].textContent,
      });
    }
    localStorage.setItem('speakUpData', JSON.stringify(data));
  }

  function insertRow(week, day, tutor, topic, activities, attendees) {
    // Remove existing "End of Week X" row
    Array.from(tableBody.children).forEach(row => {
      if (row.classList.contains('week-end-row') && row.textContent.includes(week)) {
        row.remove();
      }
    });

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${week}</td>
      <td>${day}</td>
      <td>${tutor}</td>
      <td>${topic}</td>
      <td>${activities}</td>
      <td>${attendees}</td>
      <td>
        <button class="action-btn edit-btn">Edit</button>
        <button class="action-btn delete-btn">Delete</button>
      </td>
    `;

    const rows = Array.from(tableBody.querySelectorAll('tr:not(.week-end-row)'));
    rows.push(newRow);
    rows.sort((a, b) => new Date(a.cells[1].textContent) - new Date(b.cells[1].textContent));

    tableBody.innerHTML = '';
    for (const row of rows) {
      tableBody.appendChild(row);
    }

    const weekEndRow = document.createElement('tr');
    weekEndRow.classList.add('week-end-row');
    weekEndRow.innerHTML = `<td colspan="7" class="week-end-label">End of ${week}</td>`;
    tableBody.appendChild(weekEndRow);

    saveTableData();
  }

  function loadTableData() {
    const saved = localStorage.getItem('speakUpData');
    if (!saved) return;
    const rows = JSON.parse(saved);
    rows.forEach(item => insertRow(item.week, item.day, item.tutor, item.topic, item.activities, item.attendees));
  }

  loadTableData();

  dateInput.addEventListener('change', function () {
    const selectedDate = this.value;
    const weekInfo = getWeekByDate(selectedDate);

    const dayOfWeek = new Date(selectedDate).getDay();
    if ([0, 1, 6].includes(dayOfWeek)) {
      weekDisplay.textContent = "No class on Monday, Saturday or Sunday!";
      this.value = "";
      return;
    }

    if (weekInfo) {
      weekDisplay.textContent = weekInfo.week;
    } else {
      weekDisplay.textContent = "Date not in schedule";
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const currentWeek = getCurrentWeek();
    const selectedWeek = getWeekByDate(dateInput.value);
    if (!selectedWeek || !currentWeek || selectedWeek.week !== currentWeek.week) {
      alert(`You can only insert data for ${currentWeek ? currentWeek.week : 'this week'}!`);
      return;
    }

    const week = weekDisplay.textContent.trim();
    const dateObj = new Date(dateInput.value);
    const options = { weekday: 'long' };
    const weekdayText = dateObj.toLocaleDateString('en-US', options);
    const day = `${dateInput.value} (${weekdayText})`;
    const tutor = document.getElementById('tutor').value.trim();
    const topic = document.getElementById('topic').value;
    const activities = document.getElementById('activities').value;
    const attendees = document.getElementById('attendees').value;

    let existingRow = null;
    for (const row of tableBody.rows) {
      const weekCell = row.cells[0]?.textContent?.trim();
      const tutorCell = row.cells[2]?.textContent?.trim();
      if (weekCell === week && tutorCell === tutor) {
        existingRow = row;
        break;
      }
    }

    if (existingRow) {
      existingRow.cells[1].textContent = day;
      existingRow.cells[3].textContent = topic;
      existingRow.cells[4].textContent = activities;
      existingRow.cells[5].textContent = attendees;
    } else {
      insertRow(week, day, tutor, topic, activities, attendees);
    }

    form.reset();
    weekDisplay.textContent = currentWeek ? currentWeek.week : "Week 1";
  });

  tableBody.addEventListener('click', function (event) {
    const row = event.target.closest('tr');
    if (event.target.classList.contains('delete-btn')) {
      row.remove();
      saveTableData();
    }
    if (event.target.classList.contains('edit-btn')) {
      weekDisplay.textContent = row.cells[0].textContent;
      dateInput.value = row.cells[1].textContent;
      document.getElementById('tutor').value = row.cells[2].textContent;
      document.getElementById('topic').value = row.cells[3].textContent;
      document.getElementById('activities').value = row.cells[4].textContent;
      document.getElementById('attendees').value = row.cells[5].textContent;
      row.remove();
      saveTableData();
    }
  });
});