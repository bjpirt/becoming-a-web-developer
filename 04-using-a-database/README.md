# Using a database

In the previous stage we mimicked a database by storing the To-Do tasks in memory in an array of objects. Whilst this is useful for initial development, the fact that it doesn't survive the service being restarted makes it unsuitable for building anything serious. The usual place to store application data is in a database. This brings lots of benefits, including:

- Persistence - because the data is persisted to disk, it's a more reliable method of storage
- Ease of querying - by using `SQL` it's easy to filter out only the records we want
- Indexing - if you have a large dataset, indexes make it faster to only pull ou tthe records we want
- Scalability - as your service grows you can scale your database and your web tiers independently in line with needs

We're going to switch out the existing in-memory implementation with one using `sqlite`. Sqlite is a very clever database that includes the entire database bundled in with the client library so that there's no complex software to install. It's not designed to be used at scale but for initial development it's perfect.

There are a few things to do before we can get started

- [ ] Make sure you've already got `sqlite3` installed. It is installed by default on a Mac so you should just be able to type `./sqlite3` and it will run. Type `Ctrl-d` to exit.
- [ ] Install the Node packages the skeleton uses to run (`sqlite3` and `sqlite`) - you can do this by opening a terminal, changing directory into the `04-using-a-database` folder and running the command `npm install` as there's already a `package.json` file set up with the dependencies.
- [ ] Copy all of your working web application across from the previous stage into this folder, run it again from this folder to make sure all of the files are present.

## Task

### Part One - Creating a schema

Before we wire everything in to the web app, we're going to use sqlite directly to create our schema (the schema is a term used to describe the structure of our database). Using sqlite is quite straightforward. You can run it with a path to your database file (which it will create if it doesn't exist) and it will give you a command line you can use to run SQL.

