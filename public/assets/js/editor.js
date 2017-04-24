// require our dependecies
var rethink = require('rethinkdb');
var express = require('express');
var favicon = require('serve-favicon');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
var room = getParameterByName('room');
var user = getParameterByName('user');
document.getElementById("username").innerHTML = user;

var myCodeMirror = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,
    mode: "javascript"
});
var socket = io();

$.ajax({
    url: '/getData/' + room,
    success: function(result, status, xhr) {
        myCodeMirror.setValue(result.value);
        console.log(result);
    }
});

myCodeMirror.on('keyup', function () {
    var msg = {
        id: room,
        user: user,
        value: myCodeMirror.getValue()
    }
    socket.emit('document-update',msg);
}); 

socket.on('doc', function(msg){
    if(msg.new_val.id === room && msg.new_val.user != user) {
        var current_pos = myCodeMirror.getCursor();
        myCodeMirror.getDoc().setValue(msg.new_val.value);
        myCodeMirror.setCursor(current_pos);    
    }
});