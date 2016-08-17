const audioContext = new AudioContext();
const output = audioContext.createGain();

output.gain.value = 0.2;
output.connect(audioContext.destination);

let freq, amp;

let freqInput = document.getElementById("freq");
let ampInput  = document.getElementById("amp");

freq = freqInput.value = parseInt("0");
amp  = ampInput.value = parseInt("0");


function getFreq() {
    return freqInput.value;
    console.log(freqInput.value);
}

function getAmp() {
    return ampInput.value;
    console.log(ampInput.value);
}

freqInput.addEventListener("input", () => {
    freq = parseInt(getFreq());

    console.log(freq, amp);
});

ampInput.addEventListener("input", () => {
    amp = parseInt(getAmp());

    console.log(freq, amp);
});

// BE WARY OF INPUT VALUES IN CASE OF AM

modulation(freq, amp, "FM");

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

function modulation(freq, amnt, typeofmod) {
    console.log("modulation: ", freq, amnt);
    let carrier;
    let mod;
    
    let startBtn = document.getElementById("start");

    startBtn.addEventListener("click", () => {

        carrier = createOsc("sawtooth", 220, 0.5);
        carrier.connect();
        
        mod = createOsc("sine", freq, amnt);
        mod.connect();        
       
        if (typeofmod === "FM") {

            mod.gain.connect(carrier.osc.frequency);
            
        } else if (typeofmod === "AM") {
            
            mod.gain.connect(carrier.gain.gain);
            
        }

        carrier.connectToOutput();
        
        mod.osc.start(audioContext.currenTime);
        carrier.osc.start(audioContext.currentTIme);
    });

    let stopBtn = document.getElementById("stop");

    stopBtn.addEventListener("click", () => {

        mod.osc.stop(audioContext.currenTime);
        carrier.osc.stop(audioContext.currentTime);
    });
}









