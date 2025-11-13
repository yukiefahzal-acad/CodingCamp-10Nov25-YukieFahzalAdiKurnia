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
    let filtered = todos;

    if (filter === "pending") filtered = todos.filter(t => !t.done);
    if (filter === "done") filtered = todos.filter(t => t.done);

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <tr><td colspan="4" class="p-6 text-slate-500 text-center">No task found</td></tr>
      `;
      return;
    }

    filtered.forEach((todo, index) => {
      const status = todo.done ? "Done" : "Pending";
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="p-3">${todo.text}</td>
        <td class="p-3">${todo.due || "-"}</td>
        <td class="p-3">
          <span class="px-2 py-1 rounded-md text-xs ${todo.done ? "bg-green-700" : "bg-slate-700"}">${status}</span>
        </td>
        <td class="p-3">
          <button data-index="${index}" class="toggle bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded-md text-sm">✔</button>
          <button data-index="${index}" class="delete bg-rose-600 hover:bg-rose-700 px-2 py-1 rounded-md text-sm">🗑</button>
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
