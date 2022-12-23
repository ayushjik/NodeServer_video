var fs = require('fs');
var http = require('http');
var https = require('https');
const app = require("express")();
// const server = require("http").createServer(app);
var httpServer = http.createServer(app);
var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
// var privateKey  = fs.readFileSync('../../../key.pem', 'utf8');
// var certificate = fs.readFileSync('./server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);

const cors = require("cors");

const io = require("socket.io")(httpsServer, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

// const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		console.log("answerCall:-"+userToCall+" signalData:- "+signalData+" from:- "+from+" name" );
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		console.log("answerCall:-"+data+" dataValue:-"+data.value+" dataObject:-"+ data.object);
		io.to(data.to).emit("callAccepted", data.signal)
	});
	socket.on("message",(data2)=>{
		socket.broadcast.emit('message',data2)
		console.log("its Work for sending",data2)
	})
});
httpServer.listen(5001, () => console.log(`Server is running on port 5001`));
httpsServer.listen(5000, () => console.log(`Server is running on port 5000`));
