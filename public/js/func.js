const TYPES = Object.freeze({
    GAUGE: 1,
    BUTTON: 2,
    LABEL: 3
})

/* 
    Default options object for gauges
*/
const defaultGaugeOpts = {
    angle: 0,
    lineWidth: 0.2,
    radiusScale: 0.9,
    pointer: {
        length: 0.40,
        strokeWidth: 0.05,
        color: '#000000'
    },
    renderTicks : {
        divisions: 10,
        divWidth: 0.6,
        divColor: '#333333'
    },
    limitMax: true,
    limitMin: true,
    highDpiSupport: true
}

/*
    Add object depending on its type 
*/
function addObject(element) {
    switch (element.type) {
        case TYPES.GAUGE:
            return addGauge(element);
    }
}

/*
    Add gauge object to specified in monitoredItemConfig DOM element
*/
function addGauge(obj) {
    var target = document.getElementById(obj.elem);
    let opts = Object.assign({}, defaultGaugeOpts);
    opts.staticLabels = {
        font: "12pt sans-serif", 
        labels: [obj.min, (obj.min + obj.max)/2, obj.max],
    };
    var gauge = new Gauge(target).setOptions(opts);
    if (obj.label) {
        document.getElementById(obj.elem + "_label").className = "gauge-text";
        gauge.setTextField(document.getElementById(obj.elem + "_label"));
    }
    gauge.animationSpeed = 8;
    gauge.maxValue = obj.max;
    gauge.minValue = obj.min;
    gauge.set(obj.min);
    return gauge;
}


/*
    Update object value depending on its type 
*/
function updateObject(nodeId, value) {
    for (obj of monitoredItemConfig) {
        if (obj.nodeId == nodeId) {
            switch (obj.type) {
                case TYPES.GAUGE:
                    updateGauge(obj.obj, value);
                    break;
            }
        }
    }
}

/*
    Update gauge value in monitoredObjects array
*/
function updateGauge(obj, value) {
    try {
        oobj.set(rescale(value, obj.min, obj.max));
    } catch (e) {
        console.log(e);
    }
}


/*
    Rescale 0-1 real to min - max range
*/
function rescale(val, min, max) {
    return (val * (max - min) + min);
}