export default class Box {
    constructor(paper, padding) {
        this.dim = [5*padding, padding, paper.width-5*padding, paper.height-padding];
        var body = paper.rect(this.dim[0], this.dim[1], this.dim[2] - this.dim[0], this.dim[3] - this.dim[1]);
        this.height =  this.dim[3] - this.dim[1];
        this.body = body;
    }
}