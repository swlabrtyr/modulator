const audioContext = new AudioContext();
const output = audioContext.createGain();

const canvas = document.querySelector('.visualizer');
canvas.style.margin = 'auto';
const canvasContext = canvas.getContext("2d");
const WIDTH = document.body.clientWidth;
const HEIGHT = document.body.clientHeight - 300;
const analyser = audioContext.createAnalyser();

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

let filter = audioContext.createBiquadFilter();

// reverb
let soundSrc, IRBuffer;
let convolver = audioContext.createConvolver();
let url = 'https://raw.githubusercontent.com/swlabrtyr/modulator/gh-pages/Large%20Wide%20Echo%20Hall.wav';

function createCORSRequest(method, url){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined"){
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}

let ajaxRequest = new createCORSRequest('GET', url);

ajaxRequest.open('GET', url, true);

ajaxRequest.responseType = 'arraybuffer';
ajaxRequest.onload = () => {
    let audioData = ajaxRequest.response;
    audioContext.decodeAudioData(audioData, (buffer) => {
        IRBuffer = buffer;
        soundSrc = audioContext.createBufferSource();
        soundSrc.buffer = IRBuffer;
    }, (e) => {
       console.log('error decoding data' + e.err);
    });
};

ajaxRequest.send();
convolver.buffer = IRBuffer;

//distortion
let distortion = audioContext.createWaveShaper();

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

distortion.curve = makeDistortionCurve(400);

filter.type = "lowpass";
filter.frequency.value = 1500;

let startBtn = document.getElementById("start");

let carSelect = 0;
let modSelect = 0;
let carWaveform, modWaveform;

startBtn.addEventListener("click", () => {

    if (carSelect === 0) {
        carWaveform = "square";
    } else if (carSelect === 1) {
        carWaveform = "sawtooth";
    } else if (carSelect === 2) {
        carWaveform = "triangle";
    } else {
        carWaveform = "sine";
    }

    if (modSelect === 0) {
        modWaveform = "square";
    } else if (modSelect === 1) {
        modWaveform = "sawtooth";
    } else if (modSelect === 2) {
        modWaveform = "triangle";
    } else {
        modWaveform = "sine";
    }
    
    let carrier = createOsc(carWaveform, 440, 0.3);
    let modulator = createOsc(modWaveform, /* rate */ frequency, /* depth */ amplitude);

    src = modulation(carrier, modulator, toggle);
    
    src.car.osc.start(audioContext.currentTime);
    src.mod.osc.start(audioContext.currentTIme);

    src.car.gain.connect(distortion);
    distortion.connect(filter);
    filter.connect(convolver);
    convolver.connect(output);
    
    src.car.osc.connect(analyser);

    analyser.connect(audioContext.destination);    
    draw();
});

let stopBtn = document.getElementById("stop");

stopBtn.addEventListener("click", () => {
    src.car.osc.stop(audioContext.currentTime);
    src.mod.osc.stop(audioContext.currentTIme);

    canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
});



/*

AudioKeys

*/

let polySrc;

keyboard.down(function(note) {
    if(mute) return;

    if (carSelect === 0) {
        carWaveform = "square";
    } else if (carSelect === 1) {
        carWaveform = "sawtooth";
    } else if (carSelect === 2) {
        carWaveform = "triangle";
    } else {
        carWaveform = "sine";
    }

    if (modSelect === 0) {
        modWaveform = "square";
    } else if (modSelect === 1) {
        modWaveform = "sawtooth";
    } else if (modSelect === 2) {
        modWaveform = "triangle";
    } else {
        modWaveform = "sine";
    }
    
    polySrc = modulation(createOsc(carWaveform, note.frequency, 0.3),
                         createOsc(modWaveform, note.frequency*3, amplitude),
                         toggle);
    
    // polySrc.car.osc.start(audioContext.currentTime);
    // polySrc.mod.osc.start(audioContext.currentTime);
    
    oscillators[note.note] = {
        oscillator: polySrc
    };
    oscillators[note.note].oscillator.car.osc.start(audioContext.currentTime);
    oscillators[note.note].oscillator.mod.osc.start(audioContext.currentTime);
    // polySrc.car.osc.connect(analyser);

    oscillators[note.note].oscillator.car.osc.connect(filter);
    filter.connect(analyser);
    analyser.connect(audioContext.destination);    

    draw();
});

keyboard.up(function(note) {
    if (mute) return;

    if (oscillators[note.note]) {

        console.log(oscillators[note.note]);

        oscillators[note.note].oscillator.car.osc.stop(audioContext.currentTime + 0.8);
        oscillators[note.note].oscillator.mod.osc.stop(audioContext.currentTime + 0.8);
        
        delete oscillators[note.note];
    }
});

// Visualizer

canvasContext.clearRect(0, 0, WIDTH, HEIGHT);

let bufferLength = analyser.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);

function draw() {
    let drawVisual = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    canvasContext.fillStyle = 'rgb(100, 20, 159)';
    canvasContext.fillRect(0, 0, WIDTH, HEIGHT);
    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = 'rgb(30, 200, 100)';

    canvasContext.beginPath();
    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        
        let v = dataArray[i] / 128.0;
        let y = v * HEIGHT/2;

        if (i === 0) {
            canvasContext.moveTo(x, y);
        } else {
            canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
    };
    
    canvasContext.lineTo(canvas.width, canvas.height/2);
    canvasContext.stroke();
};



