export default class Box {
    constructor(paper, padding) {
        this.dim = [padding, padding, paper.width/3, paper.height-padding];
        var body = paper.rect(padding, padding, this.dim[2] - padding, this.dim[3] - this.dim[1]);
        this.body = body;
    }
}