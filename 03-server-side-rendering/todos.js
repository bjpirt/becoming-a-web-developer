let todos = [
  { id: 1, task: "Learn some HTML", complete: true },
  { id: 2, task: "Learn some CSS", complete: true },
  { id: 3, task: "Become a web developer", complete: false },
];

function getTodos() {
  return todos;
}

module.exports = { getTodos };
