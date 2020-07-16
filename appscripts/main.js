import Lid from "/components/Lid.js";
import Particle from "/components/Particle.js";
import Box from "/components/Box.js";
import Exchange from "/components/Exchange.js";
import RachfordRice from "/components/RachfordRice.js";
import Plot from "/components/Plot.js"

// Grab the div where we will put our Raphael paper
let centerDiv = document.getElementById("centerDiv");

// Create the Raphael paper that we will use for drawing and creating graphical objects
let paper = new Raphael(centerDiv);

// RachFordRice Calculations
let Tslider = document.getElementById("Tslider");
let Pslider = document.getElementById("Pslider");
let Zslider = document.getElementById("Zslider");
let compAselect = document.getElementById("compAselect");
let compBselect = document.getElementById("compBselect");

let optArrayA = [];
let optArrayB = [];
for (let i = 0; i < RachfordRice.chemicals.length; i++){
    let optA = document.createElement("option");
    let optB =  document.createElement("option")
    optA.innerHTML = RachfordRice.chemicals[i];
    optB.innerHTML = RachfordRice.chemicals[i];

    compAselect.appendChild(optA);
    compBselect.appendChild(optB);
    optArrayA.push(optA);
    optArrayB.push(optB);
}

let preselectA = "n-Pentane";
let preselectB = "n-Heptane";
for (let opt of optArrayA){
    if (opt.innerHTML == preselectA){
        opt.selected = true;
    }
}
for (let opt of optArrayB){
    if (opt.innerHTML == preselectB){
        opt.selected = true;
    }
}

var Tmin = 0;  Tslider.min = Tmin;
var Tmax = 200; Tslider.max = Tmax;
var T = 50; Tslider.value = 50;

var Pmin = 1; Pslider.min = Pmin;
var Pmax = 1000; Pslider.max = Pmax;
var P = 101; Pslider.value = 101;

var zA = Zslider.value/100 ;

// let P = 101; // kPa
let compA = optArrayA.filter(x=>x.selected)[0].innerHTML;
let compB = optArrayB.filter(x=>x.selected)[0].innerHTML;
let components = [compA,compB];
let z = [zA,1-zA];

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
    plot.T = T;
    plot.plot_yx_Tslider(Tmin,Tmax,1);
});

Pslider.addEventListener("input", function(ev){
    P = Pslider.value;
    recalcP(ExchangeRecord,P);
    plot.P = P;
    plot.plot_yx_Tslider(Tmin,Tmax,1)
});

Zslider.addEventListener("input", function(ev){
    zA = Zslider.value/100;
    z = [zA,1-zA];
    recalcZ(ExchangeRecord,z)
    plot.z = z;
    plot.plot_yx_Tslider(Tmin,Tmax,1);

});

compAselect.addEventListener("change", function(ev){
    let compA = optArrayA.filter(x=>x.selected)[0].innerHTML;
    let compB = optArrayB.filter(x=>x.selected)[0].innerHTML;
    let components = [compA,compB];
    plot.components = components;
    plot.plot_yx_Tslider(Tmin,Tmax,1);
    recalcComponent(ExchangeRecord,components);
})

compBselect.addEventListener("change", function(ev){
    let compA = optArrayA.filter(x=>x.selected)[0].innerHTML;
    let compB = optArrayB.filter(x=>x.selected)[0].innerHTML;
    let components = [compA,compB];
    plot.components = components;
    plot.plot_yx_Tslider(Tmin,Tmax,1);
    recalcComponent(ExchangeRecord,components);
})

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

function recalcP(exchange, P) {
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

function recalcZ(exchange, z){
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
    
    let current = particleArray.filter(x=>x.comType == 0).length; // old n0
    // Changing the particle colors
    let i = 0;

    while (current != n0 && i < particleArray.length){
        console.log("current",current,"target",n0);
        if (particleArray[i].comType == 0 && current > n0){
            particleArray[i].changeComType(1);
            current -= 1;
        } else if(particleArray[i].comType == 1 && current < n0){
            particleArray[i].changeComType(0);
            current += 1;
        }
        i++;
    }
    // label c for "count"
    let ny0_c = particleArray.filter(x=>x.comType==0 & x.phaseType == "V").length;
    let ny1_c = particleArray.filter(x=>x.comType==1 && x.phaseType == "V").length;
    let nx0_c = particleArray.filter(x=>x.comType==0 && x.phaseType == "L").length;
    let nx1_c = particleArray.filter(x=>x.comType==1 && x.phaseType == "L").length;
    exchange.setRecord([ny0_c,ny1_c,nx0_c,nx1_c]);

}

function recalcComponent(exchange,components){
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
    
    let current = particleArray.filter(x=>x.comType == 0).length; // old n0
    // Changing the particle colors
    let i = 0;

    while (current != n0 && i < particleArray.length){
        console.log("current",current,"target",n0);
        if (particleArray[i].comType == 0 && current > n0){
            particleArray[i].changeComType(1);
            current -= 1;
        } else if(particleArray[i].comType == 1 && current < n0){
            particleArray[i].changeComType(0);
            current += 1;
        }
        i++;
    }
    // label c for "count"
    let ny0_c = particleArray.filter(x=>x.comType==0 & x.phaseType == "V").length;
    let ny1_c = particleArray.filter(x=>x.comType==1 && x.phaseType == "V").length;
    let nx0_c = particleArray.filter(x=>x.comType==0 && x.phaseType == "L").length;
    let nx1_c = particleArray.filter(x=>x.comType==1 && x.phaseType == "L").length;
    exchange.setRecord([ny0_c,ny1_c,nx0_c,nx1_c]);
}


// var trace1 = {
//     x: [1, 2, 3, 4],
//     y: [10, 15, 13, 17],
//     mode: 'markers',
//     type: 'scatter'
//   };
  
//   var trace2 = {
//     x: [2, 3, 4, 5],
//     y: [16, 5, 11, 9],
//     mode: 'lines',
//     type: 'scatter'
//   };
  
//   var trace3 = {
//     x: [1, 2, 3, 4],
//     y: [12, 9, 15, 12],
//     mode: 'lines+markers',
//     line: {shape: 'spline'},
//     type: 'scatter',
//     name: "name"
//   };
  
//   let data = [trace1, trace2, trace3];
//   let layout = {
//     title:'y-x plot',
//     xaxis: {
//         title: 'x'
//       },
//       yaxis: {
//         title: 'y'
//       }
//   };
  

//   Plotly.newPlot('Plotly', data,layout);s

  let plot = new Plot('Plotly',T , P, components, z)
  plot.plot_yx_Tslider(0,200,1)
  
// Move particles
function moveParticles() {
    particleArray.map(p => p.move());
}
setInterval(moveParticles, 40);


//----------------------------------------------------------------
// Respond to the resize event to keep the raphael material snuggly in the div
window.addEventListener('resize', function(ev){
    let foo = document.getElementById("centerDiv");
    paper.setSize(foo.clientWidth, foo.clientHeight);
    bgRect.attr({"width":foo.clientWidth, "height":foo.clientHeight})
    console.log("setSize .........  pWidth is " + foo.clientWidth + ", and pHeight is " + foo.clientHeight);
});


