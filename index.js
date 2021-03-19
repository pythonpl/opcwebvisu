const express = require("express");
const socketIO = require("socket.io");
const port = 3700;
const fs = require('fs');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.get('/', (req, res) => { res.send('public/index.html') })

server.listen(port, ()=> {});

const {
    AttributeIds,
    OPCUAClient,
    TimestampsToReturn,
} = require("node-opcua");

/* 
    OPC SERVER address
*/
const endpointUrl = "opc.tcp://localhost:9000";

/*
    Definition of nodes to be monitored by OPC client
*/
const OPC_monitoredItems = [
    {
        nodeId: 'ns=2;i=2',
        attributeId: AttributeIds.Value
    }
];

/*
    Definition of nodes that can be read by OPC client
*/
const OPC_readableItems = {
    WorkSignal: {
        nodeId: 'ns=2;i=3',
        attributeId: AttributeIds.Value
    }
};

/*
    Definition of nodes that can be written by OPC client
*/
const OPC_writableItems = {
    WorkOrder: 'ns=2;i=3',
};

/*
    Setup of OPC client and its behaviour
*/
async function runServer() {
    let running = true;
    const client = OPCUAClient.create({
        endpoint_must_exist: false
    });
    
    // Retry connection
    client.on("backoff", (retry, delay) => {
        console.log("Retrying to connect to ", endpointUrl);
    });
    await client.connect(endpointUrl);
    console.log("Connected!");

    // Create session and subscription after OPC client connected to server
    const session = await client.createSession();
    const subscription = await session.createSubscription2({
        requestedPublishingInterval: 500,
        requestedMaxKeepAliveCount: 20,
        requestedLifetimeCount: 6000,
        maxNotificationsPerPublish: 1000,
        publishingEnabled: true,
        priority: 10
    });

    const parameters = {
        samplingInterval: 100,
        discardOldest: true,
        queueSize: 100
    };

    // Create monitored items list in subscription
    const OPC_items = (await subscription.monitorItems(OPC_monitoredItems, parameters, TimestampsToReturn.Both));

    // Webvisu client connected
    io.sockets.on('connection', function (socket) {
        console.log('[socket.io]: client connected')
    });


    // Monitored item changed
    OPC_items.on("changed", (monitoredItem, dataValue, index) => {
        io.sockets.emit('updateMonitored', {
            // Monitored item ID
            nodeId: index,
            val: dataValue.value.value
        });
    });

    // Handle program exit
    process.on("SIGINT", async () => {
        if (!running) {
            return;
        }
        running = false;

        await subscription.terminate();

        await session.close();
        await client.disconnect();
        process.exit(0);
    });
}


/*
    Program entrance
*/
(() => {
    try {
        runServer();
    }catch(e){
        console.log(e);
        process.exit(-1);
    }
})();
