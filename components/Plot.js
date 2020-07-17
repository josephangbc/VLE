import RachfordRice from "/components/RachfordRice.js"

export default class Plot {
    constructor(params,R){
      this.params = params; // Plotting parameters
      this.R = R; // Rachford Rice current solution
    }
    plot_yx_constPz(zA_array = [this.R.z[0]]){
        // For constant P and zW
        // let zA_array = [this.R.z[0]];
        let points =  this.generate_yx_constP_data(zA_array);

        // Arrays storing scatter data
        let x = points.map(x=>x[0])
        let y = points.map(x=>x[1])
        let T = points.map(x=>x[2])
        let trace = {
            x: x,
            y: y,
            text: T,
            hovertemplate: '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}'
            +'<br><i>x</i>: %{x:.3r}',
            mode: 'scatter',
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

    plot_yx_constP(){
      // Plots (x,y) for const P for several z values
      let zA_array = [];
      for (let i = 0; i <= 1; i+= 0.01){
        zA_array.push(i);
      }
      this.plot_yx_constPz(zA_array)
    }

    plot_Txy_constPz(zA_array = [this.R.z[0]]){
      // Plots (x,T) and (y,T) for const P,z
      // Need to find the saturation points
      let points =  this.generate_yx_constP_data(zA_array);
      let x = points.map(x=>x[0])
      let y = points.map(x=>x[1])
      let T = points.map(x=>x[2])
      let traceX = {
        x: x,
        y: T,
        text: T,
        hovertemplate: '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}'
        +'<br><i>x</i>: %{x:.3r}',
        mode: 'scatter',
        line: {shape: 'spline'},
        type: 'scatter',
        name: "",
        showlegend: false,
      };
      let traceY = {
        x: y,
        y: T,
        text: T,
        hovertemplate: '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}'
        +'<br><i>x</i>: %{x:.3r}',
        mode: 'scatter',
        line: {shape: 'spline'},
        type: 'scatter',
        name: "",
        showlegend: false,
      };
  
      let current = {
        x: [this.R.x[0],this.R.y[0]],
        y: [this.R.T,this.R.T],
        mode: 'markers',
        type: 'scatter',
        name: "",
        showlegend: false,
        marker: { size: 12 },
        text: [this.R.T,this.R.T],
        hovertemplate: '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}'
        +'<br><i>x</i>: %{x:.3r}',
      }


      
      let data = [traceX, traceY, current];
      let layout = {
        title:'T-x-y plot (P = '+ Math.round(this.R.P*100)/100 + ' kPa), (z = '+ 
        Math.round(this.R.z[0]*1000)/1000 +' )',
        xaxis: {
            title: 'x,y',
            range: [0,1],
            hoverformat: ".3r",
          },
          yaxis: {
            title: 'T',
            range: [this.params.Tmin, this.params.Tmax],
            hoverformat: ".3r"
          },
          hovermode: 'closest',
      };
      Plotly.newPlot(this.params.divID, data,layout);
    }

    plot_Txy_constP(){
      let zA_array = [];
      for (let i = 0; i <= 1; i+= 0.01){
        zA_array.push(i);
      }
      this.plot_Txy_constPz(zA_array)
    }



    generate_yx_constP_data(zA_array){
      // Generates x,y,T values for a bunch of zA data at constant P
      let points = [];
      let R; // Temporary Rachford Rice solutions
      let Tmin = this.params.Tmin; let Tmax = this.params.Tmax;
      let step = (this.params.Tmax-this.params.Tmin)/this.params.numPoints;
      
      for (let zA of zA_array){
        for (let i = Tmin; i<Tmax; i+= step){
          R =  new RachfordRice(2,i, this.R.P, this.R.components, [zA,1-zA]);
          if (0<=R.v && R.v <= 1){
            points.push([R.x[0],R.y[0],i])
          }
        }
      }
      points = points.sort((a,b)=> ((a>=b)?1:-1));
      return points;
    }

    plot_yx_constTz(zA_array = [this.R.z[0]]){
      // For constant T and z
      // let zA_array = [this.R.z[0]];
      let points =  this.generate_yx_constT_data(zA_array);
      // Arrays storing scatter data
      let x = points.map(x=>x[0])
      let y = points.map(x=>x[1])
      let P = points.map(x=>x[2])
      let trace = {
          x: x,
          y: y,
          text: P,
          hovertemplate: '<i>P</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}'
          +'<br><i>x</i>: %{x:.3r}',
          mode: 'scatter',
          // line: {shape: 'spline'},
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
  
  plot_yx_constT(){
    // Plots (y,x) for const T for several z values
    let zA_array = [];
    for (let i = 0; i <= 1; i+= 0.01){
      zA_array.push(i);
    }
    this.plot_yx_constTz(zA_array)
  }

  generate_yx_constT_data(zA_array){
    // Generates x,y,P values for a bunch of zA data at constant P
    let points = [];
    let R; // Temporary Rachford Rice solutions
    let Pmin = this.params.Pmin; let Pmax = this.params.Pmax;
    let step = (this.params.Pmax-this.params.Pmin)/this.params.numPoints;
    
    for (let zA of zA_array){
      for (let i = Pmin; i<Pmax; i+= step){
        R =  new RachfordRice(2,this.R.T, i, this.R.components, [zA,1-zA]);
        if (0<=R.v && R.v <= 1){
          points.push([R.x[0],R.y[0],i])
        }
      }
    }
    points = points.sort((a,b)=> ((a<=b)?1:-1));
    return points;
  }

  plotTxy_constP(){
    // For constant P

  }
}