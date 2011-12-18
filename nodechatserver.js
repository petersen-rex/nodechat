var http = require("http"),  
    url = require("url"),  
    path = require("path"),  
    fs = require("fs"),
    events = require("events");  
  
var responses = [];
var msgCnt = 0;

function handleStaticFileRequest(request, response) {  
    var uri = url.parse(request.url).pathname;  
    var filename = path.join(process.cwd(), uri);  
    path.exists(filename, function(exists) {  
        if(!exists) {  
            response.writeHead(404, {"Content-Type": "text/plain"});  
            response.write("404 Not Found\n");  
            response.end();  
            return;  
        }  
  
        fs.readFile(filename, "binary", function(err, file) {  
            if(err) {  
                response.writeHead(500, {"Content-Type": "text/plain"});  
                response.write(err + "\n");  
                response.end();  
                return;  
            }  
  
            response.writeHead(200);  
            response.write(file, "binary");  
            response.end();  
        });  
    });  
};

function handleRequest(request, response){
    var uri = url.parse(request.url).pathname;  

    response.endJson = function (code, obj) {
        var body = new Buffer(JSON.stringify(obj));
        response.writeHead(code, { "Content-Type": "text/json"
                            , "Content-Length": body.length
                            });
        response.end(body);
      };
    
    if (uri === "/recv"){
    	responses.push({ 'timestamp': new Date(), 'response': response});
    } else if (uri === "/send"){
    	var msgObj = url.parse(request.url, true).query;
    	var msg = msgObj.msg;
    	var id  = msgObj.id;
    	// send to all waiting clients and delete (they will reconnect)
    	while(responses.length>0){
            responses[0].response.endJson(200, {'msg': id+' : ' + msg});
            responses.splice(0,1);
    	}
    	
        response.end(">" +  msg);
    } else {
    	handleStaticFileRequest(request, response);
    }  
}


var server = http.createServer(handleRequest);
server.listen(8080);
console.log("Server running at http://localhost:8080/");  
