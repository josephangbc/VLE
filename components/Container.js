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
        }
    }

    refresh() {
        if (this.phase == 'V') {
            this.dim = [this.lid.dim[0], this.lid.dim[3], this.dim[2], this.dim[3]];
        }
    }
}