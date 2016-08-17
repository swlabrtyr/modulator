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

let freqInput = document.getElementById("freq");
freqInput.addEventListener("change", () => {
    frequency = freqInput.value;
    console.log(freqInput.value);
});

let ampInput = document.getElementById("amp");

ampInput.addEventListener("change", () => {
    amplitude = ampInput.value;
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

startBtn.addEventListener("click", () => {
    src = modulation(createOsc("sawtooth", 220, 0.3),
                     createOsc("sine", frequency, amplitude),
                     toggle);
    
    src.car.osc.start(audioContext.currenTime);
    src.mod.osc.start(audioContext.currentTIme);
});

let stopBtn = document.getElementById("stop");

stopBtn.addEventListener("click", () => {
    src.car.osc.stop(audioContext.currenTime);
    src.mod.osc.stop(audioContext.currentTIme);
});

// BE WARY OF INPUT VALUES IN CASE OF AM














