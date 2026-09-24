const title = document.getElementById("todo-title");
const message = document.querySelector("#todo-message");
const sections = document.querySelectorAll("section");
const buttons = document.querySelectorAll("button");
const listItems = document.getElementsByTagName("li");
const todoList = document.getElementById("todo-list");

title.textContent = "Scoot's To-Do List";
message.textContent = "Add a task to your list and  click it!";
sections[0].classList.add("js-section");
buttons[0].title = "Add Task";


const item1 = document.createElement("li");
item1.textContent = "Go workout";


const item2 = document.createElement("li");
item2.textContent = "Playpickleball";2;

const item3 = document.createElement("li");
item3.textContent = "Get some foot to eat";

todoList.appendChild(item1);
todoList.appendChild(item2);
todoList.appendChild(item3);    

todoList.addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
        event.target.classList.toggle("completed");
    }
});


const input = document.getElementById("todo-input");
const addButton = document.getElementById("add-button");

addButton.addEventListener("click", () => {
    const task = input.value

    if(task !== "") {
        const newItem = document.createElement("li");
        newItem.textContent = task;

        todoList.appendChild(newItem);
        input.value = "";
    }
});    

const changeButton = document.getElementById("change-button");
changeButton.addEventListener("click", () => {
    message.classList.toggle("highlight");
});  


