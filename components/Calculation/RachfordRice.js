/* 
For a mixture of any number of components from the list given below, this procedure can calculate the {xi},{yi} and V/F

Inputs required: 
1) Component Array (limited by the list below)
2) Temperature, T [degC]
3) Pressure, P [kPa]
4) Overall composition, z (an array)

Calculation details: 
Remember the Depriester chart to find K = K(T,P)? 
Wankat's textbook's equation 2-30 is McWilliam equation which is a fit for this chart
Corresponding coefficient for a few components are given in table 2-3
5) Calculate lnKi =  aT1/T**2 + aT2/T + aT6 + ap1*lnP + ap2/P**2 + ap3/P where T is in Rankine and P is in psia
    Put them into an array K
6) xi = g(V/F,Ki,zi) and yi = h(V/F,Ki,zi) can be derived
    Summation of xi and yi equals 1
    Essentially, need to determine V/F such that this happens
    Rachford Rice equation takes f(V/F,K,z) = summation of (h(.) - g(.)) 
    Solution is when f(.) = 0
7) Problem is to find the root of this equation 
    Newton's method is used
    * Newton's method has the possibility of convergence failure but this equation has good convergence property
8) Once V/F is found, xi = g(.) and yi = h(.) can be determined and the problem is solved
    * If V/F is > 1, superheated vapor
    * If V/F is < 1, subcooled liquid

Extensions:
    More chemicals could be added for application of Raoult's law
    Ki = (VPi(T))/P where VPi(T) is the vapor pressure of component i at temperature T
    VPi(T) = Ai-Bi/(T+Ci) {Antoine's equation}
    Assumptions of Raoult's law:
    1) Vapor is ideal gas mixture -> Can use partial pressure instead of fugacity (? Didn't really check in detail)
    2) Ideal solution -> Activity coefficient = 1 

    Modified Raoult's law
    Ki = lambda*(VPi(T))/P where lambda is activity coefficient
    Considering something like Margules Equation, lambda and therefore Ki will change everytime composition is different
    At long as root of f(.) is found, solution is found but convergence might be difficult




*/
export default class RachfordRice {
    constructor() {

    }


}

// Philip Wankat Table 2-3
let McWilliam_Coeff = {
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


let n = 2; // Number of components
let T = 20; // degC
let P = 200; // kPa
let components = ['Propane','n-Butane'];
let z = [0.30, 0.70]; // Overall composition

let T_degR = T * 9/5 + 491.67;
let P_psia = P * 0.145;



// In this example, K is found using McWilliam equation fit of the Depriester chart
let K = [];
for (let i = 0; i < n; i++){
    let coeff = McWilliam_Coeff[components[i]];
    let aT1 = coeff[0];
    let aT2 = coeff[1];
    let aT6 = coeff[2];
    let ap1 = coeff[3];
    let ap2 = coeff[4];
    let ap3 = coeff[5];
    let lnK = aT1/T_degR**2 + aT2/T_degR +aT6 + ap1*Math.log(P_psia) + ap2/P_psia**2 + ap3/P_psia;
    K[i] = Math.exp(lnK);
}
console.log("Components:",components)
console.log("Temperature:",T,"degC");
console.log("Pressure:",P,"kPa");
console.log("Overall composition:",z)
console.log("Partition Coefficients K:",K);


let RR = function(v,K,z){
    // Rachford Rice equation
    // v = V/F 
    let result = 0;
    for (let i = 0; i < K.length; i++){
        result += (K[i]-1)*z[i]/(1+(K[i]-1)*v);
    }
    return result;
}

let RRprime = function(v,K,z){
    // Derivative of Rachford Rice equation wrt V/F
    let result = 0;
    for (let i = 0; i < K.length; i++){
        result -= (K[i]-1)**2*z[i]/(1+(K[i]-1)*v)**2;
    }
    return result; 
}

// Newtonian method
let v = 1;
let funcVal = RR(v,K,z);
let tol = 1e-6;
let maxIter = 10000;
let iter = 0;
while (Math.abs(funcVal)>tol && iter < maxIter){
    v = v - RR(v,K,z)/RRprime(v,K,z);
    funcVal = RR(v,K,z);
    iter++;
}
console.log(iter);
console.log("Fraction of feed vaporized:",v);
console.log("Rachford Rice Equation value:",RR(v,K,z))
// If RR(.) < 0, subcooled liquid and if RR(.) > 1, superheated vapor
if (v > 1){
    console.log("Superheated vapor");
} else if (v < 0){
    console.log("Subcooled liquid");
}

let calcX = function(v,K,z){
    // v = V/F
    let result = [];
    for (let i = 0; i < K.length; i++){
        result[i] = z[i]/(1+(K[i]-1)*v);
    }
    return result; // Array of liquid compositions {xi}
}

let calcY = function(v,K,z){
    // v = V/F
    let result = [];
    let x = calcX(v,K,z);
    for (let i = 0; i < K.length; i++){
        result[i] = x[i] * K[i];
    }
    return result;
}

let x = calcX(v,K,z);
let y = calcY(v,K,z);

console.log("x:",x);
console.log("y:",y);