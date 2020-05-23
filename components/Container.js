export default class Container {
    constructor(paper, box, lid) {
        this.dim = [lid.dim[0], lid.dim[3], box.dim[2], box.dim[3]];
        this.lid = lid;
        this.paper = paper;
        this.box = box;
    }

    refresh() {
        this.dim = [this.lid.dim[0], this.lid.dim[3], this.box.dim[2], this.box.dim[3]];
        console.log(this.dim);
    }
}