import Lid from "/components/Lid.js";
import Particle from "/components/Particle.js";
import Box from "/components/Box.js";
import Exchange from "/components/Exchange.js";
import RachfordRice from "/components/RachfordRice.js";
import Plot from "/components/Plot.js"

// Free inputs for this javascript file
// Preselected components A and B
let preselectA = "n-Pentane";
let preselectB = "n-Heptane";
const PlotOptions = ["y-x (const P,z)","y-x (const T,z)",
"y-x (const P)","y-x (const T)", "T-x-y (const P,z)","T-x-y (const P)"]
let preselectPlot = PlotOptions[0];

// Slider range and starting T,P and zA
let Tmin = 0; let T = 50; let Tmax = 200;
let Pmin = 1; let P = 101;  let Pmax = 1000;
let Zmin = 0; let zA = 0.5; let Zmax = 1;

// Visible volume fraction of vapor to total container
let volVap = 0.8;

// Padding box drawing
let padding = 10;

// 
const lidH = 0;
const particleRadius = 10;
let numParticles = 20;

// Plot params -- input for the Plot object and can be modified from this javascript file
const plotParams = {
    divID: "Plotly",
    Tmin: Tmin,
    Tmax: Tmax,
    Pmin: Pmin,
    Pmax: Pmax,
    numPoints: 100,
}
let plotDivId = "Plotly"
let Tmin_plot = Tmin;
let Tmax_plot = Tmax;
let Pmin_plot = Pmin;
let Pmax_plot = Pmax;
let numPoints = 100; // number of points to generate and plot
let step = 1;
let stepT = 1;
let stepP = 1;


// Add others here so that we don't have to modify in between code





// Grab the div where we will put our Raphael paper
let centerDiv = document.getElementById("centerDiv");

// Create the Raphael paper that we will use for drawing and creating graphical objects
let paper = new Raphael(centerDiv);

// RachFordRice Calculations
let compAselect = document.getElementById("compAselect");
let compBselect = document.getElementById("compBselect");
let Tslider = document.getElementById("Tslider");
let Pslider = document.getElementById("Pslider");
let Zslider = document.getElementById("Zslider");

// Listing the choices of components
let optArrayA = [];
let optArrayB = [];
for (let i = 0; i < RachfordRice.chemicals.length; i++){
    let optA = document.createElement("option");
    let optB =  document.createElement("option");

    optA.innerHTML = RachfordRice.chemicals[i];
    optB.innerHTML = RachfordRice.chemicals[i];

    compAselect.appendChild(optA);
    compBselect.appendChild(optB);
    optArrayA.push(optA);
    optArrayB.push(optB);
}

// Listing choices of options
let optArrayPlot = [];
for (let i = 0; i < PlotOptions.length; i++){
    let opt = document.createElement("option");
    opt.innerHTML = PlotOptions[i];
    opt.value = i;
    plotSelect.appendChild(opt);
    optArrayPlot.push(opt);
}

// Preselecting components
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

// // Setting the slider range
// Tslider.min = Tmin;   Tslider.max = Tmax;
// Pslider.min = Pmin; Pslider.max = Pmax;

// Setting the slider values
Tslider.value = (T-Tmin)/(Tmax-Tmin)*100;
Pslider.value =  (P-Pmin)/(Pmax-Pmin)*100;
Zslider.value = (zA-Zmin)/(Zmax-Zmin)*100;


let compA = optArrayA.filter(x=>x.selected)[0].innerHTML;
let compB = optArrayB.filter(x=>x.selected)[0].innerHTML;
let components = [compA,compB];
let z = [zA,1-zA];

let R = new RachfordRice(2,T , P, components, z);
let y0 = R.y[0];
let x0 = R.x[0];
let vF = Math.min(Math.max(R.v, 0), 1); // Mole Fraction of vapor molecules

let specs = [y0, x0, vF, volVap];

// Just create a box
var box = new Box(paper, padding);

