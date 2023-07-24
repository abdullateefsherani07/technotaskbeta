document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('taskForm');
  const taskList = document.getElementById('taskList');
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  let editedTaskIndex;

  // Function to save tasks to Local Storage
  const saveTasksToLocalStorage = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  // Function to show a notification 5 minutes before the due time
  const showNotification = (task) => {
    if ("Notification" in window) {
      const dueDateTime = new Date(task.dueDate).getTime();
      const currentTime = new Date().getTime();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

      // Check if the task is due in the next 5 minutes
      if (dueDateTime - currentTime <= fiveMinutes) {
        const notificationTitle = "Task Reminder";
        const notificationOptions = {
          body: `Task "${task.title}" is due in 5 minutes!`,
          icon: "path/to/notification-icon.png", // Replace with the URL of your notification icon
        };

        // Check if the browser supports notifications and user has granted permission
        if (Notification.permission === "granted") {
          new Notification(notificationTitle, notificationOptions);
        } else if (Notification.permission !== "denied") {
          // Request permission from the user to show notifications
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification(notificationTitle, notificationOptions);
            }
          });
        }
      }
    }
  };

  // Function to display tasks from Local Storage
  const displaySavedTasks = (tasks) => {
    tasks.forEach((task, index) => {
      const taskItem = createTaskItem(task, index);
      taskList.appendChild(taskItem);
      showNotification(task);
    });
  };

  // Function to create a task item
  const createTaskItem = (task, index) => {
    const taskItem = document.createElement('li');
    taskItem.classList.add('list-group-item', 'py-2');

    const titleContainer = document.createElement('div');
    titleContainer.classList.add('d-flex', 'justify-content-between', 'align-items-center');

    const titleSpan = document.createElement('span');
    titleSpan.textContent = task.title;
    titleSpan.classList.add('task-title');

    const detailsSpan = document.createElement('span');
    detailsSpan.innerHTML = `
      <i class="fas fa-chevron-down task-details-icon" data-bs-toggle="collapse" data-bs-target="#details-${index}" aria-expanded="false" aria-controls="details-${index}"></i>
    `;

    titleContainer.appendChild(titleSpan);
    titleContainer.appendChild(detailsSpan);

    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('collapse');
    detailsContainer.id = `details-${index}`;
    detailsContainer.innerHTML = `
      <p class="mt-2 mb-2"><span>Title:</span> ${task.title}</p>
      <p class="mb-2"><span>Description:</span> ${task.description}</p>
      <p class="mb-2"><span>Due Date:</span> ${task.dueDate}</p>
      <p class="mb-2"><span>Priority:</span> ${task.priority}</p>
      <div>
        <button class="btn btn-primary edit-btn" data-index="${index}" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
        <button class="btn btn-danger delete-btn" data-index="${index}">Delete</button>
      </div>
    `;

    taskItem.appendChild(titleContainer);
    taskItem.appendChild(detailsContainer);

    return taskItem;
  };

  // Function to handle task editing
  const editTask = (index) => {
    const task = savedTasks[index];
    editedTaskIndex = index;

    document.getElementById('editTitle').value = task.title;
    document.getElementById('editDescription').value = task.description;
    const dueDateTime = task.dueDate.split(' ');
    document.getElementById('editDueDate').value = dueDateTime[0];
    document.getElementById('editDueTime').value = dueDateTime[1];
    document.getElementById('editPriority').value = task.priority;

    editModal.show();
  };

  // Function to handle task save changes from the modal
  const saveChanges = () => {
    const task = {
      title: document.getElementById('editTitle').value,
      description: document.getElementById('editDescription').value,
      dueDate: document.getElementById('editDueDate').value + " " + document.getElementById('editDueTime').value,
      priority: document.getElementById('editPriority').value,
    };

    savedTasks[editedTaskIndex] = task;
    saveTasksToLocalStorage(savedTasks);
    showNotification(task);

    editModal.hide();
    taskList.innerHTML = '';
    displaySavedTasks(savedTasks);
  };

    // Function to handle task deletion
  const deleteTask = (index) => {
    const confirmation = window.confirm('Are you sure you want to delete this task?');

    if (confirmation) {
      // Remove the task from the list and Local Storage
      savedTasks.splice(index, 1);
      saveTasksToLocalStorage(savedTasks);

      // Clear the task list and re-display tasks
      taskList.innerHTML = '';
      displaySavedTasks(savedTasks);
    }
  };

  // Event delegation for handling edit and delete buttons
  taskList.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
      const index = e.target.getAttribute('data-index');
      editTask(index);
    } else if (e.target.classList.contains('delete-btn')) {
      const index = e.target.getAttribute('data-index');
      deleteTask(index);
    }
  });

  // Event listener for handling the "Save Changes" button in the modal
  document.getElementById('editSaveBtn').addEventListener('click', saveChanges);

  // Event listener for submitting the task form
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('dueDate').value;
    const dueTime = document.getElementById('dueTime').value;
    const priority = document.getElementById('priority').value;

    const task = {
      title,
      description,
      dueDate: dueDate + " " + dueTime,
      priority,
    };

    savedTasks.push(task);

    saveTasksToLocalStorage(savedTasks);

    // Clear form fields
    taskForm.reset();

    // Clear the task list and re-display tasks
    taskList.innerHTML = '';
    displaySavedTasks(savedTasks);
  });

  // Load tasks from Local Storage when the page loads
  let savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Display the saved tasks on page load
  displaySavedTasks(savedTasks);
});
