let tasks = [];
        let currentFilter = 'all';
        let editingTaskId = null;

        const taskInput = document.getElementById('taskInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const dueDateInput = document.getElementById('dueDateInput');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const tasksContainer = document.getElementById('tasksContainer');
        const errorMessage = document.getElementById('errorMessage');
        const themeToggle = document.getElementById('themeToggle');
        const filterBtns = document.querySelectorAll('.filter-btn');

        function init() {
            loadTasksFromStorage();
            loadThemeFromStorage();
            renderTasks();
            attachEventListeners();
        }

        function attachEventListeners() {
            addTaskBtn.addEventListener('click', handleAddOrUpdateTask);
            
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleAddOrUpdateTask();
                }
            });
            
            themeToggle.addEventListener('click', toggleTheme);
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', handleFilterChange);
            });
            
            tasksContainer.addEventListener('click', handleTaskActions);
            tasksContainer.addEventListener('change', handleCheckboxChange);
        }

        function handleAddOrUpdateTask() {
            const title = taskInput.value.trim();
            const priority = prioritySelect.value;
            const dueDate = dueDateInput.value;
            
            if (!title) {
                showError();
                return;
            }
            
            hideError();
            
            if (editingTaskId) {
                updateTask(editingTaskId, title, priority, dueDate);
                editingTaskId = null;
                addTaskBtn.textContent = 'Add Task';
            } else {
                const task = createTask(title, priority, dueDate);
                tasks.push(task);
            }
            
            saveTasksToStorage();
            renderTasks();
            clearInputs();
        }

        function createTask(title, priority, dueDate) {
            return {
                id: Date.now().toString(),
                title: title,
                priority: priority,
                completed: false,
                dueDate: dueDate || null,
                createdAt: new Date().toISOString()
            };
        }

        function updateTask(id, title, priority, dueDate) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.title = title;
                task.priority = priority;
                task.dueDate = dueDate || null;
            }
        }

        function deleteTask(id) {
            const taskElement = document.querySelector(`[data-task-id="${id}"]`);
            
            if (taskElement) {
                taskElement.classList.add('fade-out');
                
                setTimeout(() => {
                    tasks = tasks.filter(task => task.id !== id);
                    saveTasksToStorage();
                    renderTasks();
                }, 300);
            }
        }

        function toggleTaskCompletion(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                saveTasksToStorage();
                renderTasks();
            }
        }

        function editTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                taskInput.value = task.title;
                prioritySelect.value = task.priority;
                dueDateInput.value = task.dueDate || '';
                editingTaskId = id;
                addTaskBtn.textContent = 'Update Task';
                taskInput.focus();
            }
        }

        function renderTasks() {
            tasksContainer.innerHTM
            const filteredTasks = getFilteredTasks();
            
            if (filteredTasks.length === 0) {
                showEmptyState();
                return;
            }
            
            filteredTasks.forEach(task => {
                const taskElement = createTaskElement(task);
                tasksContainer.appendChild(taskElement);
            });
        }

        function createTaskElement(task) {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item priority-${task.priority}`;
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskItem.dataset.taskId = task.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.dataset.action = 'toggle';
            
            const taskContent = document.createElement('div');
            taskContent.className = 'task-content';
            
            const title = document.createElement('h3');
            title.textContent = task.title;
            
            const taskMeta = document.createElement('div');
            taskMeta.className = 'task-meta';
            
            const priorityBadge = document.createElement('span');
            priorityBadge.className = `priority-badge priority-${task.priority}`;
            priorityBadge.textContent = task.priority;
            taskMeta.appendChild(priorityBadge);
            
            if (task.dueDate) {
                const dueDate = document.createElement('span');
                dueDate.textContent = `📅 ${formatDate(task.dueDate)}`;
                taskMeta.appendChild(dueDate);
            }
            
            taskContent.appendChild(title);
            taskContent.appendChild(taskMeta);
            
            const taskActions = document.createElement('div');
            taskActions.className = 'task-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = 'Edit';
            editBtn.dataset.action = 'edit';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.dataset.action = 'delete';
            
            taskActions.appendChild(editBtn);
            taskActions.appendChild(deleteBtn);
            
            taskItem.appendChild(checkbox);
            taskItem.appendChild(taskContent);
            taskItem.appendChild(taskActions);
            
            return taskItem;
        }

        function showEmptyState() {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            
            let message = '';
            switch(currentFilter) {
                case 'completed':
                    message = '🎯 No completed tasks yet. Keep going!';
                    break;
                case 'pending':
                    message = '✨ All tasks completed! Great job!';
                    break;
                case 'today':
                    message = '📅 No tasks due today.';
                    break;
                case 'high':
                case 'medium':
                case 'low':
                    message = `📊 No ${currentFilter} priority tasks.`;
                    break;
                default:
                    message = '📝 No tasks yet. Add your first task above!';
            }
            
            emptyDiv.textContent = message;
            tasksContainer.appendChild(emptyDiv);
        }

        function handleFilterChange(e) {
            const filter = e.target.dataset.filter;
            
            filterBtns.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = filter;
            renderTasks();
        }

        function getFilteredTasks() {
            switch(currentFilter) {
                case 'all':
                    return tasks;
                case 'completed':
                    return tasks.filter(task => task.completed);
                case 'pending':
                    return tasks.filter(task => !task.completed);
                case 'high':
                case 'medium':
                case 'low':
                    return tasks.filter(task => task.priority === currentFilter);
                case 'today':
                    return tasks.filter(task => isDueToday(task.dueDate));
                default:
                    return tasks;
            }
        }

        function handleTaskActions(e) {
            const action = e.target.dataset.action;
            if (!action) return;
            
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;
            
            const taskId = taskItem.dataset.taskId;
            
            switch(action) {
                case 'edit':
                    editTask(taskId);
                    break;
                case 'delete':
                    deleteTask(taskId);
                    break;
            }
        }

        function handleCheckboxChange(e) {
            if (e.target.classList.contains('task-checkbox')) {
                const taskItem = e.target.closest('.task-item');
                const taskId = taskItem.dataset.taskId;
                toggleTaskCompletion(taskId);
            }
        }

        function toggleTheme() {
            const body = document.body;
            const isLightMode = body.classList.toggle('light-mode');
            
            themeToggle.textContent = isLightMode ? '☀️ Light Mode' : '🌙 Dark Mode';
            
            localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
        }

        function loadThemeFromStorage() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light-mode');
                themeToggle.textContent = '☀️ Light Mode';
            }
        }

        function saveTasksToStorage() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        function loadTasksFromStorage() {
            const savedTasks = localStorage.getItem('tasks');
            if (savedTasks) {
                tasks = JSON.parse(savedTasks);
            }
        }

        function clearInputs() {
            taskInput.value = '';
            prioritySelect.value = 'medium';
            dueDateInput.value = '';
        }

        function showError() {
            errorMessage.classList.add('show');
            taskInput.style.borderColor = '#e74c3c';
        }

        function hideError() {
            errorMessage.classList.remove('show');
            taskInput.style.borderColor = '';
        }

        function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }

        function isDueToday(dateString) {
            if (!dateString) return false;
            const today = new Date();
            const dueDate = new Date(dateString);
            return today.toDateString() === dueDate.toDateString();
        }

        init();