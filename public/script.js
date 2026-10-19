const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const statusMessage = document.getElementById("todo-status");
const errorMessage = document.getElementById("todo-error");
const refreshButton = document.getElementById("refresh-button");

let tasks = [];
let busy = false;

// Shared fetch helper.
async function request(url, method = "GET", body) {
    const options = {
        method,
        signal: AbortSignal.timeout(10000)
    };

    if (body !== undefined) {
        options.headers = {
            "Content-Type": "application/json"
        };

        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 204) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed.");
    }

    return data;
}

// Show loading/errors and prevent overlapping requests.
async function performAction(message, action) {
    if (busy) return;

    busy = true;
    statusMessage.textContent = message;
    errorMessage.hidden = true;
    list.setAttribute("aria-busy", "true");

    document.querySelectorAll("button, input").forEach(element => {
        element.disabled = true;
    });

    try {
        await action();
        statusMessage.textContent = "Tasks are up to date.";
    } catch (error) {
        statusMessage.textContent = "Request failed.";

        errorMessage.textContent =
            error.name === "TimeoutError"
                ? "Request timed out. Refresh tasks before retrying."
                : `${error.message} Check that the server is running, then refresh tasks.`;

        errorMessage.hidden = false;
    } finally {
        busy = false;
        list.setAttribute("aria-busy", "false");

        document.querySelectorAll("button, input").forEach(element => {
            element.disabled = false;
        });
    }
}

function renderTasks() {
    list.replaceChildren();

    if (tasks.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "No tasks yet. Add one above!";
        list.appendChild(empty);
        return;
    }

    tasks.forEach(task => {
        const row = document.createElement("li");
        row.className = "task-row";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.title} ${
                task.completed ? "incomplete" : "complete"
            }`
        );

        checkbox.addEventListener("change", () => {
            // Keep the saved state until the server confirms the update.
            checkbox.checked = task.completed;

            updateTask(task.id, {
                title: task.title,
                completed: !task.completed
            });
        });

        const title = document.createElement("span");
        title.textContent = task.title;
        title.className = "task-title";

        if (task.completed) {
            title.classList.add("completed");
        }

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            const editInput = document.createElement("input");
            editInput.value = task.title;
            editInput.maxLength = 200;
            editInput.setAttribute("aria-label", "Edit task title");

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.textContent = "Save";

            saveButton.addEventListener("click", () => {
                updateTask(task.id, {
                    title: editInput.value,
                    completed: task.completed
                });
            });

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.textContent = "Cancel";
            cancelButton.addEventListener("click", renderTasks);

            row.replaceChildren(
                editInput,
                saveButton,
                cancelButton
            );

            editInput.focus();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${task.title}`
        );

        deleteButton.addEventListener("click", () => {
            performAction("Deleting task...", async () => {
                await request(
                    `/api/tasks/${task.id}`,
                    "DELETE"
                );

                tasks = tasks.filter(item => item.id !== task.id);
                renderTasks();
            });
        });

        row.append(
            checkbox,
            title,
            editButton,
            deleteButton
        );

        list.appendChild(row);
    });
}

function loadTasks() {
    return performAction("Loading tasks...", async () => {
        tasks = await request("/api/tasks");
        renderTasks();
    });
}

function updateTask(id, changes) {
    return performAction("Saving task...", async () => {
        const updatedTask = await request(
            `/api/tasks/${id}`,
            "PUT",
            changes
        );

        tasks = tasks.map(task =>
            task.id === id ? updatedTask : task
        );

        renderTasks();
    });
}

form.addEventListener("submit", event => {
    event.preventDefault();

    performAction("Adding task...", async () => {
        const newTask = await request(
            "/api/tasks",
            "POST",
            {
                title: input.value,
                completed: false
            }
        );

        tasks.unshift(newTask);
        input.value = "";
        renderTasks();
    });
});

refreshButton.addEventListener("click", loadTasks);

loadTasks();  


