import RachfordRice from "/components/RachfordRice.js"

export default class Plot {
    constructor(params,R){
      this.params = params; // Plotting parameters
      this.R = R; // Rachford Rice current solution
    }
    plot_yx_constPz(){
        // For constant P and z

        // Arrays storing scatter data
        let y = [];
        let x = [];
        let T = [];

        let R; // Temporary Rachford Rice solutions
        let Tmin = this.params.Tmin; let Tmax = this.params.Tmax;
        let step = (this.params.Tmax-this.params.Tmin)/this.params.numPoints;
        for (let i = Tmin; i<Tmax; i+= step){
            R =  new RachfordRice(2,i, this.R.P, this.R.components, this.R.z);
          if (0<=R.v && R.v <= 1){
            y.push(R.y[0]);
            x.push(R.x[0]);
            T.push(i);
          }
        }
        let trace = {
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
      
          let current = {
            x: [this.R.x[0]],
            y: [this.R.y[0]],
            mode: 'markers',
            type: 'scatter',
            name: "",
            showlegend: false,
            marker: { size: 12 },
            text: [this.R.T],
            hovertemplate: '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}'
            +'<br><i>x</i>: %{x:.3r}',
          }

          
          let data = [trace,current];
          let layout = {
            title:'y-x plot (P = '+ Math.round(this.R.P*100)/100 + ' kPa), (z = '+ 
            Math.round(this.R.z[0]*1000)/1000 +' )',
            xaxis: {
                title: 'x',
                range: [0,1],
                hoverformat: ".3r",
              },
              yaxis: {
                title: 'y',
                range: [0,1],
                hoverformat: ".3r"
              },
              hovermode: 'closest',
          };
          
        
          Plotly.newPlot(this.params.divID, data,layout);
    }

    plot_yx_constTz(){
      // For constant T and z

      // Arrays storing scatter data
      let y = [];
      let x = [];
      let P = [];

      let R; // Temporary Rachford Rice solutions
      let Pmin = this.params.Pmin; let Pmax = this.params.Pmax;
      let step = (this.params.Pmax-this.params.Pmin)/this.params.numPoints;
      for (let i = Pmin; i<Pmax; i+= step){
          R =  new RachfordRice(2,this.R.T, i, this.R.components, this.R.z);
        if (0<=R.v && R.v <= 1){
          y.push(R.y[0]);
          x.push(R.x[0]);
          P.push(i);
        }
      }
      let trace = {
          x: x,
          y: y,
          text: P,
          hovertemplate: '<i>P</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}'
          +'<br><i>x</i>: %{x:.3r}',
          mode: 'lines',
          line: {shape: 'spline'},
          type: 'scatter',
          name: "",
          showlegend: false,
        };
      
        let current = {
          x: [this.R.x[0]],
          y: [this.R.y[0]],
          mode: 'markers',
          type: 'scatter',
          name: "",
          showlegend: false,
          marker: { size: 12 },
          text: [this.R.P],
          hovertemplate: '<i>P</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}'
          +'<br><i>x</i>: %{x:.3r}',
        }

        
        let data = [trace,current];
        let layout = {
          title:'y-x plot (T = '+ Math.round(this.R.T*100)/100 + ' kPa), (z = '+ 
          Math.round(this.R.z[0]*1000)/1000 +' )',
          xaxis: {
              title: 'x',
              range: [0,1],
              hoverformat: ".3r",
            },
            yaxis: {
              title: 'y',
              range: [0,1],
              hoverformat: ".3r"
            },
            hovermode: 'closest',
        };
        
      
        Plotly.newPlot(this.params.divID, data,layout);
  }
}