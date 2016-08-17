const audioContext = new AudioContext();
const output = audioContext.createGain();

output.gain.value = 0.2;
output.connect(audioContext.destination);

function createOsc(type, freq, amp) {
    console.log("createOsc: ", freq, amp);
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

function modulation(typeofmod) {

    let carrier, mod;

    carrier = createOsc("sawtooth", 220, 0.5);
    carrier.connect();
    
    mod = createOsc("sine", frequency, amplitude);
    mod.connect();        
    
    if (typeofmod === "FM") {

        mod.gain.connect(carrier.osc.frequency);
        
    } else if (typeofmod === "AM") {
        
        mod.gain.connect(carrier.gain.gain);
        
    }

    carrier.connectToOutput();
}

let freqInput = document.getElementById("freq");
let ampInput  = document.getElementById("amp");

function getFreq() {
    return freqInput.value;
    console.log(freqInput.value);
}

function getAmp() {
    return ampInput.value;
    console.log(ampInput.value);
}

freqInput.addEventListener("input", () => {
    frequency = parseInt(getFreq());

    console.log(frequency, amplitude);
});

ampInput.addEventListener("input", () => {
    amplitude = parseInt(getAmp());

    console.log(frequency, amplitude);
});


let startBtn = document.getElementById("start");

startBtn.addEventListener("click", () => {
    mod.osc.start(audioContext.currenTime);
    carrier.osc.start(audioContext.currentTIme);
});

let stopBtn = document.getElementById("stop");

stopBtn.addEventListener("click", () => {

    mod.osc.stop(audioContext.currenTime);
    carrier.osc.stop(audioContext.currentTime);
});

// BE WARY OF INPUT VALUES IN CASE OF AM
modulation(toggle);













