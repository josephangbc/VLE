import Container from "/components/Container.js";

export default class Lid {
    constructor(paper, box, lidH, particleRadius, numParticles, specs) {
        // Initialization
        this.paper = paper;
        this.box = box;
        var box = this.box;
        this.height = 40;
        var height = this.height;
        var dim = [box.dim[0], box.dim[1] + lidH, box.dim[2], box.dim[1] + lidH + this.height];  // [x1, y1, x2, y2]
        this.dim = dim;
        let body = paper.rect(this.dim[0], this.dim[1], box.dim[2] - box.dim[0], this.height);
        body.attr({"fill": "grey"});
        this.body = body;

        // Vapor Liquid Specifications [y1, x1, vF, volVap];
        this.specs = specs;
        var specs = this.specs;

        // Translate Vapor Liquid Specifications into dimensions
        var HeightVap = specs[3] * (this.box.height - this.height);
        var HeightLiq = (this.box.height - this.height) - HeightVap;

        // Container for Vapor Phase
        this.vaporPhase = new Container(paper, box, this, 'V', HeightVap);
        var vaporPhase = this.vaporPhase;

        // Container for Liquid Phase
        this.liquidPhase = new Container(paper, box, this, 'L', HeightLiq);
        var liquidPhase = this.liquidPhase;

        // Particle Diameter
        var particleDiameter = particleRadius*2;

        //  For Lid Movement
        this.clickState = 0;
        var clickState = this.clickState
        var oy = 0;
        this.oy = oy;

        body.node.addEventListener('mousedown', function(ev){
            clickState=1;
            oy = ev.offsetY;
            // console.log("OK, got a mousedown event at " + oy);
        });

        body.node.addEventListener('mouseup', function(ev){
            // console.log("OK, got a mouseup event");
            clickState=0;
        });

        body.node.addEventListener('mouseleave', function(ev){
            clickState = 0;
        });

        body.node.addEventListener("mousemove", function(ev){
            // console.log("Mouse is at (" +ev.offsetX+","+ev.offsetY+")");
            if (clickState===1){
                let dy = ev.offsetY - oy;
                let newY = dim[1] + dy;
                if (newY < box.dim[1]) {
                    newY = box.dim[1];
                    dy = 0;
                }
                // let botLimit = vaporPhase.dim[3] - particleDiameter - height - (numParticles / particleRadius * 20);
                let botLimit = vaporPhase.dim[3] - particleDiameter - height - (numParticles / particleRadius * 15);
                if (newY > botLimit) {
                    newY = botLimit;
                    dy = 0;
                }
                if (newY  >= botLimit) {
                    body.attr({"fill": "red"});
                } else {
                    body.attr({"fill": "grey"});
                }
                body.animate({'y': newY }, 0.1);
                oy = ev.offsetY;
                dim[1] += dy;
                dim[3] += dy;
                vaporPhase.refresh();
            }
        });
    }

}