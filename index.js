const readline = require('readline');
const fsp = require('fs').promises;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptUser() {
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
                const taskIndex = parseInt(args[0]);
                const newDescription = args.slice(1).join(" ");
    
                updateTask(taskIndex, newDescription);
    
                break;
    
            case "delete":
                if (args.length > 1) {
                    console.log("Usage: delete <task-index>");
                    break;
                }
    
                const deleteIndex = parseInt(args[0]);
    
                deleteTask(deleteIndex);
                break;
    
            case "mark-in-progress":
                if (args.length > 1) {
                    console.log("Usage: mark-in-progress <task-index>");
                    break;
                }
    
                const taskId = parseInt(args[0]);
    
                changeStatus(taskId, "in-progress");
    
                break;
    
            case "mark-done":
                if (args.length > 1) {
                    console.log("Usage: mark-in-progress <task-index>");
                    break;
                }
    
                const id = parseInt(args[0]);
    
                changeStatus(id, "done");
    
                break;
    
            case "exit":
                console.log("Exiting task tracker...");
                rl.close();  // Close the readline interface to exit
                return;
    
            default:
                console.log("Unknown command. Please use: add, update, mark-in-progress, mark-done, or list.");
                break;
        }
    
        promptUser();
    });
}

promptUser();

async function addTask(task) {
    try {
        let fileData = await fsp.readFile("tasks.json", "utf8");

        let tasks;
        if (fileData.trim() === "") {
            tasks = [];
        } else {
            tasks = JSON.parse(fileData);
        }

        tasks.push({id: (tasks[tasks.length - 1]?.id + 1) || 1, ...task});

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
            console.log(`${task.id}. ${task.description}`);
        });
    } else if (listType === 'todo') {
        console.log("Todo tasks:");
        tasks.filter(task => task.status === 'todo').forEach((task, index) => {
            console.log(`${task.id}. ${task.description}`);
        });
    } else if (listType === 'in-progress') {
        console.log("In-progress tasks:");
        tasks.filter(task => task.status === 'in-progress').forEach((task, index) => {
            console.log(`${task.id}. ${task.description}`);
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

            console.log(`${task.id}. ${task.description} - ${task.status} - ${date}`);
        });
    } else {
        console.log("Usage: list (done/todo/in-progress)");
    }

}

async function changeStatus(taskId, status) {
    try {
        const data = await fsp.readFile("tasks.json", "utf8");
        let tasks = JSON.parse(data);

        let updatedTask;
        tasks = tasks.map(task => {
            if (task.id === taskId) {
              updatedTask = { ...task, status: status, updatedAt: new Date() }
              return updatedTask;
            }
            return task;
        });

        await fsp.writeFile("tasks.json", JSON.stringify(tasks, null, 2));

        if (!updatedTask) {
            console.log('Invalid index!');
            return;
        }
        console.log('Task updated\n', updatedTask);
    } catch (err) {
        console.log(err)
    }
}

async function updateTask(taskIndex, newDescription) {
    try {
        const data = await fsp.readFile("tasks.json", "utf8");
        let tasks = JSON.parse(data);

        let invalidIndex = true;

        tasks = tasks.map(task => {
            if (task.id === taskIndex) {
                invalidIndex = false
              return { ...task, description: newDescription, updatedAt: new Date() };
            }
            return task;
        });

        if (invalidIndex) {
            console.log('Invalid index');
            return;
        }

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
        const deletedTask = tasks.find((item) => item.id === deleteIndex);

        if (!deletedTask) {
            console.log('Invalid index')
            return;
        }
        let deletedTaskDescription = deletedTask.description;

        let updatedTasks = tasks.filter(item => item.id !== deleteIndex); 

        await fsp.writeFile("tasks.json", JSON.stringify(updatedTasks, null, 2));
        console.log(`${deletedTaskDescription} - Deleted.`)
    } catch (err) {
        console.log(`Err occured. `, err)
    }
}