# wayofthejs

Welcome to **wayofthejs**, a lightweight JavaScript framework designed to simplify the management of models, views, and routes in your applications. This framework provides a structured and efficient way to handle data synchronization, event handling, and view rendering, all while keeping your code modular and maintainable.

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
   - [Models](#models)
   - [Views](#views)
   - [Collections](#collections)
   - [Routing](#routing)
4. [Advanced Features](#advanced-features)
   - [Scoped CSS](#scoped-css)
   - [Event Handling](#event-handling)
   - [Mapping Regions](#mapping-regions)
5. [Example Application](#example-application)
   - [Task Management Application](#task-management-application)
6. [API Reference](#api-reference)
   - [Model](#model)
   - [View](#view)
   - [Collection](#collection)
   - [Router](#router)
7. [Contributing](#contributing)
8. [License](#license)

## Installation

To install **wayofthejs**, you can use npm or yarn:

```bash
npm install wayofthejs
```

or

```bash
yarn add wayofthejs
```

## Getting Started

To get started with **wayofthejs**, you'll need to import the necessary modules from the package and set up your project. Here's a quick example to demonstrate how you can create a basic model and view.

### Creating a Model

First, let's define a `User` model with some basic attributes and synchronization capabilities:

```typescript
import { Model, Attributes, ApiSync, Eventing } from 'wayofthejs';

interface UserProps {
  id?: number;
  name?: string;
  age?: number;
}

const rootUrl = 'http://localhost:3000/users';

const user = new Model<UserProps>(
  new Attributes<UserProps>({ id: 1, name: 'John Doe', age: 30 }),
  new Eventing(),
  new ApiSync<UserProps>(rootUrl)
);

// Fetch user data
user.fetch().then(() => {
  console.log('User fetched:', user);
}).catch(error => {
  console.error('Error fetching user:', error);
});

// Save user data
user.set({ name: 'Jane Doe' });
user.save().then(() => {
  console.log('User saved:', user);
}).catch(error => {
  console.error('Error saving user:', error);
});
```

### Creating a View

Next, let's create a view for the `User` model to render the user's information:

```typescript
import { View } from 'wayofthejs';
import { Model } from 'wayofthejs';

class UserView extends View<Model<UserProps>, UserProps> {
  template(): string {
    return `
      <div>
        <h1>User Detail</h1>
        <p>Name: ${this.model.get('name')}</p>
        <p>Age: ${this.model.get('age')}</p>
        <button class="update-age">Update Age</button>
      </div>
    `;
  }

  eventsMap(): { [key: string]: EventHandler } {
    return {
      'click:.update-age': this.onUpdateAgeClick
    };
  }

  onUpdateAgeClick = (): void => {
    const newAge = this.model.get('age')! + 1;
    this.model.set({ age: newAge });
    this.model.save();
  };
}

// Instantiate and render the view
const userView = new UserView(document.getElementById('root')!, user);
userView.render();
```

## Core Concepts

### Models

**wayofthejs** models encapsulate your application's data and provide methods for data synchronization, attribute management, and event handling.

#### Example

```typescript
import { Model, Attributes, ApiSync, Eventing } from 'wayofthejs';

interface TaskProps {
  id?: number;
  description?: string;
  completed?: boolean;
}

const rootUrl = 'http://localhost:3000/tasks';

const task = new Model<TaskProps>(
  new Attributes<TaskProps>({ id: 1, description: 'Learn TypeScript', completed: false }),
  new Eventing(),
  new ApiSync<TaskProps>(rootUrl)
);
```

#### Model Methods

- **fetch**: Retrieves the model's data from the server.
- **save**: Persists the model's data to the server.
- **set**: Updates the model's attributes.
- **get**: Retrieves the value of a specific attribute.
- **on**: Registers an event handler.
- **trigger**: Triggers an event.

### Views

Views in **wayofthejs** are responsible for rendering models and handling user interactions. They provide a flexible way to define templates and bind events.

#### Example

```typescript
import { View } from 'wayofthejs';
import { Model } from 'wayofthejs';

class TaskView extends View<Model<TaskProps>, TaskProps> {
  template(): string {
    return `
      <div class="task">
        <p class="task-description">${this.model.get('description')}</p>
        <input type="checkbox" class="task-completed" ${this.model.get('completed') ? 'checked' : ''} />
        <button class="task-delete">Delete</button>
      </div>
    `;
  }

  eventsMap(): { [key: string]: EventHandler } {
    return {
      'click:.task-delete': this.onDeleteClick,
      'change:.task-completed': this.onToggleComplete
    };
  }

  onDeleteClick = (): void => {
    this.model.sync.delete(this.model.get('id')!).then(() => {
      this.model.trigger('delete');
    }).catch(error => {
      console.error('Error deleting task:', error);
    });
  };

  onToggleComplete = (): void => {
    const completed = !this.model.get('completed');
    this.model.set({ completed });
    this.model.save();
  };
}
```

#### View Methods

- **template**: Defines the HTML structure of the view.
- **eventsMap**: Maps events to their corresponding handlers.
- **render**: Renders the view.
- **onRender**: Optional method called after the view is rendered.
- **afterRender**: Optional method called after the view is fully rendered.

### Collections

Collections in **wayofthejs** manage groups of models and provide methods for fetching and updating collections from a backend API.

#### Example

```typescript
import { Collection } from 'wayofthejs';

const tasks = new Collection<Model<TaskProps>, TaskProps>(rootUrl, deserializeTask);

tasks.fetch().then(() => {
  console.log('Tasks fetched:', tasks.models);
}).catch(error => {
  console.error('Error fetching tasks:', error);
});
```

#### Collection Methods

- **fetch**: Retrieves the collection's data from the server.
- **add**: Adds a new model to the collection.
- **remove**: Removes a model from the collection.
- **get**: Retrieves a model by its ID.
- **on**: Registers an event handler.
- **trigger**: Triggers an event.

### Routing

The router in **wayofthejs** manages client-side routing, allowing you to define routes and their corresponding handlers.

#### Example

```typescript
import { Router } from 'wayofthejs';

const router = new Router();

router.addRoute('/tasks', () => {
  console.log('Tasks page');
});

router.navigate('/tasks');
```

#### Router Methods

- **addRoute**: Adds a new route.
- **navigate**: Navigates to a specified route.
- **getCurrentRoute**: Retrieves the current route.
- **loadRoute**: Loads a route and executes its handler.

## Advanced Features

### Scoped CSS

**wayofthejs** supports scoped CSS, allowing you to apply styles to specific components without affecting the global styles.

#### Example

```typescript
import { View } from 'wayofthejs';

class TaskView extends View<Model<TaskProps>, TaskProps> {
  template(): string {
    return `
      <div class="task">
        <p class="task-description">${this.model.get('description')}</p>
        <input type="checkbox" class="task-completed" ${this.model.get('completed') ? 'checked' : ''} />
        <button class="task-delete">Delete</button>
      </div>
    `;
  }

  styles(): string {
    return `
      .task {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        border: 1px solid #ccc;
        margin-bottom: 5px;
      }

      .task-completed {
        margin-right: 10px;
      }
    `;
  }
}
```

### Event Handling

Event handling in **wayofthejs** is simple and intuitive. You can define event handlers directly in your views and bind them to DOM elements.

#### Example

```typescript
import { View } from 'wayofthejs';

class TaskView extends View<Model<TaskProps>, TaskProps> {
  template(): string {
    return `
      <div class="task">
        <p class="task-description">${this.model.get('description')}</p>
        <input type="checkbox" class="task-completed" ${this.model.get('completed

') ? 'checked' : ''} />
        <button class="task-delete">Delete</button>
      </div>
    `;
  }

  eventsMap(): { [key: string]: EventHandler } {
    return {
      'click:.task-delete': this.onDeleteClick,
      'change:.task-completed': this.onToggleComplete
    };
  }

  onDeleteClick = (): void => {
    this.model.sync.delete(this.model.get('id')!).then(() => {
      this.model.trigger('delete');
    }).catch(error => {
      console.error('Error deleting task:', error);
    });
  };

  onToggleComplete = (): void => {
    const completed = !this.model.get('completed');
    this.model.set({ completed });
    this.model.save();
  };
}
```

### Mapping Regions

Mapping regions allows you to define specific areas in your view templates that can be dynamically updated.

#### Example

```typescript
import { CollectionView } from 'wayofthejs';
import { Model } from 'wayofthejs';

class TaskListView extends CollectionView<Model<TaskProps>, TaskProps> {
  renderItem(model: Model<TaskProps>, itemParent: Element): void {
    new TaskView(itemParent, model, false, true).render();
  }

  template(): string {
    return `
      <div>
        <h1>Task List</h1>
        <div class="task-list"></div>
      </div>
    `;
  }

  regionsMap(): { [key: string]: string } {
    return {
      taskList: '.task-list'
    };
  }

  onRender(): void {
    this.regions.taskList.innerHTML = '';
    this.collection.models.forEach(model => {
      const taskView = new TaskView(document.createElement('div'), model, false, true);
      taskView.render();
      this.regions.taskList.append(taskView.parent);
    });
  }

  styles(): string {
    return `
      .task-list {
        margin-top: 20px;
      }
    `;
  }
}
```

## Example Application

Let's build a complete example application to demonstrate how to use **wayofthejs**. We'll create a simple task management application where users can add tasks, view them in a list, and mark them as completed.

### Task Management Application

#### Step 1: Define the Task Model

```typescript
import { Model, Attributes, ApiSync, Eventing } from 'wayofthejs';

interface TaskProps {
  id?: number;
  description?: string;
  completed?: boolean;
}

const rootUrl = 'http://localhost:3000/tasks';

const task = new Model<TaskProps>(
  new Attributes<TaskProps>({ id: 1, description: 'Learn TypeScript', completed: false }),
  new Eventing(),
  new ApiSync<TaskProps>(rootUrl)
);
```

#### Step 2: Create the Task View

```typescript
import { View } from 'wayofthejs';
import { Model } from 'wayofthejs';

class TaskView extends View<Model<TaskProps>, TaskProps> {
  template(): string {
    return `
      <div class="task">
        <p class="task-description">${this.model.get('description')}</p>
        <input type="checkbox" class="task-completed" ${this.model.get('completed') ? 'checked' : ''} />
        <button class="task-delete">Delete</button>
      </div>
    `;
  }

  eventsMap(): { [key: string]: EventHandler } {
    return {
      'click:.task-delete': this.onDeleteClick,
      'change:.task-completed': this.onToggleComplete
    };
  }

  onDeleteClick = (): void => {
    this.model.sync.delete(this.model.get('id')!).then(() => {
      this.model.trigger('delete');
    }).catch(error => {
      console.error('Error deleting task:', error);
    });
  };

  onToggleComplete = (): void => {
    const completed = !this.model.get('completed');
    this.model.set({ completed });
    this.model.save();
  };

  styles(): string {
    return `
      .task {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        border: 1px solid #ccc;
        margin-bottom: 5px;
      }

      .task-completed {
        margin-right: 10px;
      }
    `;
  }
}
```

#### Step 3: Create the Task List View

```typescript
import { CollectionView } from 'wayofthejs';
import { Collection } from 'wayofthejs';

class TaskListView extends CollectionView<Model<TaskProps>, TaskProps> {
  renderItem(model: Model<TaskProps>, itemParent: Element): void {
    new TaskView(itemParent, model, false, true).render();
  }

  template(): string {
    return `
      <div>
        <h1>Task List</h1>
        <div class="task-list"></div>
      </div>
    `;
  }

  regionsMap(): { [key: string]: string } {
    return {
      taskList: '.task-list'
    };
  }

  onRender(): void {
    this.regions.taskList.innerHTML = '';
    this.collection.models.forEach(model => {
      const taskView = new TaskView(document.createElement('div'), model, false, true);
      taskView.render();
      this.regions.taskList.append(taskView.parent);
    });
  }

  styles(): string {
    return `
      .task-list {
        margin-top: 20px;
      }
    `;
  }
}
```

#### Step 4: Set Up Routing

```typescript
import { Router } from 'wayofthejs';

const router = new Router();

router.addRoute('/tasks', () => {
  const tasks = new Collection<Model<TaskProps>, TaskProps>(rootUrl, deserializeTask);
  tasks.fetch().then(() => {
    const taskListView = new TaskListView(document.getElementById('root')!, tasks, true);
    taskListView.render();
  }).catch(error => {
    console.error('Error loading tasks:', error);
  });
});

router.navigate('/tasks');
```

#### Step 5: Set Up the HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Manager</title>
</head>
<body>
  <nav>
    <a href="#" id="task-link">Tasks</a>
  </nav>
  <div id="root"></div>
  <script src="path/to/compiled/js/bundle.js"></script>
  <script>
    document.getElementById('task-link').addEventListener('click', () => router.navigate('/tasks'));
  </script>
</body>
</html>
```

## API Reference

### Model

The `Model` class represents an individual data model. It provides methods for managing attributes, handling events, and synchronizing data with a backend API.

#### Methods

- **fetch(id: number): Promise<void>** - Fetches the model's data from the server.
- **save(): Promise<void>** - Saves the model's data to the server.
- **set(update: T): void** - Updates the model's attributes.
- **get<K extends keyof T>(key: K): T[K]** - Retrieves the value of a specific attribute.
- **on(eventName: string, callback: () => void): void** - Registers an event handler.
- **trigger(eventName: string): void** - Triggers an event.

#### Example

```typescript
const task = new Model<TaskProps>(
  new Attributes<TaskProps>({ id: 1, description: 'Learn TypeScript', completed: false }),
  new Eventing(),
  new ApiSync<TaskProps>(rootUrl)
);

task.fetch().then(() => {
  console.log('Task fetched:', task);
});

task.set({ description: 'Learn JavaScript' });
task.save().then(() => {
  console.log('Task saved:', task);
});
```

### View

The `View` class is responsible for rendering models and handling user interactions. It allows you to define templates, bind events, and apply scoped CSS.

#### Methods

- **template(): string** - Defines the HTML structure of the view.
- **eventsMap(): { [key: string]: EventHandler }** - Maps events to their corresponding handlers.
- **render(): void** - Renders the view.
- **onRender(): void** - Optional method called after the view is rendered.
- **afterRender(): void** - Optional method called after the view is fully rendered.
- **styles(): string** - Optional method to define scoped CSS.

#### Example

```typescript
class TaskView extends View<Model<TaskProps>, TaskProps> {
  template(): string {
    return `
      <div class="task">
        <p class="task-description">${this.model.get('description')}</p>
        <input type="checkbox" class="task-completed" ${this.model.get('completed') ? 'checked' : ''} />
        <button class="task-delete">Delete</button>
      </div>
    `;
  }

  eventsMap(): { [key: string]: EventHandler } {
    return {
      'click:.task-delete': this.onDeleteClick,
      'change:.task-completed': this.onToggleComplete
    };
  }

  onDeleteClick = (): void => {
    this.model.sync.delete(this.model.get('id')!).then(() => {
      this.model.trigger('delete');
    }).catch(error => {
      console.error('Error deleting task:', error);
    });
  };

  onToggleComplete

 = (): void => {
    const completed = !this.model.get('completed');
    this.model.set({ completed });
    this.model.save();
  };

  styles(): string {
    return `
      .task {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        border: 1px solid #ccc;
        margin-bottom: 5px;
      }

      .task-completed {
        margin-right: 10px;
      }
    `;
  }
}
```

### Collection

The `Collection` class manages a group of models and provides methods for fetching and updating collections from a backend API.

#### Methods

- **fetch(): Promise<void>** - Retrieves the collection's data from the server.
- **add(model: T): void** - Adds a new model to the collection.
- **remove(id: number): void** - Removes a model from the collection.
- **get(id: number): T | undefined** - Retrieves a model by its ID.
- **on(eventName: string, callback: () => void): void** - Registers an event handler.
- **trigger(eventName: string): void** - Triggers an event.

#### Example

```typescript
const tasks = new Collection<Model<TaskProps>, TaskProps>(rootUrl, deserializeTask);

tasks.fetch().then(() => {
  console.log('Tasks fetched:', tasks.models);
}).catch(error => {
  console.error('Error fetching tasks:', error);
});

const newTask = new Model<TaskProps>(
  new Attributes<TaskProps>({ description: 'Write documentation', completed: false }),
  new Eventing(),
  new ApiSync<TaskProps>(rootUrl)
);

tasks.add(newTask);
tasks.remove(1);
```

### Router

The `Router` class manages client-side routing, allowing you to define routes and their corresponding handlers.

#### Methods

- **addRoute(path: string, handler: RouteHandler, cssFilePath?: string, scoped?: boolean, middleware: Middleware[] = []): void** - Adds a new route.
- **navigate(path: string): void** - Navigates to a specified route.
- **getCurrentRoute(): string** - Retrieves the current route.
- **loadRoute(path: string): void** - Loads a route and executes its handler.

#### Example

```typescript
const router = new Router();

router.addRoute('/tasks', () => {
  console.log('Tasks page');
});

router.navigate('/tasks');
```





