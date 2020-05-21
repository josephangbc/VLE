// Grab the div where we will put our Raphael paper
let centerDiv = document.getElementById("centerDiv");

// Create the Raphael paper that we will use for drawing and creating graphical objects
// This paper will represent the tank setup.
let paper = new Raphael(centerDiv);

// put the width and heigth of the canvas into variables for our own convenience
let pWidth = paper.width;
let pHeight = paper.height;

// Just create a nice blue background
let bgRect = paper.rect(0,0,pWidth, pHeight);
bgRect.attr({"fill": "mediumaquamarine"});

// Problem specifications
let size = 150e-6; // m - particle size
let rho_p = 1140; // kg/m3 - particle density
let rho_f = 1000; // kg/m3 - fluid density
let mu_f = 0.001; // fluid viscosity (Pa-s?)
let Cb = 0.25; // initial concentration
let Cs = 0.55; // sediment concentration
let g = 9.81 // gravity m/s2

// Assuming Stoke's law regime 
Ut = size*size*(rho_p-rho_f)*g/18/mu_f; // Single Particle Terminal Velocity
// Calculated Re_p validated Stoke's law regime.container
UpB = Ut*(1-Cb)**4.65; // Initial suspension's superficial particle velocity

UintBS = (UpB*Cb)/(Cb-Cs); // Suspension sediment interface velocity

const lengthScale = 10; // 1 m = 10 pixels lets say...container
const timeScale = 300; // 1s (computer) = 10 s (real)

class Clock{
    constructor(start){
        this.time = start;
        this.display = document.getElementById('aside');
        this.display.innerHTML = start;
    }
    tick(){
            this.time = this.time + 0.04*timeScale;
            this.display.innerHTML = Math.floor(this.time) + ' sec';
    }
}

const clock = new Clock(0,1000);

class Particle{
    constructor(r){
        this.r = r;
        this.pos = [(pWidth-2*r)*Math.random()+r,(pHeight-2*r)*Math.random()+r, r]
        this.vel = [0,0];
        this.acc = [0,0];

        let body = paper.circle(pWidth*Math.random(),pHeight*Math.random(), radius);
        body.colorString = "hsl(" + Math.random() + ",1, .75)";
        body.attr({"fill": body.colorString, "fill-opacity" :.75});
        body.xpos = this.pos[0];
        body.ypos = this.pos[1];
        body.xrate = this.vel[0];
        body.yrate = this.vel[1];
        this.body = body;
    }
    setVel(vel){
        this.vel = vel;
    }
    update(){
        this.pos[0] += this.vel[0];
        this.pos[1] += this.vel[1];
        this.vel[0] += this.acc[0];
        this.vel[1] += this.acc[1];
        // Wall collision corrections
        this.correctForWallCollision();
        this.body.attr({'cx':this.pos[0],'cy':this.pos[1]});
    }
    correctForWallCollision(){
        let toploss = 0.1;
        let botloss = 1;
        let xloss = 0.1;
        // Particle collide at Left
        if (this.pos[0] > pWidth-this.r){
            this.pos[0] = (pWidth-this.r)*2-this.pos[0];
            this.vel[0] = -(1-xloss)*Math.abs(this.vel[0]);
        } 
        // Particle collide at Bottom
        if (this.pos[1] > pHeight-this.r){
            this.pos[1] = (pHeight-this.r)*2-this.pos[1];
            this.vel[1] = -(1-botloss)*Math.abs(this.vel[1]);
        }
        // Particle collide at Right
        if (this.pos[0] < this.r){
            this.pos[0] = (this.r)*2-this.pos[0];
            this.vel[0] = (1-xloss)*Math.abs(this.vel[0]);
        }
        // Particle collide at Top
        if (this.pos[1] < this.r){
            this.pos[1] = (this.r)*2-this.pos[1];
            this.vel[1] = (1-toploss)*Math.abs(this.vel[1]);
        }
    }
}

class Interface{
    constructor(h,v){
        this.h = h; 
        this.v = v*lengthScale*timeScale; // velocity
        let body = paper.rect(0,h,pWidth,1);
        body.colorString = "hsl(" + Math.random() + ",1, .75)";
        body.attr({"fill": body.colorString, "fill-opacity" :.75});
        this.body = body;
        this.next = null;
        this.prev = null;
    }
    update(){
        this.h += this.v;
        this.body.attr({'y':this.h});
    }
}
//----------------------------------------------------------------
// Respond to the resize event to keep the raphael material snuggly in the div

/*
window.addEventListener('resize', function(ev){
    let foo = document.getElementById("centerDiv");
    paper.setSize(foo.clientWidth, foo.clientHeight);
    bgRect.attr({"width":foo.clientWidth, "height":foo.clientHeight})
    console.log("setSize .........  pWidth is " + foo.clientWidth + ", and pHeight is " + foo.clientHeight);
});
*/
//============== INITIALIZE ARRAY OF DISKS  ===================//

// Create let to hold number of elements in your list
let numParticles=1000; // Number of particles represented
let radius = pHeight/100; // Visual radius of each particle
// Initialize array to empty
particleArray = Array(numParticles).fill().map(() => new Particle(radius))
intAB = new Interface(0,UpB)
intBS = new Interface(pHeight,UintBS)
interfaceArray = [intAB, intBS];

function draw(){
    // particleArray.map(x => x.update());
    particleArray.map(masterUpdater)
    intAB.update()
    intBS.update()
    clock.tick();
    function masterUpdater(x){
        masterUpdate(x,intAB,intBS)
    }
    function masterUpdate(x,intAB,intBS){
        if (x.pos[1]>= intAB.h && x.pos[1] < intBS.h){
            x.setVel([0,intAB.v]);
            x.update()
        if (x.pos[1] >= intAB.h && x.pos[1] >= intBS.h){
            x.setVel([0,intBS.v]);
            x.update();
                }
            }
        if (intAB.h >= intBS.h) {
            x.setVel([0,0]);
            x.update();
            intAB.v = 0;
            intBS.v = 0;
        }
    }          
}


//--------------------------------
// This is for iOS phone users
// Must get permission from the user after a user event before sensors will be enabled. 
// document.getElementById("permissionButton").addEventListener("click", function(){
//     if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission){
//         window.DeviceOrientationEvent.requestPermission();
//     }
// });

// let asidediv=document.getElementById("aside");


// window.addEventListener("deviceorientation",function(ev){
//     let orient=ev.beta;
//     if (Math.abs(orient)<=90){
//     //up is normal gravity
//     if (orient>0){
//         console.log("pointing up!")
//         gravity=orient/90*gravmax};
//     //0 is no gravity
//     if (orient==0){
//         console.log("flat")
//         gravity=0};
//     //down is opposite 
//     if (orient<0){
//         console.log("pointing down!")
//         gravity=orient/90*gravmax};
//     };
//     // Print to aside div
//     console.log("print")
//     asidediv.innerHTML=gravity;
// });

// •alpha -"yaw", in [0, 360] (this is the compass direction)
// •beta -"pitch" in [-180,180] pointing down in -90, pointing up is 90
// •gamma -"roll" in [-90,90]

//--------------------------------

// let emit=function(){
//     let e=Math.floor(Math.random()*numDisks);
//     console.log("Emit a new disk!");  
//         disk[e].xpos=pWidth/2;
//         disk[e].ypos=pHeight/2;
//         disk[e].attr({'cx': disk[e].xpos, 'cy': disk[e].ypos});
//         disk[e].yrate=-7+14*Math.random()+gravity;
// };


// We do this last thing as the module loads
setInterval(draw, 40);


