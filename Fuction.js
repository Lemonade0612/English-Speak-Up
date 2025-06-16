document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('speakUpForm');
  const tableBody = document.getElementById('tableBody');
  const dateInput = document.getElementById('day');
  const weekDisplay = document.getElementById('weekDisplay');

  function saveTableData() {
    const data = [];
    for (const row of tableBody.rows) {
      if (row.classList.contains('week-end-row')) continue;
      const cells = row.querySelectorAll('td');
      data.push({
        week: cells[0].textContent,
        day: cells[1].getAttribute('data-date'),
        tutor: cells[2].textContent,
        topic: cells[3].textContent,
        activities: cells[4].textContent,
        attendees: cells[5].textContent,
      });
    }
    localStorage.setItem('speakUpData', JSON.stringify(data));
  }

  function updateAllDayLabels(dateStr, label) {
    const rows = tableBody.querySelectorAll(`td[data-date="${dateStr}"]`);
    rows.forEach(cell => {
      cell.textContent = label;
    });
  }

  function insertRow(week, dayLabel, dateStr, tutor, topic, activities, attendees) {
    const lastRow = tableBody.lastElementChild;
    const lastWeek = lastRow ? lastRow.cells[0]?.textContent?.trim() : null;

    if (lastWeek && lastWeek !== week) {
      const weekEndRow = document.createElement('tr');
      weekEndRow.classList.add('week-end-row');
      weekEndRow.innerHTML = `<td colspan="7" class="week-end-label">End of ${lastWeek}</td>`;
      tableBody.appendChild(weekEndRow);
    }

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${week}</td>
      <td data-date="${dateStr}">${dayLabel}</td>
      <td>${tutor}</td>
      <td>${topic}</td>
      <td>${activities}</td>
      <td>${attendees}</td>
      <td>
        <button class="action-btn edit-btn">Edit</button>
        <button class="action-btn delete-btn">Delete</button>
      </td>
    `;
    tableBody.appendChild(newRow);
    updateAllDayLabels(dateStr, dayLabel);
    saveTableData();
  }

  function loadTableData() {
    const saved = localStorage.getItem('speakUpData');
    if (!saved) return;
    const rows = JSON.parse(saved);
    for (const item of rows) {
      const dateObj = new Date(item.day);
      const options = { weekday: 'long' };
      const weekdayText = dateObj.toLocaleDateString('en-US', options);
      const fullLabel = `${weekdayText} ${item.day}`;
      insertRow(item.week, fullLabel, item.day, item.tutor, item.topic, item.activities, item.attendees);
    }
  }

  loadTableData();

  dateInput.addEventListener('change', function () {
    const selectedDate = new Date(this.value);
    const dayOfWeek = selectedDate.getDay();

    if ([0, 1, 6].includes(dayOfWeek)) {
      weekDisplay.textContent = "No class on Monday, Saturday or Sunday!";
      this.value = "";
      return;
    }

    const startDate = new Date("2025-06-24");
    const diffInTime = selectedDate.getTime() - startDate.getTime();
    const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
    const weekNumber = Math.floor(diffInDays / 7) + 1;
    weekDisplay.textContent = `Week ${weekNumber}`;
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const week = weekDisplay.textContent.trim();
    if (week.startsWith("No class")) return;

    const dateStr = dateInput.value;
    const dateObj = new Date(dateStr);
    const options = { weekday: 'long' };
    const weekdayText = dateObj.toLocaleDateString('en-US', options);
    const dayLabel = `${weekdayText} ${dateStr}`;

    const tutor = document.getElementById('tutor').value.trim();
    const topic = document.getElementById('topic').value;
    const activities = document.getElementById('activities').value;
    const attendees = document.getElementById('attendees').value;

    let existingRow = null;
    for (const row of tableBody.rows) {
      const weekCell = row.cells[0].textContent.trim();
      const tutorCell = row.cells[2].textContent.trim();
      const dateAttr = row.cells[1].getAttribute('data-date');
      if (weekCell === week && tutorCell === tutor && dateAttr === dateStr) {
        existingRow = row;
        break;
      }
    }

    if (existingRow) {
      existingRow.cells[3].textContent = topic;
      existingRow.cells[4].textContent = activities;
      existingRow.cells[5].textContent = attendees;
    } else {
      insertRow(week, dayLabel, dateStr, tutor, topic, activities, attendees);
    }

    form.reset();
    weekDisplay.textContent = "Week 1";
  });

  tableBody.addEventListener('click', function (event) {
    const row = event.target.closest('tr');
    if (event.target.classList.contains('delete-btn')) {
      row.remove();
      saveTableData();
    }
    if (event.target.classList.contains('edit-btn')) {
      weekDisplay.textContent = row.cells[0].textContent;
      dateInput.value = row.cells[1].getAttribute('data-date');
      document.getElementById('tutor').value = row.cells[2].textContent;
      document.getElementById('topic').value = row.cells[3].textContent;
      document.getElementById('activities').value = row.cells[4].textContent;
      document.getElementById('attendees').value = row.cells[5].textContent;
      row.remove();
      saveTableData();
    }
  });
});
