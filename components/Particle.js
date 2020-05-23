export default class Particle {
    constructor(paper, container, r, particleArray) {
        // Radius
        this.r = r;

        // Container describing bounds for particle
        this.container = container;

        // Randomize starting position
        let xPos = (container.dim[2] - container.dim[0] - this.r * 2)*Math.random() + container.dim[0] + this.r;
        let yPos = (container.dim[3] - container.dim[1] - this.r * 2)*Math.random() + container.dim[1] + this.r;
        this.pos = [xPos, yPos, this.r];

        // Randomise starting direction while maintaining speed of particle
        let f = Math.random();
        this.speed = 1;
        let vy = Math.sqrt(Math.pow(this.speed,2) / (Math.pow(f,2)+1));
        this.vel = [(Math.round(Math.random()) * 2 - 1)*vy*f, (Math.round(Math.random()) * 2 - 1)*vy];

        //  Draw particle
        this.body = paper.circle(this.pos[0],this.pos[1], this.r);
        this.body.attr({"fill": "red"});

        this.particleArray = particleArray;

    }
    move() {
        // Update Position
        this.pos[0] += this.vel[0];
        this.pos[1] += this.vel[1];
        // Check for Wall Collision
        this.correctForWallCollision();
    }

    moveActual() {
        // Assign position to particle
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
        // Particle collide at Top
        if (this.pos[1] < bounds[1] + this.r){
            this.pos[1] = bounds[1] + this.r;
            this.vel[1] = -this.vel[1];
        }
        // Particle collide at Bottom
        if (this.pos[1] > bounds[3] - this.r){
            this.pos[1] = bounds[3] - this.r;
            this.vel[1] = -this.vel[1];
        }
    }


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

                    // let s = Math.sqrt(Math.pow(this.vel[0],2) + Math.pow(this.vel[1],2));
                    // if (s > this.speed) {
                    //     console.log(s);
                    // }
                    // s = Math.sqrt(Math.pow(particleArray[i].vel[0],2) + Math.pow(particleArray[i].vel[1],2));
                    // if (s > this.speed) {
                    //     console.log(s);
                    // }
                    // Correct position
                    this.pos[0] += this.vel[0] * timeReverse;
                    this.pos[1] += this.vel[1] * timeReverse;
                    particleArray[i].pos[0] += particleArray[i].vel[0] * timeReverse;
                    particleArray[i].pos[1] += particleArray[i].vel[1] * timeReverse;
                }

                    // if (!vxDiff && dx !== 0) {
                    //     if (dx > 0 && this.vel[0] < 0) {
                    //         let time = dist / (Math.abs(particleArray[i].vel[0]) - Math.abs(this.vel[0]));
                    //         this.pos[0] -= 2 * this.vel[0] * time;
                    //         this.vel[0] = -this.vel[0];
                    //     } else if (dx < 0 && this.vel[0] < 0) {
                    //         let time = dist / (Math.abs(this.vel[0]) - Math.abs(particleArray[i].vel[0]));
                    //         particleArray[i].pos[0] -= 2 * particleArray[i].vel[0] * time;
                    //         particleArray[i].vel[0] = -particleArray[i].vel[0];
                    //     }
                    // }

                // if (dist <= 2*this.r) {
                //     let first = (this.vel[0] < 0) != (particleArray[i].vel[0] < 0);
                //     let second = (this.vel[1] < 0) != (particleArray[i].vel[1] < 0);
                //     if (first && second) {
                //         this.vel[0] = -this.vel[0];
                //         this.vel[1] = -this.vel[1];
                //         particleArray[i].vel[0] = -particleArray[i].vel[0];
                //         particleArray[i].vel[1] = -particleArray[i].vel[1];
                //
                //         this.pos[0] += this.vel[0];
                //         this.pos[1] += this.vel[1];
                //         particleArray[i].pos[0] += particleArray[i].vel[0];
                //         particleArray[i].pos[1] += particleArray[i].vel[1];
                //     } else if (first) {
                //         this.vel[0] = -this.vel[0];
                //         particleArray[i].vel[0] = -particleArray[i].vel[0];
                //
                //         this.pos[0] += this.vel[0];
                //         particleArray[i].pos[0] += particleArray[i].vel[0];
                //     } else if (second) {
                //         this.vel[1] = -this.vel[1];
                //         particleArray[i].vel[1] = -particleArray[i].vel[1];
                //
                //         this.pos[1] += this.vel[1];
                //         particleArray[i].pos[1] += particleArray[i].vel[1];
                //     } else if (!first) {
                //         if (this.vel[0] < 0) {
                //             if (this.pos[0] > particleArray[i].pos[0]) {
                //                 this.vel[0] = -this.vel[0];
                //                 this.pos[0] += this.vel[0];
                //             } else {
                //                 particleArray[i].vel[0] = -particleArray[i].vel[0];
                //                 particleArray[i].pos[0] += particleArray[i].vel[0];
                //             }
                //         }
                //     } else if (!second) {
                //         if (this.vel[1] < 0) {
                //             if (this.pos[1] > particleArray[i].pos[1]) {
                //                 this.vel[1] = -this.vel[1];
                //                 this.pos[1] += this.vel[1];
                //             } else {
                //                 particleArray[i].vel[1] = -particleArray[i].vel[1];
                //                 particleArray[i].pos[1] += particleArray[i].vel[1];
                //             }
                //         }
                //     }
                // }
            }
        }
    }
}