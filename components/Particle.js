

export default class Particle {
    static colors = new Array('red', 'blue', 'green');

    constructor(paper, vaporPhase, liquidPhase, r, particleArray, comType, phaseType, ExchangeRecord) {

        // Radius
        this.r = r;

        // Container describing bounds for particle
        if (phaseType == 'V') {
            this.container = vaporPhase;
        } else {
            this.container = liquidPhase;
        }
        this.vaporPhase = vaporPhase;
        this.liquidPhase = liquidPhase;
        var container = this.container;

        // Randomize starting position
        let xPos = (container.dim[2] - container.dim[0] - this.r * 2)*Math.random() + container.dim[0] + this.r;
        let yPos = (container.dim[3] - container.dim[1] - this.r * 2)*Math.random() + container.dim[1] + this.r;
        this.pos = [xPos, yPos, this.r];

        // Randomise starting direction while maintaining speed of particle
        let f = Math.random();
        this.speed = 5;
        let vy = Math.sqrt(Math.pow(this.speed,2) / (Math.pow(f,2)+1));
        this.vel = [(Math.round(Math.random()) * 2 - 1)*vy*f, (Math.round(Math.random()) * 2 - 1)*vy];

        //  Draw particle
        this.body = paper.circle(this.pos[0],this.pos[1], this.r);
        this.body.attr({"fill": Particle.colors[comType]});

        this.particleArray = particleArray;
        this.phaseType = phaseType;
        this.exchange = ExchangeRecord;
        this.comType = comType;
    }
    move(dt=40) {
        // Update Position
        let speedFactor;
        if (this.phaseType == "L"){
            speedFactor = 2/3;
        } else {
            speedFactor = 1;
        }
        this.pos[0] += this.vel[0]*speedFactor * dt/40;
        this.pos[1] += this.vel[1] *speedFactor* dt/40;
        // Check for Wall Collision
        this.correctForWallCollision();
    }

    render(){
        this.body.attr({'cx':this.pos[0],'cy':this.pos[1]});
    }

    correctForWallCollision(){
        let bounds = this.container.dim;
        // Particle collide at Left
        if (this.pos[0] < bounds[0] + this.r){
            this.pos[0] = bounds[0] + this.r;
            this.vel[0] = -this.vel[0];
        }
        // Particle collide at Right
        if (this.pos[0] > bounds[2] - this.r){
            this.pos[0] = bounds[2] - this.r;
            this.vel[0] = -this.vel[0];
        }
        // Interface interaction from liquid phase
        if (this.phaseType == 'L') {
            if (this.pos[1] < bounds[1] + this.r && this.vel[1] < 0) {
                if (this.checkExchange() == false){
                    this.vel[1] = -this.vel[1];
                    let overshoot = (bounds[1] + this.r) - this.pos[1]
                    this.pos[1] += 2*overshoot;
                }
            } else if (this.pos[1] > bounds[3] - this.r){
                // Liquid phase wall collision below
                this.vel[1] = -this.vel[1];
                let overshoot = this.pos[1] - (bounds[3] - this.r);
                this.pos[1] -= 2*overshoot
            }
        } else {
            // Vapor phase wall collision at top
            if (this.pos[1] < bounds[1] + this.r){
                this.vel[1] = - this.vel[1];
                let overshoot = (bounds[1] + this.r) - this.pos[1]
                this.pos[1] += 2*overshoot;
            } else if (this.pos[1] > bounds[3] - this.r && this.vel[1] > 0){
                // Interface interaction from vapor phase
                if (this.checkExchange() == false){
                    this.vel[1] = -this.vel[1];
                    let overshoot = this.pos[1] - (bounds[3] - this.r);
                    this.pos[1] -= 2*overshoot
                }
            }
        }

        // Original 

        // // Particle collide at Top
        // if (this.pos[1] < bounds[1] + this.r){
        //     if (this.phaseType == 'L') {
        //         // if No Exchange, then bounce
        //         if (this.checkExchange() == false) {
        //             this.vel[1] = -this.vel[1];
        //             this.pos[1] = bounds[1] + this.r;
        //         } else {
        //             this.pos[1] = this.container.dim[3] - this.r;
        //         }
        //     } else {
        //         this.vel[1] = -this.vel[1];
        //         this.pos[1] = bounds[1] + this.r;
        //     }
        // }
        // // Particle collide at Bottom
        // if (this.pos[1] > bounds[3] - this.r){
        //     if (this.phaseType == 'V') {
        //         // if No Exchange, then bounce
        //         if (this.checkExchange() == false) {
        //             this.pos[1] = bounds[3] - this.r;
        //             this.vel[1] = -this.vel[1];
        //         } else {
        //             this.pos[1] = this.container.dim[1] + this.r;
        //         }
        //     } else {
        //         this.pos[1] = bounds[3] - this.r;
        //         this.vel[1] = -this.vel[1];
        //     }
        // }
    }

