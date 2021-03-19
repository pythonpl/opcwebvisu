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

function addGauge(id) {
    var target = document.getElementById(monitoredItemConfig[id].elem);
    var gauge = new Gauge(target).setOptions(defaultGaugeOpts);
    gauge.maxValue = monitoredItemConfig[id].max;
    gauge.minValue = monitoredItemConfig[id].min;
    gauge.set(monitoredItemConfig[id].min);
    return gauge;
}

function updateObject(id, value){
    switch(monitoredItemConfig[id].type){
        case TYPES.GAUGE:
            updateGauge(id, value);
            break;
    }
}

function updateGauge(id, value){
    objects[id].set(rescale(value, monitoredItemConfig[id].min, monitoredItemConfig[id].max));
}

function rescale(val, min, max){
    return (val * (max-min) + min);
}