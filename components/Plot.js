import RachfordRice from "/components/RachfordRice.js"

export default class Plot {
    constructor(divID,T,P,components,z){
        this.T = T;
        this.P = P;
        this.components = components;
        this.z = z;
        this.divID = divID;
        this.Tmin = 0;
        this.Tmax = 0;
    }

    plot_yx_Tslider(Tmin,Tmax,step){
        // For constant P 
        let y = [];
        let x = [];
        let T = [];
        // let R =  new RachfordRice(2,Tmin, this.P, this.components, this.z);
        let R;
        for (let i = Tmin; i<=Tmax; i+= step){
            R =  new RachfordRice(2,i, this.P, this.components, this.z);
            y.push(R.y[0]);
            x.push(R.x[0]);
            T.push(i);
        }
        console.log(T);
        var trace = {
            x: x,
            y: y,
            text: T,
            hovertemplate: '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}'
            +'<br><i>x</i>: %{x:.3r}',
            mode: 'lines',
            line: {shape: 'spline'},
            type: 'scatter',
            name: "",
            showlegend: false,
          };
          
          let data = [trace];
          let layout = {
            title:'y-x plot (P = '+ this.P+ ' kPa)',
            xaxis: {
                title: 'x',
                range: [0,1],
                hoverformat: ".3r",
              },
              yaxis: {
                title: 'y',
                range: [0,1],
              },
              hovermode: 'closest',
          };
          
        
          Plotly.newPlot(this.divID, data,layout);


    }

    plot_yx_Pslider(Pmin,Pmax,step){
        let y = [];
        let x = [];
        let P = [];
        // let R =  new RachfordRice(2,Tmin, this.P, this.components, this.z);
        let R;
        for (let i = Pmin; i<=Pmax; i+= step){
            R =  new RachfordRice(2,i, this.P, this.components, this.z);
            y.push(R.y[0]);
            x.push(R.x[0]);
            T.push(i);
        }
        console.log(T);
        var trace = {
            x: x,
            y: y,
            text: P,
            hovertemplate: '<i>T</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}'
            +'<br><i>x</i>: %{x:.3r}',
            mode: 'lines',
            line: {shape: 'spline'},
            type: 'scatter',
            name: "",
            showlegend: false,
          };
          
          let data = [trace];
          let layout = {
            title:'y-x plot (T = '+ this.T+ ' C)',
            xaxis: {
                title: 'x',
                range: [0,1],
                hoverformat: ".3r",
              },
              yaxis: {
                title: 'y',
                range: [0,1],
              },
              hovermode: 'closest',
          };
          
        
          Plotly.newPlot(this.divID, data,layout);


        }
}