    checkExchange() {
        if (this.phaseType =='V') {
            if (this.exchange.checkShift(this.comType, this.phaseType)) {
                this.phaseType = 'L';
                this.container = this.liquidPhase;
                return true;
            }
        } else {
            if (this.exchange.checkShift(this.comType, this.phaseType)) {
                this.phaseType = 'V';
                this.container = this.vaporPhase;
                return true;
            }
        }
        return false;
    }

    changeComType(comType) {
        this.comType = comType;
        this.body.attr({"fill": Particle.colors[comType]});
    }





    //////// Archive ///////////////////////


    correctForParticleCollision() {
        let particleArray = this.particleArray;
        for (let i = 0; i < particleArray.length; i++) {
            if (this !== particleArray[i]) {
                let dx = this.pos[0] - particleArray[i].pos[0];
                let dy = this.pos[1] - particleArray[i].pos[1];
                let dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

                if (dist <= 2*this.r) {
                    let dCollision = 2 * this.r - dist;

                    // Reset Position
                    let timeReverse = dCollision/2 / this.speed;
                    if (dx != 0) {
                        this.pos[0] += dx/Math.abs(dx) * Math.abs(this.vel[0]) * timeReverse;
                        particleArray[i].pos[0] -= dx/Math.abs(dx) * Math.abs(particleArray[i].vel[0]) * timeReverse;
                    }
                    if (dy != 0) {
                        this.pos[1] += dy/Math.abs(dy) * Math.abs(this.vel[1]) * timeReverse;
                        particleArray[i].pos[1] -= dy/Math.abs(dy) * Math.abs(particleArray[i].vel[1]) * timeReverse;
                    }

                    // Get Tangent at collision
                    let sumDiff = Math.abs(dx) + Math.abs(dy);
                    let tangent = [-dy / sumDiff, dx / sumDiff];

                    // Relative velocity
                    let relativeVelocity = [this.vel[0] - particleArray[i].vel[0], this.vel[1] - particleArray[i].vel[1]];

                    // Velocity on the Tangent
                    let length = tangent[0] * relativeVelocity[0] + tangent[1] * relativeVelocity[1];
                    tangent = [tangent[0] * length, tangent[1] * length];

                    // Velocity on Perpendicular
                    let perpendicularVelocity = [relativeVelocity[0] - tangent[0],
                        relativeVelocity[1] - tangent[1]];

                    // Correct velocity
                    this.vel[0] -= perpendicularVelocity[0];
                    this.vel[1] -= perpendicularVelocity[1];
                    let sumVel = Math.sqrt(Math.pow(this.vel[0],2) + Math.pow(this.vel[1],2));
                    this.vel = [this.vel[0]/sumVel*this.speed, this.vel[1]/sumVel*this.speed];
                    particleArray[i].vel[0] += perpendicularVelocity[0];
                    particleArray[i].vel[1] += perpendicularVelocity[1];
                    sumVel = Math.sqrt(Math.pow(particleArray[i].vel[0],2) + Math.pow(particleArray[i].vel[1],2));
                    particleArray[i].vel = [particleArray[i].vel[0]/sumVel*this.speed, particleArray[i].vel[1]/sumVel*this.speed];

                    // Correct position
                    this.pos[0] += this.vel[0] * timeReverse;
                    this.pos[1] += this.vel[1] * timeReverse;
                    particleArray[i].pos[0] += particleArray[i].vel[0] * timeReverse;
                    particleArray[i].pos[1] += particleArray[i].vel[1] * timeReverse;
                }
            }
        }
    }
}