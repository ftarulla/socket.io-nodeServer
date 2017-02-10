// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 3000;

//
var fs = require('fs');
const spawn = require("child_process").spawn;

// http://stackoverflow.com/questions/15515549/node-js-writing-a-function-to-return-spawn-stdout-as-a-string
const runPython = function(args, callback) {

    // http://ourcodeworld.com/articles/read/286/how-to-execute-a-python-script-and-retrieve-output-data-and-errors-in-node-js
    const uint8arrayToString = function(data){
      return String.fromCharCode.apply(null, data);
    };

    // https://nodejs.org/api/child_process.html
    var proc = spawn('python', args);

    var result = "";
    proc.stdout.on('data', function(data) {
      result += uint8arrayToString(data);
    });
    proc.stdout.on('close', function(code) {
      callback(result);
    });
}



//
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    console.log("New Message!");
    //console.log(data);

    if (data.image) {
      console.log("SAVING ...");
      var bitmap = new Buffer(data.image, 'base64');
      fs.writeFileSync('./bla.png', bitmap);
      console.log("DONE!");

      //
      runPython(['./fast.py', 'bla.png'], function(result) {
        console.log(result);
        console.log(result.indexOf("{"));
        var parsed = JSON.parse( result.substring(result.indexOf("{")) );
        console.log(parsed.keypoints[42]);

        console.log("sending fast response");
        socket.emit('fast response', {
          username: socket.username,
          message: parsed.keypoints[42]
        });

      });
    }

    // // we tell the client to execute 'new message'
    // socket.broadcast.emit('new message', {
    //   username: socket.username,
    //   message: data
    // });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    console.log("New User!");

    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    console.log("User Start Typing!");
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    console.log("User Stop Typing!");
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    console.log("Disconnect!");
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