- [ ] Run `sqlite3 ./todos.db` and try to create a table called `lists` with the following columns (don't forget, each sql command must end with a `;`) [`sql create table`, `sqlite datatypes`]:
  - `id` - an integer used to reference the individual list (the `primary key`)
  - `url_id` - a string to use in the URL
  - `name` - a human visible string
- [ ] Manually insert some lists into the table you just created and then try selecting a list by its `id` or by its `url_id`. What happens if you create two lists with the same id or the same url_id and then try to select one? [`sql insert`]
- [ ] Now try to create a table called `todos` with columns matching those in the `todos.js` file in the previous stage (don't forget, each sql command must end with a `;`) [`sql create table`, `sqlite datatypes`]:
  - `id` - an integer used to reference the individual To-Do tasks (the `primary key`)
  - `list_id` - an integer that refers to the list id in the `lists` table
  - `task` - a text column used to store the actual task
  - `complete` - a boolean column used to mark a task as complete
- [ ] Manually insert some tasks into the table you just created and then try selecting a task by its id.
- [ ] Try selecting all of the todos from the `todos` table for a specific list ising the `list_id`
- [ ] Now try selecting the same todos using the `url_id` and joining the two tables together using the `list_id` column [`sql join`]
- [ ] Put the SQL you used to create the table into the empty `migrations.sql` file, leave the sqlite console with `Ctrl-d` and then delete the `todos.db` file. Recreate it by running `sqlite3 ./todos.db < migrations.sql` and then `sqlite3 ./todos.db`. You can now store your schema definition in this file so that it's easy to clear and recreate the database while you're working on it.
- [ ] Mark the `id` column in both tables as being the primary key, recreate the table and then try to insert two records with the same primary key. What happens now? [`sqlite primary key`]
- [ ] Mark the `id` column in both tables as autoincrementing so you don't need to set the id manually. Try inserting some To-Do tasks. [`sqlite autoincrement`]
- [ ] Try adding two lists with the same `url_id` - see if you can prevent this happening by adding an unique index on the column. Having an index on a column you are going to use to look things up by will also make your queries faster if you have lots of items. [`sql unique index`]
- [ ] Make the `list_id` in the `todos` table refer to the `id` column in the `lists` table as a foreign key. Try to delete a list that has todos related to it. You should get an error because it won't let you delete a row that has another foreign key pointing at it. Protection of data integrity is one of the big benefits of setting up an SQL schema properly.
- [ ] Make sure you've got the schema looking correct and put the SQL into the `migrations.sql` file
- [ ] You can also put some insert statements into this file to "seed" your database so you've got something to work with. You could also choose to store these in a different sql file and seed the database with a separate command. Which of these do you think is the best approach and why?

Now we've got a schema to work with in our database, let's integrate this into our To-Do app...

### Part Two - Connecting from our server

We're using the [sqlite3](https://www.npmjs.com/package/sqlite3) NPM module to provide us with the database, but we're also using the [sqlite](https://www.npmjs.com/package/sqlite) module which provides a nicer interface for us to use in our code - you can find examples of how to use these libraries on these links. The `sqlite` module uses `promises` to handle the asynchronous interactions with the database. Promises allow us to then use a feature called `async/await` to make our code much tidier. You should do some research on this area to make sure you understand how to use it [`js async/await example`] because you'll need to use this throughout your code.

Let's get to work integrating sqlite into your application...

- [ ] I've started you off with a skeleton for the functions you're going to use to access the records in your database (`todos-sqlite.js`). The first step is to replace your import for the old in-memory `todos.js` with this one. You'll need to make sure that when you call the function you use await. Get the app to the point where it is successfully rendering the To-Do tasks that are stored in your database.
- [ ] Have you noticed any differences with the data that is coming from the database compared to the in-memory version? Sqlite does not natively support booleans, so for consistency we should convert these 1's and 0's into `true` and `false`. Your code might still work but the consistency is good.
- [ ] You could do this manually in each function, but it's better to create a re-usable function that takes a single row of output from the database and converts it into the format we want.
- [ ] Start implementing the `addTodo` function. To illustrate another security point, we're going to do it the wrong way before doing it the right way. Use `template strings` again to generate the SQL statement that goes inside the `addTodo()` function and use the `exec` function to run your query. You should make your addTodo function look up the id of the list it will be related to and use that when you insert the record. You can do this in two passes (i.e. look up the record using the `url_id` and then use the `id` when you insert the todo). You can also do this in a single pass with a `subquery` - reducing the number of database round trips is good practice because every database request adds a delay. [`sql subquery`]

#### Untrusted inputs - revisited

In the previous stage we looked at how inputs from the user could be a security issue if they are rendered into the page. Here, we've intentionally created a security flaw by using template strings in our code. Try the following to see what happens:

- Enter `dummy', false);drop table todos;` into your "new To-Do" text box and try to add it
- It will throw an error, but does it also delete all of your data? It might not, because your query might be slightly different to mine
- If it doesn't, try to modify the string to make it create a valid statement

This is an SQL injection attack. As well as deleting data, it is also commonly used to extract data from a system including passwords and emails.

### Part three - finishing up

- [ ] Modify your exec statement to use `run()` and make it use a `parameterised query` (see the example under `Inserting rows` on [sqlite](https://www.npmjs.com/package/sqlite)). This is a common strategy for protecting against SQL injection attacks because the database driver escapes the strings and makes sure unsafe SQL can't make it to the database.
- [ ] Add some error handling around your SQL statements (you might have found they made your server crash when you were trying to inject SQL) to log an error when they fail. [`js exception handling`, `js try catch`]
- [ ] Keep working on replacing the other functions in your application to use the sqlite version

You should now have a version of your app that runs against a database and whose data now survives a reboot of the server.

## Learning points

Use these points to question what you've done and to build your understanding of what you just built:

- [ ] Notice how, by defining a clear interface to our data in the earlier steps we were able to quite easily switch out the in-memory store for the sqlite store. This is a useful principle to apply to your code in general. The interface wasn't identical, however, as you needed to replace the normal function calls with the async/await version. How might you make both versions identical so your app would run with either version with no code changes.
- [ ] We haven't covered error handling particularly since we're focussing on the actual technologies rather than good programming practices at the moment. How might you handle errors and give some feedback to the user? This is made a bit trickier by using the redirect since the render is separated from the update. You could look into using cookies to show a message after the redirect which is a common approach for this pattern. [`express js cookie`]
- [ ] The SQL Injection example (if it worked for you) should illustrate one of the most important points of working with databases - never trust external data. Understanding that you should always try to use parameterised queries is a simple way of ensuring that your application is not vulnerable to SQL injection attacks. [`sql injection examples`]
- [ ] Our SQL queries were very simple in this example, but you could try to extend the model and run some more complex queries. For example, add a `users` table and a `foreign key` from the `todos` table, then write a query that does a join between the tables to fetch all To-Do tasks for a specific user. [`sql join`, `sql foreign keys`]
- [ ] Using `promises` and `async/await` is an excellent way of making your code more manageable and avoiding the use of lots of callbacks. As an interesting exerise, you could try porting the code you have to the underlying [sqlite3](https://www.npmjs.com/package/sqlite3) NPM package which doesn't support `async/await`. Compare the two and see why people tend to prefer `async/await`. It's worth spending some time to understand how promises actually work as you'll be using them throughout your code. [`js async await`, `js promises`]
- Using `sqlite` is a good way of trying out a simple database, as another exercise, you could try running another database (e.g. `PostgreSQL`) in `Docker` and creating another library to use that. [`postgresql`, `postgresql docker`]
- Managing the migrations for a database is a very important part of the overall development of an application. It's best to use an existing tool for managing migrations and to integrate this into your deployment pipeline so that changes are rolled out in a controlled way. Storing them all in a file isn't a good long-term approach but it shows you how it's good to pull these out into their own step. [`sql schema migration tools`]
