export default class Container {
    constructor(paper, box, lid, phase, height) {
        // Initialize
        this.lid = lid;
        this.paper = paper;
        this.box = box;
        this.phase = phase;
        this.height = height;
        

        // Calculate dimensions   // [x1, y1, x2, y2]
        if (phase == 'V') {
            this.dim = [lid.dim[0], lid.dim[3], box.dim[2], lid.dim[3] + height];
        } else {
            this.dim = [lid.dim[0], box.dim[3] - height, box.dim[2], box.dim[3]];
            this.body = this.paper.rect(this.dim[0], this.dim[1], this.dim[2] - this.dim[0], this.height);
            this.body.attr({"stroke": "blue", "fill": "blue", "opacity": 0.5});
            this.animation = {
                active: false,
                targetY: this.dim[1],
                targetHeight:  this.height,
                targetOpacity: 0.5
            }
        }
    }

    setHeight(height,particleDiameter){
        // Calculate dimensions   // [x1, y1, x2, y2]

        if (this.phase == 'V') {
            this.dim = [this.lid.dim[0], this.lid.dim[3], this.box.dim[2], this.lid.dim[3] + height];
        } else {
            this.dim = [this.lid.dim[0], this.box.dim[3] - height, this.box.dim[2], this.box.dim[3]];
            this.animation.active = true;
            this.animation.targetY = this.box.dim[3]-height;
            this.animation.targetHeight = height;
            this.animation.targetOpacity = 0.5
            if (height <= particleDiameter * 2){
                // buggy paritcle movement occurs when phase boundary vanishes
                // Hence, set height to a minimum, and use opacity to show the trend
                this.animation.targetY = this.box.dim[3]-particleDiameter*2;
                this.animation.targetHeight = particleDiameter*2;
                this.animation.targetOpacity = 0.5*height/(particleDiameter*2);
            }
        }
    }

    update(dt){
        if (this.animation.active){
            let y = this.body.attrs.y;
            let h = this.body.attrs.height;
            let opacity = this.body.attrs.opacity;
            if (h > this.animation.targetHeight+dt/40){
                this.dim[1] = y+dt/40;
                this.body.attr({"y":y+dt/40,
            "height":h-dt/40})
            this.body.attr({"opacity":(opacity*0.99+this.animation.targetOpacity*0.01)})
            } else if (h < this.animation.targetHeight - dt/40){
                this.dim[1] = y-dt/40;
                this.body.attr({"y":y-dt/40,
            "height":h+dt/40})
            this.body.attr({"opacity":(opacity*0.99+this.animation.targetOpacity*0.01)})
            } else {
                this.dim[1] = this.animation.targetY;
                this.body.attr({"y":this.animation.targetY,"height":this.animation.targetHeight});
                this.body.attr({"opacity":this.animation.targetOpacity})
                this.animation.active = false;
            }
            // console.log(this.animation);
            
            console.log(opacity, this.animation.targetOpacity, this.animation.active);
            if (opacity < 0.0001){
                this.body.hide();
            } else {
                this.body.show();
            }
        }

    }

    refresh() {
        if (this.phase == 'V') {
            this.dim = [this.lid.dim[0], this.lid.dim[3], this.dim[2], this.dim[3]];
        }
    }
}