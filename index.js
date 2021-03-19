const express = require("express");
const socketIO = require("socket.io");
const port = 3700;
const fs = require('fs');
const app = express();

app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);

const io = socketIO.listen(app.listen(port));

app.get('/', (req, res) => { res.send('public/index.html') })

const {
    AttributeIds,
    OPCUAClient,
    TimestampsToReturn,
} = require("node-opcua");

const endpointUrl = "opc.tcp://localhost:9000";


const OPC_monitoredItems = [
    {
        nodeId: 'ns=2;i=2',
        attributeId: AttributeIds.Value
    }
];

const OPC_readableItems = {
    WorkSignal: {
        nodeId: 'ns=2;i=3',
        attributeId: AttributeIds.Value
    }
};

const OPC_writableItems = {
    WorkOrder: 'ns=2;i=3',
};

async function runServer() {
    let running = true;
    const client = OPCUAClient.create({
        endpoint_must_exist: false
    });
    
    client.on("backoff", (retry, delay) => {
        console.log("Retrying to connect to ", endpointUrl);
    });
    await client.connect(endpointUrl);
    console.log("Connected!");

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

    const OPC_items = (await subscription.monitorItems(OPC_monitoredItems, parameters, TimestampsToReturn.Both));

    OPC_items.on("changed", (monitoredItem, dataValue, index) => {
        io.sockets.emit('message', {

        });
    });

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

function main(){
    try {
        runServer();
    }catch(e){
        console.log(e);
        process.exit(-1);
    }
}


main()