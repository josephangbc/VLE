import Lid from "/components/Lid.js";
import Particle from "/components/Particle.js";
import Container from "/components/Container.js";
import Box from "/components/Box.js";

// Grab the div where we will put our Raphael paper
let centerDiv = document.getElementById("centerDiv");

// Create the Raphael paper that we will use for drawing and creating graphical objects
let paper = new Raphael(centerDiv);

// put the width and heigth of the canvas into variables for our own convenience
let pWidth = paper.width;
let pHeight = paper.height;
console.log("pWidth is " + pWidth + ", and pHeight is " + pHeight);

// Just create a box
let padding = 10;
var box = new Box(paper, padding);

// Create a lid
const lidH = 0;
const particleRadius = 10;
var lid = new Lid(paper, box, lidH, particleRadius);


// Create a container for the particles
// const container = new Container(paper, box, lid);
var container = lid.container;

// Create Particle
let numParticles = 50;
// var particleArray = Array(numParticles).fill().map(() => new Particle(paper, container, particleSize));
var particleArray = Array(numParticles);
for (let i = 0; i < numParticles; i++) {
    let add = false;
    while (add == false) {
        var newParticle = new Particle(paper, container, particleRadius, particleArray);
        add = true;
        for (let j = 0; j < i; j++) {
            let dx = newParticle.pos[0] - particleArray[j].pos[0];
            let dy = newParticle.pos[1] - particleArray[j].pos[1];
            let dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            if (dist < 3*particleRadius) {
                add = false;
                newParticle.body.remove();
                break;
            }
        }
    }
    particleArray[i] = newParticle;
}

// Move particles
function moveParticles() {
    particleArray.map(p => p.move());
    particleArray.map(p => p.correctForParticleCollision());
    particleArray.map(p => p.moveActual());
}
setInterval(moveParticles, 1);


//----------------------------------------------------------------
// Respond to the resize event to keep the raphael material snuggly in the div
window.addEventListener('resize', function(ev){
    let foo = document.getElementById("centerDiv");
    paper.setSize(foo.clientWidth, foo.clientHeight);
    bgRect.attr({"width":foo.clientWidth, "height":foo.clientHeight})
    console.log("setSize .........  pWidth is " + foo.clientWidth + ", and pHeight is " + foo.clientHeight);
});


