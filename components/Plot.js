import RachfordRice from "/components/RachfordRice.js"

export default class Plot {
  constructor(params,R){
    this.params = params; // Plotting parameters
    this.R = R; // Rachford Rice current solution
  }

  // Constant P Plotting 
  plot_yx_constPz(zA_arr = [this.R.z[0]]){
    // For constant P and z
    let points =  this.generate_yx_constP_data(zA_arr); // format (x,y,T,v)

    // Arrays storing scatter data
    let x = points.map(x=>x[0])
    let y = points.map(x=>x[1])
    let T = points.map(x=>x[2])

    // trace of (x,y) plot at constant P and z by varying T
    let trace = {
      x: x,
      y: y,
      text: T,
      hovertemplate: '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}',
      mode: 'scatter',
      line: {shape: 'spline'},
      type: 'scatter',
      name: "eqm",
      showlegend: false,
    };

    let yxline = {
      x: [0,1],
      y: [0,1],
      mode: 'line',
      name: '45 degree line',
      showlegend: false,
    };

    let data = [trace,yxline];
    // Current point on (x,y) graph
    let current_x, current_y, current;
    let current_points = this.generate_yx_constP_data([this.R.z[0]]);
    current_points = current_points.sort((a,b)=> ((a[3]>b[3])?1:a[3]==b[3]?0:-1)); // sorted by v
    if (current_points.length>0){
      let bbp = current_points[0]; 
      let dp = current_points[current_points.length-1];
      if (this.R.v > 1){
        current_x = dp[0]; current_y = dp[1] // superheated vapor -> marker at dp
      } else if (this.R.v < 0){
        current_x = bbp[0]; current_y =  bbp[1]; // subcooled liquid -> marker at bbp
      } else {
        current_x = this.R.x[0]; current_y = this.R.y[0]; // binary mixture -> marker at calculated value
      } 
      current = {
        x: [current_x],
        y: [current_y],
        mode: 'markers',
        type: 'scatter',
        name: "current",
        showlegend: false,
        marker: { size: 12 },
        text: [this.R.T],
        hovertemplate: '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}'+'<br><i>x</i>: %{x:.3r}',
      }
      data.push(current);
    }

    let title;
    if (zA_arr.length > 1){
      title = 'y-x plot (P = '+ Math.round(this.R.P*100)/100 + ' kPa)' // multiple zA values
    } else {
      title = 'y-x plot (P = '+ Math.round(this.R.P*100)/100 + ' kPa), (z = '+ Math.round(this.R.z[0]*1000)/1000 +' )'
    }
      
    let layout = {
      title: title,
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
    // Plots (x,y) for const P for several z values combined
    let zA_arr = [];
    let smallerStep = 0.001;
    let step = 0.01;
    let i; 
    for (i = 0; i <= step; i+= smallerStep){
      zA_arr.push(i);
    }
    for (i; i <= 1-step; i+= step){
      zA_arr.push(i);
    }
    for (i;i<=1; i += smallerStep){
      zA_arr.push(i);
    }
    this.plot_yx_constPz(zA_arr)
  }

  plot_Txy_constPz(zA_arr = [this.R.z[0]]){
    // Plots (x,T) and (y,T) for const P,z

    let points =  this.generate_yx_constP_data(zA_arr); // format (x,y,T,v)
    let x = points.map(x=>x[0])
    let y = points.map(x=>x[1])
    let T = points.map(x=>x[2])
    
    // trace of (x,T) plot at constant P and z
    let traceX = {
      x: x,
      y: T,
      hovertemplate: '<i>T</i>: %{y:.3r} C'+' <br><i>x</i>: %{x:.3r}',
      mode: 'scatter',
      line: {shape: 'spline'},
      type: 'scatter',
      name: "bbp",
      showlegend: false,
    };
    // trace of (y,T) plot at constant P and z
    let traceY = {
      x: y,
      y: T,
      hovertemplate: '<i>T</i>: %{y:.3r} C'+' <br><i>y</i>: %{y:.3r}',
      mode: 'scatter',
      line: {shape: 'spline'},
      type: 'scatter',
      name: "dp",
      showlegend: false,
    };


    let x_markers, T_markers, text_markers, mode;
    if (0 <= this.R.v && this.R.v <= 1){
      if (this.R.x[0] < this.R.y[0]){
        x_markers = [this.R.x[0],this.R.z[0],this.R.y[0]];
        text_markers = ["x","z","y"]
      } else {
        x_markers = [this.R.y[0],this.R.z[0],this.R.x[0]];
        text_markers = ["y","z","x"]
      }
      T_markers = [this.R.T,this.R.T,this.R.T];
      mode = "scatter"
    } else {
      x_markers = [this.R.z[0]];
      T_markers = [this.R.T];
      text_markers = ["z"]
      mode = "markers";
    }

    let current = {
      x: x_markers,
      y: T_markers,
      mode: mode,
      type: 'scatter',
      name: "current",
      showlegend: false,
      marker: { size: 12 },
      text: text_markers,
      hovertemplate: '<i>T</i>: %{y:.3r} C'+' <br><i>%{text}</i>: %{x:.3r}',
    }

    let data = [traceX, traceY, current];

    let title = 'y-x plot (P = '+ Math.round(this.R.P*100)/100 + ' kPa), (z = '+ Math.round(this.R.z[0]*1000)/1000 +' )'
    if (zA_arr.length > 1){
      title = 'y-x plot (P = '+ Math.round(this.R.P*100)/100 + ' kPa)' // multiple zA values
    }
    let layout = {
      title: title,
      xaxis: {
          title: 'x,y',
          range: [0,1],
          hoverformat: ".3r",
        },
        yaxis: {
          title: 'T (C)',
          range: [this.params.Tmin, this.params.Tmax],
          hoverformat: ".3r"
        },
        hovermode: 'closest',
    };
    Plotly.newPlot(this.params.divID, data,layout);
  }

  plot_Txy_constP(){
    let zA_arr = [];
    let smallerStep = 0.001;
    let step = 0.01;
    let i; 
    for (i = 0; i <= step; i+= smallerStep){
      zA_arr.push(i);
    }
    for (i; i <= 1-step; i+= step){
      zA_arr.push(i);
    }
    for (i;i<=1; i += smallerStep){
      zA_arr.push(i);
    }
    this.plot_Txy_constPz(zA_arr)
  }

  generate_yx_constP_data(zA_arr){
    // Generates (x,y,T) values for a bunch of zA data at constant P
    // Then combine them together by sorting with x values
    let points = [];

    let R; // Temporary Rachford Rice solutions
    let Tmin = this.params.Tmin; let Tmax = this.params.Tmax;
    let step = (Tmax-Tmin)/this.params.numPoints;
    R = new RachfordRice(2,Tmin,this.R.P,this.R.components,[zA_arr[0],1-zA_arr[0]])
    for (let zA of zA_arr){
      R.setZ([zA,1-zA]);
      for (let i = Tmin; i<=Tmax; i+= step){
        R.setT(i);
        if (0<=R.v && R.v <= 1){
          points.push([R.x[0],R.y[0],i,R.v])
        }
      }
    }
    points = points.sort((a,b)=> ((a[0]>b[0])?1:a[3]==b[3]?0:-1)); // sorted by x
    let data = {};
    return points;
  }


  // Constant T Plotting 
  plot_yx_constTz(zA_arr = [this.R.z[0]]){
    // For constant P and z
    let points =  this.generate_yx_constT_data(zA_arr); // format (x,y,T,v)

    // Arrays storing scatter data
    let x = points.map(x=>x[0])
    let y = points.map(x=>x[1])
    let P = points.map(x=>x[2])

    // trace of (x,y) plot at constant P and z by varying T
    let trace = {
      x: x,
      y: y,
      text: P,
      hovertemplate: '<i>P</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}',
      mode: 'scatter',
      line: {shape: 'spline'},
      type: 'scatter',
      name: "eqm",
      showlegend: false,
    };
    let yxline = {
      x: [0,1],
      y: [0,1],
      mode: 'line',
      name: '45 degree line',
      showlegend: false,
    };

    let data = [trace,yxline];
    // Current point on (x,y) graph
    let current_x, current_y, current;
    let current_points = this.generate_yx_constT_data([this.R.z[0]]);
    current_points = current_points.sort((a,b)=> ((a[3]>b[3])?1:a[3]==b[3]?0:-1)); // sorted by v
    if (current_points.length>0){
      let bbp = current_points[0]; 
      let dp = current_points[current_points.length-1];
      if (this.R.v > 1){
        current_x = dp[0]; current_y = dp[1] // superheated vapor -> marker at dp
      } else if (this.R.v < 0){
        current_x = bbp[0]; current_y =  bbp[1]; // subcooled liquid -> marker at bbp
      } else {
        current_x = this.R.x[0]; current_y = this.R.y[0]; // binary mixture -> marker at calculated value
      } 
      // current point marker
      current = {
        x: [current_x],
        y: [current_y],
        mode: 'markers',
        type: 'scatter',
        name: "current",
        showlegend: false,
        marker: { size: 12 },
        text: [this.R.P],
        hovertemplate: '<i>P</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}'+'<br><i>x</i>: %{x:.3r}',
      }
      data.push(current);
    }


    let title;
    if (zA_arr.length > 1){
      title = 'y-x plot (T = '+ Math.round(this.R.T*100)/100 + ' C)' // multiple zA values
    } else {
      title = 'y-x plot (T = '+ Math.round(this.R.T*100)/100 + ' C), (z = '+ Math.round(this.R.z[0]*1000)/1000 +' )'
    }
      
    let layout = {
      title: title,
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
    let zA_arr = [];
    let smallerStep = 0.001;
    let step = 0.01;
    let i; 
    for (i = 0; i <= step; i+= smallerStep){
      zA_arr.push(i);
    }
    for (i; i <= 1-step; i+= step){
      zA_arr.push(i);
    }
    for (i;i<=1; i += smallerStep){
      zA_arr.push(i);
    }
    this.plot_yx_constTz(zA_arr)
  }

  plot_Pxy_constTz(zA_arr = [this.R.z[0]]){
    // Plots (x,P) and (y,P) for const T,z

    let points =  this.generate_yx_constT_data(zA_arr); // format (x,y,T,v)
    let x = points.map(x=>x[0])
    let y = points.map(x=>x[1])
    let P = points.map(x=>x[2])
    
    // trace of (x,P) plot at constant T and z
    let traceX = {
      x: x,
      y: P,
      hovertemplate: '<i>P</i>: %{y:.3r} kPa'+' <br><i>x</i>: %{x:.3r}',
      mode: 'scatter',
      line: {shape: 'spline'},
      type: 'scatter',
      name: "bbp",
      showlegend: false,
    };
    // trace of (y,P) plot at constant T and z
    let traceY = {
      x: y,
      y: P,
      hovertemplate: '<i>P</i>: %{y:.3r} kPa'+' <br><i>y</i>: %{y:.3r}',
      mode: 'scatter',
      line: {shape: 'spline'},
      type: 'scatter',
      name: "dp",
      showlegend: false,
    };


    let x_markers, P_markers, text_markers, mode;
    if (0 <= this.R.v && this.R.v <= 1){
      if (this.R.x[0] < this.R.y[0]){
        x_markers = [this.R.x[0],this.R.z[0],this.R.y[0]];
        text_markers = ["x","z","y"]
      } else {
        x_markers = [this.R.y[0],this.R.z[0],this.R.x[0]];
        text_markers = ["y","z","x"]
      }
      P_markers = [this.R.P,this.R.P,this.R.P];
      mode = "scatter"
    } else {
      x_markers = [this.R.z[0]];
      P_markers = [this.R.P];
      text_markers = ["z"]
      mode = "markers";
    }

    let current = {
      x: x_markers,
      y: P_markers,
      mode: mode,
      type: 'scatter',
      name: "current",
      showlegend: false,
      marker: { size: 12 },
      text: text_markers,
      hovertemplate: '<i>T</i>: %{y:.3r} C'+' <br><i>%{text}</i>: %{x:.3r}',
    }

    let data = [traceX, traceY, current];

    let title = 'P-x-y plot (T = '+ Math.round(this.R.P*100)/100 + ' C), (z = '+ Math.round(this.R.z[0]*1000)/1000 +' )'
    if (zA_arr.length > 1){
      title = 'P-x-y plot (T = '+ Math.round(this.R.P*100)/100 + ' C)' // multiple zA values
    }
    let layout = {
      title: title,
      xaxis: {
          title: 'x,y',
          range: [0,1],
          hoverformat: ".3r",
        },
        yaxis: {
          title: 'P (kPa)',
          range: [this.params.Pmin, this.params.Pmax],
          hoverformat: ".3r"
        },
        hovermode: 'closest',
    };
    Plotly.newPlot(this.params.divID, data,layout);
  }

  plot_Pxy_constT(){
    let zA_arr = [];
    let smallerStep = 0.001;
    let step = 0.01;
    let i; 
    for (i = 0; i <= step; i+= smallerStep){
      zA_arr.push(i);
    }
    for (i; i <= 1-step; i+= step){
      zA_arr.push(i);
    }
    for (i;i<=1; i += smallerStep){
      zA_arr.push(i);
    }
    this.plot_Pxy_constTz(zA_arr)
  }

  generate_yx_constT_data(zA_arr){
    // Generates (x,y,P) values for a bunch of zA data at constant T
    // Then combine them together by sorting with x values
    let points = [];

    let R; // Temporary Rachford Rice solutions
    let Pmin = this.params.Pmin; let Pmax = this.params.Pmax;
    let step = (Pmax-Pmin)/this.params.numPoints;
    R = new RachfordRice(2,this.R.T,Pmin,this.R.components,[zA_arr[0],1-zA_arr[0]])
    for (let zA of zA_arr){
      R.setZ([zA,1-zA]);
      for (let i = Pmin; i<=Pmax; i+= step){
        R.setP(i);
        if (0<=R.v && R.v <= 1){
          points.push([R.x[0],R.y[0],i,R.v])
        }
      }
    }
    points = points.sort((a,b)=> ((a[0]>b[0])?1:a[3]==b[3]?0:-1)); // sorted by x
    return points;
  }

}