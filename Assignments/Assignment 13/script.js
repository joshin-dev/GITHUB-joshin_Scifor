class TaskManager {
    constructor() {
        this.tasks = [];
        this.taskIdCounter = 1;
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
    }

    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (taskText === '') {
            this.taskInput.focus();
            return;
        }

        const task = {
            id: this.taskIdCounter++,
            text: taskText,
            completed: false,
            createdAt: new Date()
        };

        this.tasks.push(task);
        this.taskInput.value = '';
        this.updateDisplay();
        this.taskInput.focus();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.updateDisplay();
        }
    }

    deleteTask(taskId) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.updateDisplay();
            }, 300);
        }
    }

    updateDisplay() {
        this.renderTasks();
        this.updateStats();
        this.toggleEmptyState();
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-task-id', task.id);
            
            li.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="taskManager.toggleTask(${task.id})"></div>
                <span class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})" title="Delete task">×</button>
            `;
            
            this.taskList.appendChild(li);
        });
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;

        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
    }

    toggleEmptyState() {
        if (this.tasks.length === 0) {
            this.emptyState.style.display = 'block';
            this.taskList.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            this.taskList.style.display = 'block';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});