// Create a lid
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
let ExchangeRecord = new Exchange(ny0, ny1, nx0, nx1);

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
    T = Tslider.value/100*(Tmax-Tmin)+Tmin;
    R.setT(T);
    recalibrateExchangeTarget();
    generatePlot();
});

Pslider.addEventListener("input", function(ev){
    P = Pslider.value/100*(Pmax-Pmin)+Pmin;
    R.setP(P);
    recalibrateExchangeTarget();
    generatePlot();
});

Zslider.addEventListener("input", function(ev){
    zA = Zslider.value/100*(Zmax-Zmin)+Zmin;
    z = [zA,1-zA];
    R.setZ(z);
    recalibrateExchangeTarget();
    recalibrateExchangeRecord();
    generatePlot();

});

compAselect.addEventListener("change", function(ev){
    let compA = optArrayA.filter(x=>x.selected)[0].innerHTML;
    R.setCompA(compA);
    recalibrateExchangeTarget();
    recalibrateExchangeRecord();
    generatePlot();
})

compBselect.addEventListener("change", function(ev){
    let compB = optArrayB.filter(x=>x.selected)[0].innerHTML;
    R.setCompB(compA);
    recalibrateExchangeTarget();
    recalibrateExchangeRecord();
    generatePlot();
})

plotSelect.addEventListener("change", function(ev){
    // changed plot option so generate new plot with the options
    generatePlot();
})

function recalibrateExchangeTarget() {
    y0 = R.y[0];
    x0 = R.x[0];
    vF = Math.min(Math.max(R.v, 0), 1); // Mole Fraction of vapor molecules
    n0 = Math.round(R.z[0] * numParticles);
    n1 = numParticles - n0;
    nVap = Math.round(vF * numParticles);
    nLiq = numParticles - nVap;
    ny0 = Math.round(y0 * nVap);
    ny1 = nVap - ny0;
    nx0 = Math.round(x0 * nLiq);
    nx1 = nLiq - nx0;
    let target = [ny0, ny1, nx0, nx1];
    ExchangeRecord.setTarget(target);
}

function recalibrateExchangeRecord(){
    let current = particleArray.filter(x=>x.comType == 0).length; // old n0
    let i = 0;

    // Change the colors for components A and B
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
    ExchangeRecord.setRecord([ny0_c,ny1_c,nx0_c,nx1_c]);
}

// Plot
let plot = new Plot(plotParams,R)
generatePlot();

function generatePlot(){
    let optVal = optArrayPlot.filter(x=>x.selected)[0].value; // selected plot option
    if (optVal == 0){
        plot.plot_yx_constPz();
    } else if (optVal == 1){
        plot.plot_yx_constTz();
    } else if (optVal == 2){
        plot.plot_yx_constP();
    } else if (optVal == 3){
        plot.plot_yx_constT();
    } else if (optVal == 4){
        plot.plot_Txy_constPz();
    } else if (optVal == 5){
        plot.plot_Txy_constP();
    }

}
  
// Move particles
function moveParticles() {
    particleArray.map(p => p.move());
}
let animationLoop = setInterval(moveParticles, 40);

let AnimationIsRunning = true;
function animationStartButtonFunc(){
    if (!AnimationIsRunning){
        animationLoop = setInterval(moveParticles,40);
        AnimationIsRunning = true;
    } else {
        clearInterval(animationLoop);
        AnimationIsRunning = false;
    }
}

let animationButton = document.getElementById("animationStartButton")
animationButton.onclick = animationStartButtonFunc;


//----------------------------------------------------------------
// Respond to the resize event to keep the raphael material snuggly in the div
window.addEventListener('resize', function(ev){
    let foo = document.getElementById("centerDiv");
    paper.setSize(foo.clientWidth, foo.clientHeight);
    bgRect.attr({"width":foo.clientWidth, "height":foo.clientHeight})
    console.log("setSize .........  pWidth is " + foo.clientWidth + ", and pHeight is " + foo.clientHeight);
});


