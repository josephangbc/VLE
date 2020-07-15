import RachfordRice from "/components/RachfordRice.js"

export default class Plot {
    constructor(divID,T,P,components,z){
        this.T = T;
        this.P = P;
        this.components = components;
        this.z = z;
        this.divID = divID;
    }

    plot_yx_Tslider(Tmin,Tmax,step){
        let y = [];
        let x = [];
        // let R =  new RachfordRice(2,Tmin, this.P, this.components, this.z);
        let R;
        for (let i = Tmin; i<=Tmax; i+= step){
            R =  new RachfordRice(2,i, this.P, this.components, this.z);
            y.push(R.y[0]);
            x.push(R.x[0]);
        }
        var trace = {
            x: x,
            y: y,
            mode: 'lines',
            line: {shape: 'spline'},
            type: 'scatter',
            name: "name"
          };
          
          let data = [trace];
          let layout = {
            title:'y-x plot',
            xaxis: {
                title: 'x'
              },
              yaxis: {
                title: 'y'
              }
          };
          
        
          Plotly.newPlot(this.divID, data,layout);

    }
}

