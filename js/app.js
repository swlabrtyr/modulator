const audioContext = new AudioContext();
const output = audioContext.createGain();

window.keyboard = new AudioKeys({
    polyphony: 3,
    rows: 1,
    priority: 'last'
});

let AKtoggle = document.getElementById('AKtoggle');
let mute = true;

AKtoggle.addEventListener('click', function() {
    mute = !mute;
    if (!mute) {
        AKtoggle.innerHTML = "Press to stop";
    }
    else {
        AKtoggle.innerHTML = "Click for AudioKeys";
    }
});

let oscillators = {};

output.gain.value = 0.2;
output.connect(audioContext.destination);

function createOsc(type, freq, amp) {
    return {
        osc  : (function() {

            let osc = audioContext.createOscillator();

            osc.type = type;
            osc.frequency.value = freq;
            // osc.frequency.value = 100;

            return osc;
        })(),

        gain : (function() {

            let gain = audioContext.createGain();

            gain.gain.value = amp;
            // gain.gain.value = 0.5;

            return gain;
        })(),
        
        connect : function() {
            this.osc.connect(this.gain);
        },

        connectToOutput : function () {
            this.gain.connect(output);
        }
    };
}

let toggle = "FM";

let amInput = document.getElementById("am-on");
let fmInput = document.getElementById("fm-on");

amInput.addEventListener("change", function() {
    toggle = "AM";
});

fmInput.addEventListener("change", function() {
    toggle = "FM";
});

let frequency = 0, amplitude = 0;

let freqInput = document.getElementById("freq");
freqInput.addEventListener("change", () => {
    frequency = freqInput.value;
    console.log(freqInput.value);
});

let ampInput = document.getElementById("amp");

ampInput.addEventListener("change", () => {
    amplitude = ampInput.value;

    // BE WARY OF INPUT VALUES IN CASE OF AM
    if (toggle === "AM" && parseInt(ampInput.value) > 1.0) {
        console.log("your ears kna sai sia");
        alert("Your amplitude value is too high! For the sake of your ears && speakers, use values less than 1.0!");
    }
    
    console.log(ampInput.value);
});

function modulation(car, mod, typeofmod) {
    
    car.connect();
    mod.connect();        
    
    if (typeofmod === "FM") {

        mod.gain.connect(car.osc.frequency);
        
    } else if (typeofmod === "AM") {
        
        mod.gain.connect(car.gain.gain);
        
    }

    car.connectToOutput();

    return {
        mod: mod,
        car: car
    };
}

let src;
let startBtn = document.getElementById("start");
let analyser = audioContext.createAnalyser();

startBtn.addEventListener("click", () => {
    src = modulation(createOsc("sawtooth", 220, 0.3),
                     createOsc("sine", frequency, amplitude),
                     toggle);
    
    src.car.osc.start(audioContext.currenTime);
    src.car.osc.connect(analyser);
    analyser.connect(audioContext.destination);
    src.mod.osc.start(audioContext.currentTIme);
    draw();
});

let stopBtn = document.getElementById("stop");

stopBtn.addEventListener("click", () => {
    src.car.osc.stop(audioContext.currenTime);
    src.mod.osc.stop(audioContext.currentTIme);
});

let polySrc;

keyboard.down(function(note) {
    if(mute) return;

    polySrc = modulation(createOsc("square", note.frequency, 0.3),
                         createOsc("sine", note.frequency*3, amplitude),
                         toggle);

    // let gain = audioContext.createGain();
    // gain.gain.value = 0.5;
    
    // polySrc.car.osc.connect(gain);
    // gain.connect(output);
    let filter = audioContext.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.value = 50;

    polySrc.car.gain.connect(filter);
    
    polySrc.car.osc.start(audioContext.currentTime);
    polySrc.mod.osc.start(audioContext.currentTime);
    
    oscillators[note.note] = {
        oscillator: polySrc//,
        // gain: gain
    };
});

keyboard.up(function(note) {
    if (mute) return;

    if(oscillators[note.note]) {

        polySrc.car.osc.stop(audioContext.currentTime + 0.8);
        polySrc.mod.osc.stop(audioContext.currentTime + 0.8);
        
        delete oscillators[note.note];
    }
});

// Visualizer
var canvas = document.querySelector('.visualizer');
var myCanvas = canvas.getContext("2d");
var WIDTH = 600;
var HEIGHT = 600;

myCanvas.clearRect(0, 0, WIDTH, HEIGHT);

var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

function draw() {
    let drawVisual = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);
    
    myCanvas.fillStyle = 'rgb(200, 200, 200)';
    myCanvas.fillRect(0, 0, WIDTH, HEIGHT);
    myCanvas.lineWidth = 2;
    myCanvas.strokeStyle = 'rgb(0, 0, 0)';

    myCanvas.beginPath();
    var sliceWidth = WIDTH * 1.0 / bufferLength;
    var x = 0;
    
    for(var i = 0; i < bufferLength; i++) {
        
        var v = dataArray[i] / 128.0;
        var y = v * HEIGHT/2;

        if(i === 0) {
            myCanvas.moveTo(x, y);
        } else {
            myCanvas.lineTo(x, y);
        }

        x += sliceWidth;
    };
    
    myCanvas.lineTo(canvas.width, canvas.height/2);
    myCanvas.stroke();
};

















