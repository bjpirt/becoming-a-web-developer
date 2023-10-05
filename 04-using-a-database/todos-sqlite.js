const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db;
(async () => {
  db = await open({
    filename: "./todos.db",
    driver: sqlite3.Database,
  });
})();

async function getTodos(list = "default") {
  return await db.all(
    `SELECT * FROM todos JOIN lists ON lists.id = todos.list_id WHERE lists.name = '${list}'`
  );
}

async function addTodo(task) {}

async function updateTodo(todo) {}

async function deleteTodo(id) {}

async function getLists() {}

async function getList() {}

async function addList(list) {}

async function updateList(list) {}

async function deleteList(id) {}

module.exports = {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  getLists,
  getList,
  addList,
  updateList,
  deleteList,
};
