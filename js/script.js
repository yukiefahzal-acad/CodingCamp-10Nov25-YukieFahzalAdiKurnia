document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todo-form");
  const taskInput = document.getElementById("taskInput");
  const dueInput = document.getElementById("dateInput");
  const listEl = document.getElementById("todo-list");
  const filterSelect = document.getElementById("filter-select");
  const deleteAllBtn = document.getElementById("delete-all");

  let todos = JSON.parse(localStorage.getItem("todos") || "[]");

  function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  function renderTodos() {
    listEl.innerHTML = "";

    const filter = filterSelect.value;

    // prepare today (date-only) for overdue comparisons
    const today = new Date();
    today.setHours(0,0,0,0);

    let filtered = todos;
    if (filter === "pending") {
      // pending = not done and not overdue
      filtered = todos.filter(t => {
        if (t.done) return false;
        if (!t.due) return true;
        const d = new Date(t.due); d.setHours(0,0,0,0);
        return d >= today;
      });
    }
    if (filter === "done") {
      filtered = todos.filter(t => t.done);
    }
    if (filter === "overdue") {
      filtered = todos.filter(t => {
        if (t.done || !t.due) return false;
        const d = new Date(t.due); d.setHours(0,0,0,0);
        return d < today;
      });
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <tr><td colspan="4" class="p-6 text-slate-500 text-center">No task found</td></tr>
      `;
      return;
    }

    filtered.forEach((todo, index) => {
      // determine overdue state: has a due date, not done, and due date < today
      let dueDate = null;
      if (todo.due) {
        dueDate = new Date(todo.due);
        dueDate.setHours(0,0,0,0);
      }
      const isOverdue = !todo.done && dueDate && dueDate < today;

      // status label and badge color
      let statusText = "Pending";
      let badgeClasses = "px-2 py-1 rounded-md text-xs bg-yellow-500 text-white";
      if (todo.done) {
        statusText = "Done";
        badgeClasses = "px-2 py-1 rounded-md text-xs bg-green-600 text-white";
      } else if (isOverdue) {
        statusText = "Overdue";
        badgeClasses = "px-2 py-1 rounded-md text-xs bg-rose-500 text-white";
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="p-1 sm:p-3 text-xs sm:text-sm truncate">${todo.text}</td>
        <td class="p-1 sm:p-3 text-xs sm:text-sm whitespace-nowrap">${todo.due || "-"}</td>
        <td class="p-1 sm:p-3 text-xs sm:text-sm">
          <span class="${badgeClasses}">${statusText}</span>
        </td>
        <td class="p-1 sm:p-3 text-xs sm:text-sm">
          <div class="flex items-center gap-0.5 sm:gap-2">
            <button data-index="${index}" class="toggle rounded px-1.5 py-1 bg-green-600 hover:bg-green-700 transition text-white flex items-center justify-center text-xs sm:text-sm" aria-label="Toggle done" title="Toggle done">
              <span class="material-symbols-outlined text-xs sm:text-sm" aria-hidden="true" style="font-size: 16px;">check</span>
            </button>
            <button data-index="${index}" class="delete rounded px-1.5 py-1 bg-rose-600 hover:bg-rose-700 transition text-white flex items-center justify-center text-xs sm:text-sm" aria-label="Delete task" title="Delete">
              <span class="material-symbols-outlined text-xs sm:text-sm" aria-hidden="true" style="font-size: 16px;">delete</span>
            </button>
          </div>
        </td>
      `;
      listEl.appendChild(row);
    });

    addRowListeners();
  }

  function addRowListeners() {
    document.querySelectorAll(".toggle").forEach(btn => {
      btn.onclick = () => {
        const i = btn.dataset.index;
        todos[i].done = !todos[i].done;
        saveTodos();
        renderTodos();
      };
    });

    document.querySelectorAll(".delete").forEach(btn => {
      btn.onclick = () => {
        const i = btn.dataset.index;
        todos.splice(i, 1);
        saveTodos();
        renderTodos();
      };
    });
  }


  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const due = dueInput.value;

    if (!text) {
      alert("Please enter a task");
      return;
    }

    // require due date
    if (!due) {
      alert("Please select a due date for the task");
      return;
    }

    todos.push({ text, due, done: false });
    saveTodos();
    taskInput.value = "";
    dueInput.value = "";
    renderTodos();
  });

  deleteAllBtn.addEventListener("click", () => {
    if (!todos.length) return alert("No tasks to delete");
    if (confirm("Are you sure you want to delete all tasks?")) {
      todos = [];
      saveTodos();
      renderTodos();
    }
  });

  filterSelect.addEventListener("change", renderTodos);

  renderTodos();
});
