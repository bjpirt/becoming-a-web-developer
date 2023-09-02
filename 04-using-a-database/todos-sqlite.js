const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db;
(async () => {
  db = await open({
    filename: "./todos.db",
    driver: sqlite3.Database,
  });
})();

async function getTodos() {
  return await db.all("SELECT * FROM todos");
}

async function addTodo(task) {}

async function updateTodo(todo) {}

async function deleteTodo(id) {}

module.exports = { getTodos, addTodo, updateTodo, deleteTodo };
