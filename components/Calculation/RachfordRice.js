// Goal: given F,z,P,T solve for x,y for n component system
// Required: Ki = f(T,P,{xi})

// Subproblem: Determine K
/* 
    In general: K = K(T,P,{xi})
    Approximation used below: K = K(T,P) using McWilliam equation which is a fit of Depriester chart
    Other approximations:
    Raoult's law: K = VP(T)/P where VP is vapor pressure
    Modified Raoult's law: K = lambda*VP/P where lambda is activity coefficient
    VP can be determined using Antoine equation
    lambda can be determined from Margules equation
*/



let n = 4; // Number of components
let T = 20; // degC
let P = 200; // kPa
let components = ['Propane','n-Butane','n-Pentane','n-Hexane'];
let z = [0.30, 0.10, 0.15, 0.45]; // Overall composition

let T_degR = T * 9/5 + 491.67;
let P_psia = P * 0.145;

// Philip Wankat Table 2-3
let McWilliam_Coeff = {
    'Propane':  [-970688.5625, 0, 7.15059, -0.76984, 0, 6.90224, 2.35],
    'n-Butane': [-1280557, 0, 7.94986, -0.96455, 0, 0, 3.61],
    'n-Pentane': [-1524891, 0, 7.33129, -0.89143, 0, 0, 4.30],
    'n-Hexane': [-1778901, 0, 6.96783, -0.84634, 0, 0, 4.90],
}

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