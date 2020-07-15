var McWilliam_Coeff = {
    'Methane': [-292860, 0, 8.2445, -0.8951, 59.8465, 0, 1.66],
    'Ethylene': [-600076.875, 0, 7.90595, -0.84677, 42.94594, 0, 2.65],
    'Ethane': [-687248.25, 0, 7.90694, -0.88600, 49.02654, 0, 1.95],
    'Propylene': [-923484.6875, 0, 7.71725, -0.87871, 47.67624, 0, 1.90],
    'Propane':  [-970688.5625, 0, 7.15059, -0.76984, 0, 6.90224, 2.35],
    'Isobutane': [-1166846, 0, 7.72668, -0.92213, 0, 0, 2.52],
    'n-Butane': [-1280557, 0, 7.94986, -0.96455, 0, 0, 3.61],
    'Isopentane': [-1481.583, 0, 7.58071, -0.93159, 0, 0, 4.56],
    'n-Pentane': [-1524891, 0, 7.33129, -0.89143, 0, 0, 4.30],
    'n-Hexane': [-1778901, 0, 6.96783, -0.84634, 0, 0, 4.90],
    'n-Heptane': [-2018803, 0, 6.52914, -0.79543, 0, 0, 6.34],
    'n-Octane': [0, -7646.81641, 12.48457, -0.73152, 0, 0, 7.58],
    'n-Nonane': [-2551040, 0, 5.69313, -0.67818, 0, 0, 9.40],
    'n-Decane': [0, -9760.45703, 13.80354, -0.71470, 0, 0, 5.69],
}


export default class RachfordRice {
    // Class Variables

    constructor(n, T, P, components, z) {
        this. n = n;
        this.T = T;
        this.P = P;
        this.components = components;
        this.z = z;
        this.T_degR = this.T * 9/5 + 491.67;
        this.P_psia = this.P * 0.145;
        this.K = this.calcK();
        this.v = this.newtonMethod();
        this.x = this.calcX();
        this.y = this.calcY(this.x);
    }

    calcK() {
        let K = [];
        for (let i = 0; i < this.n; i++){
            let coeff = McWilliam_Coeff[this.components[i]];
            let aT1 = coeff[0];
            let aT2 = coeff[1];
            let aT6 = coeff[2];
            let ap1 = coeff[3];
            let ap2 = coeff[4];
            let ap3 = coeff[5];
            let lnK = aT1/this.T_degR**2 + aT2/this.T_degR +aT6 + ap1*Math.log(this.P_psia) + ap2/this.P_psia**2 + ap3/this.P_psia;
            K[i] = Math.exp(lnK);
        }
        return K;
    }

    RR (v,K,z) {
        // Rachford Rice equation
        // v = V/F
        let result = 0;
        for (let i = 0; i < K.length; i++){
            result += (K[i]-1)*z[i]/(1+(K[i]-1)*v);
        }
        return result;
    }

    RRprime(v,K,z) {
        // Derivative of Rachford Rice equation wrt V/F
        let result = 0;
        for (let i = 0; i < K.length; i++){
            result -= (K[i]-1)**2*z[i]/(1+(K[i]-1)*v)**2;
        }
        return result;
    }

    newtonMethod() {
        let v = 1;
        let funcVal = this.RR(v, this.K, this.z);
        let tol = 1e-6;
        let maxIter = 10000;
        let iter = 0;
        while (Math.abs(funcVal)>tol && iter < maxIter){
            v = v - this.RR(v, this.K, this.z)/this.RRprime(v, this.K, this.z);
            funcVal = this.RR(v, this.K, this.z);
            iter++;
        }

        return v;
    }

    calcX() {
        // v = V/F
        let result = [];
        for (let i = 0; i < this.K.length; i++){
            result[i] = this.z[i]/(1+(this.K[i]-1)*( Math.min(Math.max(this.v, 0), 1)));
        }
        return result; // Array of liquid compositions {xi}
    }

    calcY(x){
        // v = V/F
        let result = [];
        for (let i = 0; i < this.K.length; i++){
            result[i] = x[i] * this.K[i];
        }
        return result;
    }

}