
document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation: open/close menu and close it after selecting a page.
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = '☰';
    }));
  }

  // Academic planner: array-based task management with localStorage persistence.
  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    const storageKey = 'mivaPortfolioAcademicTasks';
    let tasks = loadTasks();
    const list = document.getElementById('task-list');
    const emptyStateText = 'No tasks yet. Add your first academic task.';

    function loadTasks() {
      try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
      catch (error) { return []; }
    }
    function saveTasks() { localStorage.setItem(storageKey, JSON.stringify(tasks)); }
    function updateStats() {
      const completed = tasks.filter(task => task.completed).length;
      const pending = tasks.length - completed;
      const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
      document.getElementById('total-count').textContent = tasks.length;
      document.getElementById('completed-count').textContent = completed;
      document.getElementById('pending-count').textContent = pending;
      document.getElementById('progress-percent').textContent = progress + '%';
      document.getElementById('progress-fill').style.width = progress + '%';
    }
    function renderTasks() {
      list.innerHTML = '';
      if (!tasks.length) {
        const empty = document.createElement('p');
        empty.id = 'empty-state'; empty.textContent = emptyStateText; list.appendChild(empty);
      }
      tasks.sort((a,b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
      tasks.forEach(task => {
        const item = document.createElement('article');
        item.className = 'task-item' + (task.completed ? ' completed' : '');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox'; checkbox.className = 'task-check'; checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', 'Mark ' + task.description + ' as completed');
        checkbox.addEventListener('change', () => toggleTask(task.id));
        const content = document.createElement('div');
        const name = document.createElement('strong'); name.className = 'task-name'; name.textContent = task.description;
        const meta = document.createElement('div'); meta.className = 'task-meta';
        const date = document.createElement('span'); date.textContent = task.dueDate ? 'Due: ' + task.dueDate : 'No due date';
        const priority = document.createElement('span'); priority.className = 'priority ' + task.priority.toLowerCase(); priority.textContent = task.priority + ' Priority';
        meta.append(date, priority); content.append(name, meta);
        const actions = document.createElement('div'); actions.className = 'task-actions';
        const statusButton = document.createElement('button'); statusButton.type = 'button'; statusButton.className = 'icon-btn'; statusButton.textContent = task.completed ? 'Undo' : 'Mark Done';
        statusButton.addEventListener('click', () => toggleTask(task.id));
        const deleteButton = document.createElement('button'); deleteButton.type = 'button'; deleteButton.className = 'icon-btn delete'; deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('aria-label', 'Delete ' + task.description);
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        actions.append(statusButton, deleteButton); item.append(checkbox, content, actions); list.appendChild(item);
      });
      updateStats();
    }
    function toggleTask(id) {
      tasks = tasks.map(task => task.id === id ? {...task, completed: !task.completed} : task);
      saveTasks(); renderTasks();
    }
    function deleteTask(id) { tasks = tasks.filter(task => task.id !== id); saveTasks(); renderTasks(); }
    taskForm.addEventListener('submit', event => {
      event.preventDefault();
      const description = document.getElementById('task-description').value.trim();
      const dueDate = document.getElementById('task-date').value;
      const priority = document.getElementById('task-priority').value;
      const feedback = document.getElementById('task-feedback');
      if (!description || !dueDate) { feedback.textContent = 'Please enter a task description and due date.'; feedback.style.color = '#b52626'; return; }
      tasks.push({id: Date.now().toString(), description, dueDate, priority, completed: false});
      saveTasks(); renderTasks(); taskForm.reset();
      feedback.textContent = 'Task added successfully.'; feedback.style.color = '#16804b';
    });
    document.getElementById('clear-tasks').addEventListener('click', () => {
      if (tasks.length && window.confirm('Delete all academic tasks?')) { tasks = []; saveTasks(); renderTasks(); }
    });
    renderTasks();
  }
