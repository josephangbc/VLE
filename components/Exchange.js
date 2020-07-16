export default class Exchange {

    constructor(ny0, ny1, nx0, nx1) {
        this.target = [ny0, ny1, nx0, nx1];
        this.record = [ny0, ny1, nx0, nx1];
    }

    setTarget(target) {
        this.target = target
    }
    setRecord(record){
        this.record = record;
    }

    checkShift(comType, phaseType) {
        console.log(this.target + " " + this.record);
        // let shift = [this.target[0] - this.record[0], this.target[1] - this.record[1], this.target[2] - this.record[2], this.target[3] - this.record[3]];
        // console.log(shift);
        if (comType == 0) {
            if (phaseType == "V") {
                if (this.record[0] > this.target[0]) {
                    this.record[0] -= 1;
                    this.record[2] += 1;
                    return true
                }
            } else {
                if (this.record[2] > this.target[2]) {
                    this.record[2] -= 1;
                    this.record[0] += 1;
                    return true
                }
            }
        } else {
            if (phaseType == "V") {
                if (this.record[1] > this.target[1]) {
                    this.record[1] -= 1;
                    this.record[3] += 1;
                    return true
                }
            } else {
                if (this.record[3] > this.target[3]) {
                    this.record[3] -= 1;
                    this.record[1] += 1;
                    return true
                }
            }
        }
        return false
    }
}