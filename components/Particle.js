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
        let speed = 0.5;
        let vy = Math.sqrt(Math.pow(speed,2) / (Math.pow(f,2)+1));
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
                    let first = (this.vel[0] < 0) != (particleArray[i].vel[0] < 0);
                    let second = (this.vel[1] < 0) != (particleArray[i].vel[1] < 0);
                    if (first && second) {
                        this.vel[0] = -this.vel[0];
                        this.vel[1] = -this.vel[1];
                        particleArray[i].vel[0] = -particleArray[i].vel[0];
                        particleArray[i].vel[1] = -particleArray[i].vel[1];

                        this.pos[0] += this.vel[0];
                        this.pos[1] += this.vel[1];
                        particleArray[i].pos[0] += particleArray[i].vel[0];
                        particleArray[i].pos[1] += particleArray[i].vel[1];
                    } else if (first) {
                        this.vel[0] = -this.vel[0];
                        particleArray[i].vel[0] = -particleArray[i].vel[0];

                        this.pos[0] += this.vel[0];
                        particleArray[i].pos[0] += particleArray[i].vel[0];
                    } else if (second) {
                        this.vel[1] = -this.vel[1];
                        particleArray[i].vel[1] = -particleArray[i].vel[1];

                        this.pos[1] += this.vel[1];
                        particleArray[i].pos[1] += particleArray[i].vel[1];
                    } else if (!first) {
                        if (this.vel[0] < 0) {
                            if (this.pos[0] > particleArray[i].pos[0]) {
                                this.vel[0] = -this.vel[0];
                                this.pos[0] += this.vel[0];
                            } else {
                                particleArray[i].vel[0] = -particleArray[i].vel[0];
                                particleArray[i].pos[0] += particleArray[i].vel[0];
                            }
                        }
                    } else if (!second) {
                        if (this.vel[1] < 0) {
                            if (this.pos[1] > particleArray[i].pos[1]) {
                                this.vel[1] = -this.vel[1];
                                this.pos[1] += this.vel[1];
                            } else {
                                particleArray[i].vel[1] = -particleArray[i].vel[1];
                                particleArray[i].pos[1] += particleArray[i].vel[1];
                            }
                        }
                    }
                }
            }
        }
    }
}