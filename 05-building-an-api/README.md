# Building an API around your data model

We've already looked at separation of content and presentation when it comes to HTML, but it's also good to be able to expose access to your core data programmatically rather than just via a web interface. This is known as an API or Application Programming Interface. There are many different types of APIs, some are internal to your code (the data functions you defined in step 3 are an API, e.g. `getTodos()`) and some make data accessible outside of your application. In this step we'll be focussing on the latter.

We're going to build an API using one of the most common patterns in modern web services; `JSON` over `HTTP`. In addition to that we'll be applying `ReSTful` concepts to make it consistent and easier to use. `ReST` stands for Representational State Transfer, which doesn't tell you a whole lot about what it actually means. In simple terms, ReST is a way of representing a data model and then performing operations on it via standard HTTP requests (e.g. GET, PUT, POST, DELETE).

We're going to continue working in the app folder on your existing web application.

## Task

### Part One - Designing the API

We have two data models we're going to build our API around; `list`s and `todo`s. These have a hierarchical relationship in that `todo`s belong to `list`s. This can be represented in a URL like: `/lists/:listId/todos/:todoId`.

ReSTful APIs generally model operations in the common `CRUD` pattern (`CREATE`, `READ`, `UPDATE`, `DELETE`). We will map HTTP "verbs" or "actions" on to these to achieve what we want to with our API. The standard mapping for this is:

- `CREATE`: Uses the `POST` HTTP verb
- `READ`: Uses the `GET` HTTP verb
- `UPDATE`: Uses either the `PUT` or `PATCH` HTTP verbs. Technically, `PATCH` should be used to update part of a resource on the server, whilst `PUT` should be used to replace it completely
- `DELETE`: Uses the `DELETE` HTTP verb

By separating the data model from the operations you perform on it, it becomes easier for users of the API to understand how it works. This is one of the big successes of the ReSTful approach.

#### The data model

We already have data structures designed for the data objects we are representing in our API:

##### Lists

```
{
  "id": "shopping",
  "name": "My Shopping List",
  "count": 3
}
```

Note that we are not exposing the internal ID of the list - this is mainly because we don't need to as it's only used internally for linking database records together. It's good practice to design your API independently of your database schema. If you let the internals of your database implementation leak out into your API then you end up making it harder to make changes internally without affecting your external representation.

##### Todos

```
{
  "id": 1,
  "task": "Learn some HTML",
  "complete": true
}
```

Note that we are using the id of the record to refer to the individual todo item, so in this case we do include the id in the API output

#### Status Codes

You should use status codes to communicate to the user of the API what happened whan they used it. Some common codes you would expect to use are:

Success:

- `200` - OK. This is a generic success code. You'll often use a more specific 2XX code
- `201` - Created. You should use this whenever you create an object on the server, though you can also use a redirect (see below)
- `204` - No Content. You would normally use this to indicate that an action was successful but you aren't returning anything from the server, e.g. DELETE

Redirection:

- `303` - See Other. This is used to indicate to the client that they should refer to a new document - e.g. when you create something, this is useful to tell the client which URL it is now at. Also, HTTP clients can follow the redirect automatically and load the data straight away to retrieve any server generated attributes (e.g. the ID)

Client Error:

- `400` - Bad Request. This is a generic way of saying the client did something they weren't expected to and it was not allowed
- `401` - Unauthorized. If you add authentication then this is how you would deny access to the API
- `404` - Not Found. If a client requests something that doesn't exist this code would be used
- `422` - Unprocessable Content. If you are unable to parse the JSON data sent then you would use this code

Server Error:

- `500` - Internal Server Error. If your code raises an unexpected exception then you would normally return this status code

There are many more HTTP status codes but these are the ones you would normally use in your application code. [`http status codes`]


#### The API Endpoints

To follow the ReSTful standard, we should use the following routes to create our API. Also, so we can differentiate between the API endpoints and our regular endpoints, I've added `/api/` at the beginning of the API.

- `GET`: `/api/lists` - Return an array of all of the lists in the API
- `POST`: `/api/lists` - POST a list object as JSON to create it
- `PATCH`: `/api/lists/:listId` - Update the fields of a single list by sending a partial list object as JSON
- `DELETE`: `/api/lists/:listId` - Delete an individual list
- `GET`: `/api/lists/:listid/todos` - Return an array of all of the todos for a specific list
- `POST`: `/api/lists/:listId/todos` - POST a todo object as JSON to create a todo
- `PATCH`: `/api/lists/:listId/todos/:todoId` - Update the fields of a single todo by sending a partial todo object as JSON (e.g. mark it as complete)
- `DELETE`: `/api/lists/:listId/todos/:todoId` - Delete a todo item from a list

