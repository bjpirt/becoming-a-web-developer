# Server Side Rendering

In the early days of web development, the only way of doing anything vaguely interactive was by rendering HTML on the server and seding it back to the web browser. There are still many benefits to this approach and it's still very relevant to building web services. We're going to continue our journey on building a To-Do web app by doing some simple rendering on the server. This stage is a bit more complex than the previous ones, so it's broken into a few steps to make things more manageable. Don't move on to the next step until you've done all of the things to that point otherwise you'll be missing key things.

We're going to be using a very widely used Node.js library called `express` for this and I'm going to start you off with a basic hello world service that you can build on to make your To-Do list app. We'll be writing this in Javascript so you'll need to do the following to make sure you've got the basic skeleton up and running properly.

- [ ] Install Node.js - on a Mac, the best way of doing this is to first install [Homebrew](https://docs.brew.sh/Installation) and then to run `brew install node`. Once you've done this you should be able to run `node --version` and it should print the version you are using.
- [ ] Install the Node packages the skeleton uses to run (`express`) - you can do this by opening a terminal, changing directory into the `03-server-side-rendering` folder and running the command `npm install`
- [ ] Once you've done this, make sure everything's running by running `node index.js`. You should see a message saying the server has started. You should then be able to visit [http://localhost:8000](http://localhost:8000) in your web browser and see a Hello World message.
- [ ] **Important:** If you make any changes to the `index.js` file, you'll need to stop and start the server in your terminal as it doesn't pick up the changes automatically. It's possible to do this, but it's outside the scope of this tutorial.

We'll be extending the single list so that we can have multiple lists in this application so that it's a little more realistic. There's a default list we'll start with, but then you'll make your app able to handle multiple lists.

## Task

### Part One - Basic Rendering

Look at the `index.js` file and make sure you understand what it is doing. Once you do you should:

- [ ] Make the `/` endpoint return the content from the `index.html` page in the previous step (the one with the external stylesheet). You should be able to just copy it into the js file as a string. (Pro tip: use a `template string` with a `` backtick (`)`` to enable the string to go on multiple lines)
- [ ] Add another endpoint for the css (maybe something like `main.css` but it's up to you). You can use the same technique of bringing the text from the CSS file into the document using a string and just returning it from the endpoint you create. This CSS will be sent with the wrong `mime type` which might cause your browser not to apply it. Try adding a `Content-Type` header to set the correct mime type for CSS. [`express content type header`, `mime types`]
- [ ] Try to add it as a `static file` instead. Create a folder for your assets to go in and then try to configure express to serve out files from this folder. [`express js static files`]

Now we're going to do some home made HTML templating (there are lots of libraries out there for this, but it's always good to see what it takes to build one yourself):

- [ ] Import the `getTodos()` function from the `todos.js` file in this folder into your `index.js`. This function does what it says - if you call it, it will give you an array of objects for the To-Do items. It can take an argument to select which To-Do list the tasks should come from, but this defaults to the `default` list [`js import function from file require`]
- [ ] Try to take this array of To-Do items and build up the content of your html web page. You'll want to break things out into functions that you can build up to give you back your web page. For example, you could create a function that takes an argument of a string and puts it into your main html template. You might also make a function that takes an argument of one of the To-Do items you get back from `getTodos()` and puts it into a single To-Do list item template. You should be able to build up your original `index.html` page using these functions. You can use `template strings` to build the HTML you return to the browser.
- [ ] Use the `complete` attribute in the todos data to check or uncheck the checkbox for that item. [`html checkbox checked`]
- [ ] Try putting the functions into their own files, or all into one file (try both - which do you prefer?) and import them into your `index.js` file. This should make it easier to understand what's going on without loads of long strings everywhere. See the `todos.js` file for an example of exporting functions.

### Part Two - Using the path

At the moment, you should have a list of To-Do tasks rendering when you visit [http://localhost:8000/](http://localhost:8000/). At this point it's worth a little diversion to understand what the URL actually means. When you break this URL down into its component parts you get:

- `http` - the `scheme`. i.e. which protocol to use for the URL. You'll often see `https` here as an alternative scheme
- `localhost` - the `host`. i.e. which address the server is running on. `localhost` is just an alias for the local computer
- `8000` - the `port`. HTTP defaults to `80` and HTTPS defaults to `443` but these can be anything. If it's missing the browser will use the defaults depending on the `scheme`
- `/` - the `path`. This is sent to the web server to tell it what you are looking to retrieve. It's useful to use to send data to the server, e.g. which list you're viewing. If you visit a URL without the path, the browser will add on a `/` without telling you.
  
We're going to let a user select which list they want to view. Do the following:

- [ ] Modify `index.js` to change the path of the main endpoint from `/` to `/lists/:listId`. This tells `express` to parse the URL and put wahtever it finds after `/lists/` into a variable called `listId`. We can use this to let a user select which list they want to view. It's worth reading up on the options for this to make sure you understand it fully. [`express routing`]
- [ ] In the handler function for showing a list (that you just modified), pull the `listId` out into a variable and pass it into the `getTodos()` function. Reload the server and then visit [http://localhost:8000/lists/default](http://localhost:8000/lists/default) which should still show your default list. Change the URL to [http://localhost:8000/lists/shopping](http://localhost:8000/lists/shopping) and you should now see a different list.
- [ ] Add a simple template to list the lists and serve this out on `/` - you should be able to modify what you have already built for showing a list to do this. You should be able to re-use the main template you created. You should also add a link somewhere on the task list page to give you a way to get to the index of lists you just created.

### Part Three - Form input

The next step is to start building up the `CRUD` (Create, Read, Update, Delete) behaviours that make up most web services (well, technically we've already created the `Read` action!). We're going to be running everything in memory for now. This means everything will reset when you stop and start the app. We'll be looking at how to store things more persistently in later steps.

- [ ] Create a function in the `todos.js` file called `addTodo`. It should take two arguments; the list id and a todo object (like the ones in the `todos` array in `todos.js` but without an `id` attribute as we'll be calculating that in the function) and it should add a new object to the `todos` array in that file. At the moment, we're hand-rolling our own database so you'll need to work out what to set the `id` attribute to. Find the maximum id of the existing items and add one.
- [ ] Add a `post` endpoint into `index.js` with the path `/lists/:listId/add-todo`. Post requests are used for `post`ing data from the web browser to the web server [`express js post request`, `http post request`]
- [ ] Forms can send their data to the web server using either `GET` or `POST` requests. `POST` requests are generally preferred for doing things that change the state of the application (like adding a To-Do). You'll need to do a few things to make sure you can receive the data from your "new to-do" form in your web app:
  - Add attributes to your form to make it `POST` the data to your new endpoint [`html form attributes`]
  - Configure express to be able to parse the data that is sent [`express post request form`]
  - Name the input text field in your form so you can access it on the server
- [ ] You then need to take the data that is sent to the server and use it to pass into your new `addTodo` function along with the `listId` from the URL.
- [ ] Once you've done this you should re-render the page. You can just re-render it in the post handler, but it's better practice to just redirect to the main page (`/`) as that is already set up to render the page. [`express js redirect`]

You should now be able to enter some text into your "new To-Do" form and it should be added to the list. Congratulations, you've just made a (semi) working To-Do list application. But we've still got a bit further to go. Before we do, this is a good time to illustrate an important point about security.

#### Untrusted Inputs

At the moment, we've built a simple app that can take your input and add it to our "database" of To-Do items. But we're trusting that the data the user enters is not malicious as we're just adding it into our page exactly as they sent it. This is the basis of lots of real-world hacks that, as a web developer, you should be aware of.

Try adding a To-Do task with the text `<script>alert("you've been 0wned")</script>` and see what happens. You should see that we've just enabled an attacker to execute arbitrary Javascript within our web application. You might think that this is just annoying, but if this were some kind of site where users logged in, someone could post some code that stole your log in cookie and sent it to a remote server so that someone else could steal your account. Depending on what this site does this could be catastrophic.

- [ ] One approach to handling untrusted input that's going to be rendered in a page is to `HTML Encode` it. This will replace characters like `<` with their HTML entity equivalent `&lt;`. Try doing this and see if this fixes the issue we tested. [`node.js html encoding`]

There are other security vulnerabilities in the site as it stands, but we'll look at those later as we build out more advanced functionality.

### Part Four - Updating

We're going to let a user mark a To-Do task as complete now. This can be quite tricky to do because of the fact that in HTML forms, checkboxes only send their value if they are checked. There are a number of different approaches to the problem, but we'll build one that doesn't rely on any client-side Javascript for now. Here's what you should do:

- [ ] Wrap your list of To-Do tasks with another `<form>` element and add a button that will submit this form at the bottom. You should make the form submit a `POST` request to `/lists/:listId/update-todos` [`html form submit button`]
- [ ] Give each of your "task complete" checkboxes a name attribute that includes the id of the task (e.g. `complete-1`) and render this in your template from the data.
- [ ] Add a function to the `todos.js` file called `updateTodo`. It should take arguments of the list ID and a full To-Do object like the ones that are already in there, look up the matching To-Do by id and update the task name and the complete flag. Note that because of the way Javascript passes data around by reference this function might not actually be necessary, but it will be useful to have later as we switch out from in-memory to using a database for storage.
- [ ] When receiving the data, fetch all of the existing To-Do items using `getTodos`, loop through them and check if there's a matching `complete-x` value in the data - if there is, you can update the record as complete, if there isn't you can set the record to incomplete.
- [ ] Redirect to `/` again to render the page.

Note: This isn't necessarily the best way of handling the update because it's not very safe across multiple users. For example:

- User 1 loads the page and goes and makes a coffee and has a long chat with a co-worker
- User 2 loads the page, adds a task and marks it as complete
- User 1 Comes back from the kitchen, completes a task and updates
- The new task that User 2 had marked as complete is now marked as incomplete

Can you think of any ways of handling this? See if you can modify the logic so that when a user submits the form it only updates the records that were in their list. You might need to use some `hidden inputs` on the page to store this data.

### Part Five - Deleting

We're going to wire up the `delete` button that we put in at the beginning now. Here's what to do:

- [ ] Make sure the button has a name attribute (you may as well call it `delete`) and a value attribute of the id that's being deleted.
- [ ] When the button is clicked, because it's within the `/list/:listId/update-todos` form, it will also submit the form. It should add a parameter of `delete` with the id of the todo as its value to the data being `post`ed to the server.
- [ ] Add a function to the `todos.js` file called `deleteTodo` which takes a list ID and a task id as arguments and removes that todo from the list.
- [ ] Modify your code so that if the `delete` value is set, you call the `deleteTodo` function you just made

And that's it - you've just made a fully functional To-Do app from scratch in just HTML and some server-side Javascript with a sprinkling of CSS to make it look nice. We'll be building on this app and extending and improving it (and completely rebuilding it eventually!).

It's important to understand what's actually going on under the hood with web applications and there's no better way than building it all up from scratch yourself. Obviously this isn't a very scalable way of building web applications, which is why all manner of frameworks exist to make it easier and more well-structured. We'll come to those eventually and hopefully they'll make more sense if you've already used the underlying techniques directly.

## Learning points

Use these points to question what you've done and to build your understanding of what you just built:

- [ ] Open the web inspector in your browser and look at the requests that are being made. Understanding the HTTP protocol is an extremely important part of being a web developer. You should look at the different headers that are being sent by the browser and then try to understand what each one does.
- [ ] Try to make sure your app is well structured - try to extract pieces of functionality out into their own functions which can live in their own files.
- [ ] Testing:
  - We intentionally didn't start with testing the functions that you created because it's good to see how useful testing is as a developer. Sometimes you have to try the hard way to appreciate the benefits.
  - When you added the new functions in `todo.js` how did you know they would work? Did you have to manually try them once you'd wired everything up to the browser?
  - If you were building a real-world app, then by adding tests for these functions before you'd used them in the app would mean you didn't have to do any manual clicking to see if they worked, you could just use them.
  - We'll come back to testing later on...
- [ ] We added the ability to delete a To-Do task, but could you have done this a different way? One common approach is to set a flag or date on a record when it is deleted and then modify your `getTodos` function to filter these out. This means that you have a record of the deletion and would also be able to undo it in the future. This might not seem important for something as basic as a To-Do item, but if it was something like an application for a job, this might be worth considering. As an exercise, see if you can modify the code to do this.
- [ ] You've experienced the pain that checkboxes can be - do some research into other ways of handling them, with and without client-side Javascript. [`html checkbox form unchecked`]
- [ ] This is a very simple web application - do you feel the code was understandable and manageable? How big do you think it could get before it started to feel unmanageable? This is one of the main reasons web application frameworks exist; people rolled their own ways of doing things, found that they because unmanageable at scale and built a framework to make it easier to structure and understand applications.
