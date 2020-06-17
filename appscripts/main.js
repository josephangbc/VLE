import Lid from "/components/Lid.js";
import Particle from "/components/Particle.js";
import Box from "/components/Box.js";
import Exchange from "/components/Exchange.js";
import RachfordRice from "/components/RachfordRice.js";

// Grab the div where we will put our Raphael paper
let centerDiv = document.getElementById("centerDiv");

// Create the Raphael paper that we will use for drawing and creating graphical objects
let paper = new Raphael(centerDiv);

// put the width and height of the canvas into variables for our own convenience

// RachFordRice Calculations
let Tslider = document.getElementById("temperature");
var T = Tslider.value;

let P = 101; // kPa
let components = ['n-Pentane','n-Heptane'];
let z = [0.30,0.70];


var R = new RachfordRice(2,T , P, components, z);
let y0 = R.y[0];
let x0 = R.x[0];
let vF = Math.min(Math.max(R.v, 0), 1); // Mole Fraction of vapor molecules

let volVap = 0.8; // Volume fraction of Vapor
let specs = [y0, x0, vF, volVap];

// Just create a box
let padding = 10;
var box = new Box(paper, padding);

// Create a lid
const lidH = 0;
const particleRadius = 10;
let numParticles = 20;
var lid = new Lid(paper, box, lidH, particleRadius, numParticles, specs);


// Get Containers for Particles
var vaporPhase = lid.vaporPhase;
var liquidPhase = lid.liquidPhase;

// Create Particle

let n0 = Math.round(R.z[0] * numParticles);
let n1 = numParticles - n0;
let nVap = Math.round(vF * numParticles);
let nLiq = numParticles - nVap;
let ny0 = Math.round(y0 * nVap);
let ny1 = nVap - ny0;
let nx0 = Math.round(x0 * nLiq);
let nx1 = nLiq - nx0;

// Create Exchange Record
var ExchangeRecord = new Exchange(ny0, ny1, nx0, nx1);

let particleArray = Array(numParticles);

for (let i = 0; i < numParticles; i++) {
    if (i  < ny0) {
        particleArray[i] = new Particle(paper, vaporPhase, liquidPhase, particleRadius, particleArray, 0, 'V', ExchangeRecord);
    } else if (i < nx0 + ny0) {
        particleArray[i] = new Particle(paper, vaporPhase, liquidPhase, particleRadius, particleArray, 0, 'L', ExchangeRecord);
    } else if (i < ny1 + nx0 + ny0) {
        particleArray[i] = new Particle(paper, vaporPhase, liquidPhase, particleRadius, particleArray, 1, 'V', ExchangeRecord);
    } else {
        particleArray[i] = new Particle(paper, vaporPhase, liquidPhase, particleRadius, particleArray, 1, 'L', ExchangeRecord);
    }
}

Tslider.addEventListener("input",function(ev){
    T = Tslider.value
    recalcRachfordRice(ExchangeRecord, T);
});

function recalcRachfordRice(exchange, T) {
    let R = new RachfordRice(2,T , P, components, z);
    let y0 = R.y[0];
    let x0 = R.x[0];
    let vF = Math.min(Math.max(R.v, 0), 1); // Mole Fraction of vapor molecules
    let n0 = Math.round(R.z[0] * numParticles);
    let n1 = numParticles - n0;
    let nVap = Math.round(vF * numParticles);
    let nLiq = numParticles - nVap;
    let ny0 = Math.round(y0 * nVap);
    let ny1 = nVap - ny0;
    let nx0 = Math.round(x0 * nLiq);
    let nx1 = nLiq - nx0;
    let target = [ny0, ny1, nx0, nx1];
    exchange.setTarget(target);
}
// Move particles
function moveParticles() {
    particleArray.map(p => p.move());
}
setInterval(moveParticles, 200);


//----------------------------------------------------------------
// Respond to the resize event to keep the raphael material snuggly in the div
window.addEventListener('resize', function(ev){
    let foo = document.getElementById("centerDiv");
    paper.setSize(foo.clientWidth, foo.clientHeight);
    bgRect.attr({"width":foo.clientWidth, "height":foo.clientHeight})
    console.log("setSize .........  pWidth is " + foo.clientWidth + ", and pHeight is " + foo.clientHeight);
});