Note how all of these API endpoints follow the same pattern. Everything you need to do to manipulate your data model is represented in this simple set of endpoints.

### Part Two - Building the API

We'll run through what it takes to build a set of four endpoints to enable you to manipulate the data model for lists via the API together and then you can repeat the pattern to build the endpoints for manipulating individual todo items.

#### Aside - testing the API

There are many tools you can use to send requests to your API. Many people use [Postman](https://www.postman.com) as a visual tool to exercise an API and this can be very useful to store common requests to repeatedly test the API.

If you're just wanting to send a simple request to the API, it's worth spending a few minutes to get to know the command line tool called `curl`. With this you can easily test your API and see the exact response from the server in your command line. Some examples:

```bash
# Do a simple GET request to a URL and print the result
curl http://localhost:8000/api/lists

# Add the -v flag to any request to make it verbose and print the HTTP headers too
curl -v http://localhost:8000/api/lists

# Make a DELETE request to a server
curl -X DELETE http://localhost:8000/api/lists/delete_me

# POST some data to a server
curl -X POST --data '{"id": "new-list", "name": "My New List"}' http://localhost:8000/api/lists

# Pipe the retrieved JSON into jq (you'll need to install this first with Homebrew) so it is formatted nicely
curl http://localhost:8000/api/lists | jq
```

#### Build the GET endpoint

Using your knowledge of `express` you should now:

- [ ] Add a `GET` endpoint to your `index.js` file for `/api/lists`
- [ ] Use `JSON.stringify()` to turn the lists you retrieve from `getLists()` into text
- [ ] Send the JSON string back with an appropriate mime type for json in the `Content-Type` header as you did in step 3 for HTML [`json mime type`]
- [ ] Refactor this to use the built-in `json()` method in `express` so you can understand what this function is actually doing [`express send json`]
- [ ] Use `curl` with the `-v` flag to retrieve data from this endpoint and check the headers look correct

#### BUILD the POST endpoint

Continue your build to add an endpoint for creating new lists:

- [ ] Add a `POST` endpoint to your `index.js` file for `/api/lists`
- [ ] Add middleware to express to parse the JSON body you are sending [`express bodyparser json`]
- [ ] Use the data sent in the JSON to create a new list. You'll need to use the functions you created in the `todos-sqlite.js` file from earlier. 
- [ ] You should have just created a new list, you can either return a `Created` status code or redirect to the URL of the new object. The benefit of the redirect is that the client is told where the new resource is.
- [ ] Add error handling to make sure the JSON you received was valid and has the required fields
- [ ] Add more error handling - if the user tries to create a list with a duplicate `url_id` you should handle this properly and return an error status code as well as an error message JSON object so the user knows why the request failed. Note, an alternative to letting the user provide the `url_id` is to try to turn the name of the list into the `url_id` yourself and then add a number to the end if it already exists.

#### BUILD the PATCH endpoint

Continue your build to add an endpoint for editing lists:

- [ ] Add a `PATCH` endpoint to your `index.js` file for `/api/lists/:listId`
- [ ] This endpoint should receive a partial `list` object as JSON, e.g. `{"name": "New Name"}`
- [ ] Use the data that this endpoint receives to update the name of the list.
- [ ] Add some validation to make sure the user can't update the other fields of the record in the database (we don't want them editing the id of the record!)
- [ ] Add some error handling to make sure the JSON you received was valid and that the record could be found

#### BUILD the DELETE endpoint

Continue your build to add an endpoint for deleting lists:

- [ ] Add a `DELETE` endpoint to your `index.js` file for `/api/lists/:listId`
- [ ] This endpoint should just delete the record that matches the `listId` provided and return the correct status code.

### Build out the rest of the endpoints

The remaining endpoints for operations on `todos` should now be added. You should find that these are mostly a copy-paste from the endpoints you just created.

## Learning points

Use these points to question what you've done and to build your understanding of what you just built:

- [ ] Notice how the endpoints you created for different object types were very similar. This is one of the benefits of a ReSTful approach - you define the data models and then you perform standard operations on them.
- [ ] How would you go about documenting your new API? There are tools that help you do this. Try and use OpenAPI to document your endpoints. [`openapi`]
- [ ] Make sure your API is consistent - that it uses JSON throughout and that the status codes and URL patterns it uses are always the same for different object types. Consistency is one of the key factors of a well-constructed API.
