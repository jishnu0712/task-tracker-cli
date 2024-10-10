const readline = require('readline');
const fsp = require('fs').promises;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`Welcome to task tracker. Here are the commands you can use:
[add <task-description>, update <task-index>, mark-in-progress <task-index>, mark-done <task-index>, list (done/todo/in-progress)]\n`, (answer) => {

    const commandsArr = answer.split(" ");
    const command = commandsArr[0];
    const args = commandsArr.slice(1);

    switch (command) {
        case "add":
            if (args.length === 0) {
                console.log("Usage: add <task-description>");
                break;
            }
            const taskDescription = args.join(" ");
            const task = { 
                description: taskDescription, 
                status: 'todo',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            addTask(task);

            break;

        case "list":
            const listType = args[0];

            listTasks(listType);

            break;

        case "update": 
            if (args.length < 2) {
                console.log("Usage: update <task-index> <new-description>");
                break;
            }
            const taskIndex = parseInt(args[0]) - 1;
            const newDescription = args.slice(1).join(" ");

            updateTask(taskIndex, newDescription);

            break;

        case "delete":
            if (args.length > 1) {
                console.log("Usage: delete <task-index>");
                break;
            }

            const deleteIndex = parseInt(args[0]) - 1;

            deleteTask(deleteIndex);
            break;

        case "mark-in-progress":
            if (args.length > 1) {
                console.log("Usage: mark-in-progress <task-index>");
                break;
            }

            const taskId = parseInt(args[0]) - 1;

            changeStatus(taskId, "in-progress");

            break;

        case "mark-done":
            if (args.length > 1) {
                console.log("Usage: mark-in-progress <task-index>");
                break;
            }

            const id = parseInt(args[0]) - 1;

            changeStatus(id, "done");

            break;
        default:
            console.log("Unknown command. Please use: add, update, mark-in-progress, mark-done, or list.");
            break;
    }

    rl.close();
});



async function addTask(task) {
    try {
        let tasks = await fsp.readFile("tasks.json", "utf8");
        tasks = JSON.parse(tasks);

        tasks.push(task);

        await fsp.writeFile("tasks.json", JSON.stringify(tasks, null, 2));

        console.log(`Task added successfully.`);
    } catch (err) {
        console.log('err: ', err)
    }
}

async function listTasks(listType) {
    let tasks;
    try {
        const data = await fsp.readFile("tasks.json", "utf8");
        tasks = JSON.parse(data);
    } catch(err) {
        console.log(err);
        return;
    }

    if (listType === 'done') {
        console.log("Completed tasks:");
        tasks.filter(task => task.status === 'done').forEach((task, index) => {
            console.log(`${index + 1}. ${task.description}`);
        });
    } else if (listType === 'todo') {
        console.log("Todo tasks:");
        tasks.filter(task => task.status === 'todo').forEach((task, index) => {
            console.log(`${index + 1}. ${task.description}`);
        });
    } else if (listType === 'in-progress') {
        console.log("In-progress tasks:");
        tasks.filter(task => task.status === 'in-progress').forEach((task, index) => {
            console.log(`${index + 1}. ${task.description}`);
        });
    } else if (listType === undefined) {
        console.log("All tasks:");
        tasks.forEach((task, index) => {
            const date = new Date(task.createdAt.toLocaleString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: 'numeric', 
                second: 'numeric' 
            }));

            console.log(`${index + 1}. ${task.description} - ${task.status} - ${date}`);
        });
    } else {
        console.log("Usage: list (done/todo/in-progress)");
    }

}

async function changeStatus(taskId, status) {
    try {
        const data = await fsp.readFile("tasks.json", "utf8");
        const tasks = JSON.parse(data);

        tasks[taskId]["status"] = status;
        tasks[taskId]["updatedAt"] = new Date();

        await fsp.writeFile("tasks.json", JSON.stringify(tasks, null, 2));

        console.log('Task updated', tasks[taskId]);
    } catch (err) {
        console.log(err)
    }
}

async function updateTask(taskIndex, newDescription) {
    try {
        const tasks = await fsp.readFile("tasks.json", "utf8");
        let updatedTasks = JSON.parse(tasks);

        updatedTasks[taskIndex].description = newDescription;
        updatedTasks[taskIndex].updatedAt = new Date();

        await fsp.writeFile("tasks.json", JSON.stringify(updatedTasks, null, 2));
        console.log(`Task "${updatedTasks[taskIndex].description}" updated successfully.`);
    } catch (error) {
        console.error("Error updating task:", error);
    }
}

async function deleteTask(deleteIndex) {
    try {
        let tasks = await fsp.readFile("tasks.json", "utf8");
        tasks = JSON.parse(tasks);
        const deletedTaskDescription = tasks[deleteIndex].description;

        let updatedTasks = tasks.filter((_, index) => index !== deleteIndex); // filter with index

        await fsp.writeFile("tasks.json", JSON.stringify(updatedTasks, null, 2));
        console.log(`${deletedTaskDescription} - Deleted.`)
    } catch (err) {
        console.log(`Err occured. `, err)
    }
}