const audioContext = new AudioContext();
const output = audioContext.createGain();
const canvas = document.querySelector('.visualizer');

let myCanvas = canvas.getContext("2d");
let WIDTH = 800;
let HEIGHT = 600;

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
        osc : (function() {

            let osc = audioContext.createOscillator();
            
            osc.type = type;
            osc.frequency.value = freq;
            console.log(freq);

            return osc;
        })(),

        gain : (function() {

            let gain = audioContext.createGain();

            // gain.gain.value = 0;
            gain.gain.value = amp;
            console.log(amp);
            return gain;
        })(),
        
        connect : function() {
            this.osc.connect(this.gain);
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
    frequency = parseInt(freqInput.value);
    console.log("freq value: ", freqInput.value);
});

let ampInput = document.getElementById("amp");

ampInput.addEventListener("change", () => {
    amplitude = parseInt(ampInput.value);

    // BE WARY OF INPUT VALUES IN CASE OF AM
    if (toggle === "AM" && parseInt(ampInput.value) > 1.0) {
        console.log("your ears kna sai sia");
        alert("Your amplitude value is too high! For the sake of your ears && speakers, use values less than 1.0!");
    }
    
    console.log("amp value: ", ampInput.value);
});

function modulation(car, mod, typeofmod) {
    
    car.connect();
    mod.connect();        
    
    if (typeofmod === "FM") {

        mod.gain.connect(car.osc.frequency);
        
    } else if (typeofmod === "AM") {
        
        mod.gain.connect(car.gain.gain);
        
   }

    return {
        mod: mod,
        car: car
    };
}

let src;
let analyser = audioContext.createAnalyser();

let filter = audioContext.createBiquadFilter();
filter.type = "lowpass";
filter.frequency.value = 50;

let startBtn = document.getElementById("start");

startBtn.addEventListener("click", () => {

    let carrier = createOsc("sawtooth", 440, 0.3);
    let modulator = createOsc("triange", /* rate */ frequency, /* depth */ amplitude);

    src = modulation(carrier, modulator, toggle);

    src.car.osc.start(audioContext.currentTime);
    src.mod.osc.start(audioContext.currentTIme);

    src.car.gain.connect(filter);
    filter.connect(output);
    
    src.car.osc.connect(analyser);

    analyser.connect(audioContext.destination);    
    draw();
});

let stopBtn = document.getElementById("stop");

stopBtn.addEventListener("click", () => {
    src.car.osc.stop(audioContext.currentTime);
    src.mod.osc.stop(audioContext.currentTIme);

    myCanvas.clearRect(0, 0, WIDTH, HEIGHT);
});



/*

AudioKeys

*/

let polySrc;

keyboard.down(function(note) {
    if(mute) return;

    polySrc = modulation(createOsc("square", note.frequency, 0.3),
                         createOsc("sine", note.frequency*3, amplitude),
                         toggle);
    
    polySrc.car.osc.start(audioContext.currentTime);
    polySrc.mod.osc.start(audioContext.currentTime);
    
    oscillators[note.note] = {
        oscillator: polySrc
    };
    
    polySrc.car.osc.connect(analyser);
    
    analyser.connect(audioContext.destination);    
    console.log(polySrc);
    draw();
});

keyboard.up(function(note) {
    if (mute) return;

    if (oscillators[note.note]) {

        polySrc.car.osc.stop(audioContext.currentTime + 0.8);
        polySrc.mod.osc.stop(audioContext.currentTime + 0.8);
        
        delete oscillators[note.note];
    }
    // polySrc.car.osc.stop(audioContext.currentTime + 0.8);
    // polySrc.mod.osc.stop(audioContext.currentTime + 0.8);
});

// Visualizer

myCanvas.clearRect(0, 0, WIDTH, HEIGHT);

let bufferLength = analyser.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);

function draw() {
    let drawVisual = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);
    
    myCanvas.fillStyle = 'rgb(300, 200, 20)';
    myCanvas.fillRect(0, 0, WIDTH, HEIGHT);
    myCanvas.lineWidth = 2;
    myCanvas.strokeStyle = 'rgb(20, 30, 80)';

    myCanvas.beginPath();
    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;
    
    for(let i = 0; i < bufferLength; i++) {
        
        let v = dataArray[i] / 128.0;
        let y = v * HEIGHT/2;

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

















