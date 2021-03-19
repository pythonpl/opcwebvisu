const TYPES = Object.freeze({
    GAUGE : 1
})

const defaultGaugeOpts = Object.freeze({
    angle: 0,
    lineWidth: 0.2,
    radiusScale: 0.9,
    pointer: {
        length: 0.40,
        strokeWidth: 0.05,
        color: '#000000'
    },
    limitMax: true,
    limitMin: true,
    highDpiSupport: true
})


/*
    Add gauge object to specified in monitoredItemConfig DOM element
*/
function addGauge(id) {
    var target = document.getElementById(monitoredItemConfig[id].elem);
    var gauge = new Gauge(target).setOptions(defaultGaugeOpts);
    gauge.maxValue = monitoredItemConfig[id].max;
    gauge.minValue = monitoredItemConfig[id].min;
    gauge.set(monitoredItemConfig[id].min);
    return gauge;
}


/*
    Update object value depending on its type 
*/
function updateObject(id, value){
    switch(monitoredItemConfig[id].type){
        case TYPES.GAUGE:
            updateGauge(id, value);
            break;
    }
}

/*
    Update gauge value in monitoredObjects array
*/
function updateGauge(id, value){
    monitoredObjects[id].set(rescale(value, monitoredItemConfig[id].min, monitoredItemConfig[id].max));
}


/*
    Rescale 0-1 real to min - max range
*/
function rescale(val, min, max){
    return (val * (max-min) + min);
}