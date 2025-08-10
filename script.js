// Elements
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const subjectSelect = document.getElementById('subjectSelect');
const statusSelect = document.getElementById('statusSelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskListEl = document.getElementById('taskList');
const filterSubject = document.getElementById('filterSubject');
const filterStatus = document.getElementById('filterStatus');
const calendarEl = document.getElementById('calendar');
const musicBtn = document.getElementById('musicToggleBtn');
const rainAudio = document.getElementById('rainAudio');

let isPlaying = false;

// Music toggle
musicBtn.addEventListener('click', () => {
  if (isPlaying) {
    rainAudio.pause();
    musicBtn.textContent = 'Play Rainy Café Music 🧸';
    musicBtn.setAttribute('aria-pressed', 'false');
  } else {
    rainAudio.play();
    musicBtn.textContent = 'Pause Music 🧸';
    musicBtn.setAttribute('aria-pressed', 'true');
  }
  isPlaying = !isPlaying;
});

// Status labels & classes
const stateLabels = {
  pending: '🟥 Pending',
  progress: '🟨 In Progress',
  completed: '✅ Completed'
};

const stateColors = {
  pending: 'status-pending',
  progress: 'status-progress',
  completed: 'status-completed'
};

// Load tasks from localStorage
function getTasks() {
  return JSON.parse(localStorage.getItem('kuma-tasks')) || [];
}

// Save tasks to localStorage
function saveTasks(tasks) {
  localStorage.setItem('kuma-tasks', JSON.stringify(tasks));
}

// Add new task
addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const subject = subjectSelect.value;
  const status = statusSelect.value;

  if (!text) {
    alert('Please enter a task description.');
    return;
  }
  if (!dueDate) {
    alert('Please select a due date.');
    return;
  }

  const tasks = getTasks();
  tasks.push({ text, dueDate, subject, status });
  saveTasks(tasks);
  taskInput.value = '';
  dueDateInput.value = '';
  renderAll();
});

// Update status
function updateTaskStatus(index, newStatus) {
  const tasks = getTasks();
  tasks[index].status = newStatus;
  saveTasks(tasks);
  renderAll();
}

// Delete task
function deleteTask(index) {
  if (!confirm('Delete this task?')) return;
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderAll();
}

// Render task list
function renderTasks() {
  const tasks = getTasks();
  taskListEl.innerHTML = '';

  const filtered = tasks.filter(t => {
    return (
      (filterSubject.value === '' || t.subject === filterSubject.value) &&
      (filterStatus.value === '' || t.status === filterStatus.value)
    );
  });

  if (filtered.length === 0) {
    taskListEl.innerHTML = '<li>No tasks found.</li>';
    return;
  }

  filtered.forEach((task, index) => {
    const li = document.createElement('li');
    li.classList.add(stateColors[task.status]);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'task-info';

    const subjectSpan = document.createElement('span');
    subjectSpan.className = 'task-subject';
    subjectSpan.textContent = subjectEmoji(task.subject) + ' ' + capitalize(task.subject);

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    const dueSpan = document.createElement('div');
    dueSpan.className = 'due-date';
    dueSpan.textContent = 'Due: ' + formatDate(task.dueDate);

    const statusSpan = document.createElement('div');
    statusSpan.className = 'task-status';
    statusSpan.textContent = stateLabels[task.status];

    infoDiv.appendChild(subjectSpan);
    infoDiv.appendChild(textSpan);
    infoDiv.appendChild(dueSpan);
    infoDiv.appendChild(statusSpan);

    li.appendChild(infoDiv);

    const btnDiv = document.createElement('div');
    btnDiv.className = 'status-buttons';

    ['pending', 'progress', 'completed'].forEach(status => {
      const btn = document.createElement('button');
      btn.textContent = stateLabels[status];
      btn.className = status;
      if (task.status === status) btn.disabled = true;
      btn.title = 'Set status to ' + statusLabels(status);
      btn.addEventListener('click', () => updateTaskStatus(index, status));
      btnDiv.appendChild(btn);
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️ Delete';
    delBtn.title = 'Delete task';
    delBtn.style.backgroundColor = '#f28b82';
    delBtn.style.color = 'white';
    delBtn.addEventListener('click', () => deleteTask(index));
    btnDiv.appendChild(delBtn);

    li.appendChild(btnDiv);
    taskListEl.appendChild(li);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function statusLabels(status) {
  if (status === 'pending') return 'Pending';
  if (status === 'progress') return 'In Progress';
  if (status === 'completed') return 'Completed';
  return status;
}

function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const dateObj = new Date(dateStr + 'T00:00:00');
  return dateObj.toLocaleDateString(undefined, options);
}

function subjectEmoji(subject) {
  const map = {
    math: '🧮',
    science: '🔬',
    english: '📖',
    chinese: '🇨🇳',
    others: '🗂️',
    art: '🎨',
    music: '🎵',
    geography: '🗺️',
    history: '📜',
    literature: '📚'
  };
  return map[subject] || '❓';
}

// Render calendar
function renderCalendar() {
  calendarEl.innerHTML = '';

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(day => {
    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = day;
    calendarEl.appendChild(header);
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    calendarEl.appendChild(blank);
  }

  const tasks = getTasks();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayDiv = document.createElement('div');
    dayDiv.textContent = day;

    if (
      day === now.getDate() &&
      month === now.getMonth() &&
      year === now.getFullYear()
    ) {
      dayDiv.classList.add('today');
    }

    const tasksDue = tasks.filter(t => t.dueDate === dateStr);
    if (tasksDue.length) {
      const dot = document.createElement('div');
      dot.className = 'due-dot';
      dayDiv.appendChild(dot);

      dayDiv.title = tasksDue
        .map(t => `${subjectEmoji(t.subject)} ${t.text} [${statusLabels(t.status)}]`)
        .join('\n');
    }

    calendarEl.appendChild(dayDiv);
  }
}

// Render everything
function renderAll() {
  renderTasks();
  renderCalendar();
}

// Filters
filterSubject.addEventListener('change', renderTasks);
filterStatus.addEventListener('change', renderTasks);

// Initial render
renderAll();
