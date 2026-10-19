const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = Number(process.env.PORT || 3000);

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

const databasePath = path.resolve(
    __dirname,
    process.env.DATABASE_URL
);

fs.mkdirSync(path.dirname(databasePath), {
    recursive: true
});

const db = new DatabaseSync(databasePath);


db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
        completed INTEGER NOT NULL DEFAULT 0
            CHECK(completed IN (0, 1))
    )
`);

app.use(express.json({ limit: "10kb" }));


function formatTask(task) {
    return {
        id: task.id,
        title: task.title,
        completed: Boolean(task.completed)
    };
}

function findTask(id) {
    return db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(id);
}


app.param("id", (req, res, next, id) => {
    if (
        !/^[1-9]\d*$/.test(id) ||
        !Number.isSafeInteger(Number(id))
    ) {
        return res.status(400).json({
            error: "Task ID must be a positive integer."
        });
    }

    req.taskId = Number(id);
    next();
});

function validateTask(req, res, next) {
    const body = req.body;

    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return res.status(400).json({
            error: "Request body must be a JSON object."
        });
    }

    if (
        typeof body.title !== "string" ||
        body.title.trim().length === 0 ||
        body.title.trim().length > 200
    ) {
        return res.status(400).json({
            error: "Task title must contain 1–200 characters."
        });
    }

    if (typeof body.completed !== "boolean") {
        return res.status(400).json({
            error: "Completed must be true or false."
        });
    }

    const unknownFields = Object.keys(body).some(
        key => !["title", "completed"].includes(key)
    );

    if (unknownFields) {
        return res.status(400).json({
            error: "Only title and completed are allowed."
        });
    }

    req.validTask = {
        title: body.title.trim(),
        completed: body.completed ? 1 : 0
    };

    next();
}


app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare(
        "SELECT * FROM tasks ORDER BY id DESC"
    ).all();

    res.json(tasks.map(formatTask));
});


app.get("/api/tasks/:id", (req, res) => {
    const task = findTask(req.taskId);

    if (!task) {
        return res.status(404).json({
            error: "Task not found."
        });
    }

    res.json(formatTask(task));
});


app.post("/api/tasks", validateTask, (req, res) => {
    const { title, completed } = req.validTask;

    const result = db.prepare(`
        INSERT INTO tasks (title, completed)
        VALUES (?, ?)
    `).run(title, completed);

    const task = findTask(Number(result.lastInsertRowid));

    res.status(201).json(formatTask(task));
});


app.put("/api/tasks/:id", validateTask, (req, res) => {
    const { title, completed } = req.validTask;

    const result = db.prepare(`
        UPDATE tasks
        SET title = ?, completed = ?
        WHERE id = ?
    `).run(title, completed, req.taskId);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Task not found."
        });
    }

    res.json(formatTask(findTask(req.taskId)));
});


app.delete("/api/tasks/:id", (req, res) => {
    const result = db.prepare(
        "DELETE FROM tasks WHERE id = ?"
    ).run(req.taskId);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Task not found."
        });
    }

    res.status(204).end();
});


app.use("/api", (req, res) => {
    res.status(404).json({
        error: "API route not found."
    });
});


const publicPath = path.join(__dirname, "public");
const todoPath = path.join(publicPath, "Todolist.html");

console.log("Server file:", __filename);
console.log("Public folder:", publicPath);
console.log("To-do file exists:", fs.existsSync(todoPath));
console.log("Files in public:", fs.readdirSync(publicPath));

app.use(express.static(publicPath));


app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            error: "The request contains invalid JSON."
        });
    }

    if (err.type === "entity.too.large") {
        return res.status(413).json({
            error: "The request is too large."
        });
    }

    console.error("Request failed:", err.code || err.name);

    res.status(500).json({
        error: "Something went wrong on the server. Try again."
    });
});


const server = app.listen(PORT, "127.0.0.1", () => {
    console.log(
        `Open http://localhost:${PORT}/Todolist.html`
    );
});


function shutdown() {
    server.close(() => {
        db.close();
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
