import RachfordRice from "/components/RachfordRice.js"

export default class Plot {
  constructor(params,RR){
    this.params = params; // Plotting parameters
    this.RR = RR; // Rachford Rice current solution
    this.data;
    this.layout;
    this.plot_options = ["yx_constP","yx_constT","Txy","Pxy"];
    this.curr_opt = -1; // tracks currently selected plot option

    // Following variables to check which variable deviated
    this.T = this.RR.T;
    this.P = this.RR.P;
    this.z = this.RR.z;
    this.components = this.RR.components;

    this.recalc_scheduled = true;
    this.replot_scheduled = true;
    this.lastDrawTime =  new Date().getTime();
  }

  schedule_replot(){
    this.recalc_scheduled = true;
    this.replot_scheduled = true;
  }


  draw(){
    Plotly.newPlot(this.params.divID, this.data,this.layout);
    this.replot_scheduled = false;
    this.lastDrawTime = new Date().getTime();
  }

  generateZ_arr(){
    let z_arr = [];
    let smallerStep = 0.001;
    let step = 0.01;
    let i; 
    for (i = 0; i <= step; i+= smallerStep){
      z_arr.push(i);
    }
    for (i; i <= 1-step; i+= step){
      z_arr.push(i);
    }
    for (i;i<=1; i += smallerStep){
      z_arr.push(i);
    }
    return z_arr
  }

  create_45degLine(){
    let yxline = {
      x: [0,1],
      y: [0,1],
      mode: 'line',
      name: '45 degree line',
      showlegend: false,
    };
    return yxline;
  }

  create_trace_yx(points){
    let x_arr = points.map(x=>x[0]);
    let y_arr = points.map(x=>x[1]);
    let text_arr = points.map(x=>x[2]);
    let trace = {
      x: x_arr,
      y: y_arr,
      text: text_arr,
      hovertemplate: '<i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}',
      mode: 'scatter',
      line: {shape: 'spline'},
      type: 'scatter',
      showlegend: false,
      name: 'yx trace'
    }
    return trace;
  }

  create_trace_bbp(points){
    let x_arr = points.map(x=>x[0]);
    let TorP_arr = points.map(x=>x[2]);

    let trace = {
      x: x_arr,
      y: TorP_arr,
      hovertemplate: '<i>T or P</i>: %{y:.3r}'+' <br><i>x</i>: %{x:.3r}',
      mode: 'scatter',
      line: {shape: 'spline'},
      type: 'scatter',
      name: "bbp",
      showlegend: false,
    };
    return trace;
  }

  create_trace_dp(points){
    let y_arr = points.map(x=>x[1]);
    let TorP_arr = points.map(x=>x[2]);

    let trace = {
      x: y_arr,
      y: TorP_arr,
      hovertemplate: '<i>T or P</i>: %{y:.3r} C'+' <br><i>y</i>: %{y:.3r}',
      mode: 'scatter',
      line: {shape: 'spline'},
      type: 'scatter',
      name: "dp",
      showlegend: false,
    };
    return trace;
  }

  create_tieline(TorP){
    let x_arr, TorP_arr, text_arr, mode;
    if (0 <= this.RR.v && this.RR.v <= 1){
      if (this.RR.x[0] < this.RR.y[0]){
        x_arr = [this.RR.x[0],this.RR.z[0],this.RR.y[0]];
        text_arr = ["x","z","y"]
      } else {
        x_arr = [this.RR.y[0],this.RR.z[0],this.RR.x[0]];
        text_arr = ["y","z","x"]
      }
      TorP_arr = [TorP,TorP,TorP];
      mode = "scatter"
    } else {
      x_arr = [this.RR.z[0]];
      TorP_arr = [TorP];
      text_arr = ["z"]
      mode = "markers";
    }

    let tieline = {
      x: x_arr,
      y: TorP_arr,
      mode: mode,
      type: 'scatter',
      name: "current",
      showlegend: false,
      marker: { size: 12 },
      text: text_arr,
      hovertemplate: '<i>T or P</i>: %{y:.3r}'+' <br><i>%{text}</i>: %{x:.3r}',
    }
    return tieline;
  }

  create_marker_yx(points){
    let x, y;
    let x_arr = [];
    let y_arr = [];
    if (points.length > 0){
      points.sort((a,b)=> ((a[3]>b[3])?1:a[3]==b[3]?0:-1)); // sorted by v
      let bbp = points[0]; 
      let dp = points[points.length-1];
      if (this.RR.v > 1){
        x = dp[0]; y = dp[1] // superheated vapor -> marker at dp
      } else if (this.RR.v < 0){
        x = bbp[0]; y =  bbp[1]; // subcooled liquid -> marker at bbp
      } else {
        x = this.RR.x[0]; y = this.RR.y[0]; // binary mixture -> marker at calculated value
      } 
      x_arr.push(x); y_arr.push(y);
    }
    let  marker = {
        x: x_arr,
        y: y_arr,
        mode: 'markers',
        type: 'scatter',
        name: "current",
        showlegend: false,
        marker: { size: 12 },
        name: 'yx marker',
        hovertemplate: '<i>y</i>: %{y:.3r}'+'<br><i>x</i>: %{x:.3r}',
      }
      return marker;
  }

  create_layout_yx(){
    let layout = {
      title: 'y-x plot',
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
    return layout;
  }

  create_layout_Txy(){
    let title = 'y-x plot (P = '+ Math.round(this.RR.P*100)/100 + ' kPa)'
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
    return layout;
  }

  create_layout_Pxy(){
    let title = 'y-x plot (T = ' + Math.round(this.RR.T*100)/100 + ' C)';
    let layout = {
      title: title,
      xaxis: {
          title: 'x,y',
          range: [0,1],
          hoverformat: ".3r",
        },
        yaxis: {
          title: 'T (C)',
          range: [this.params.Pmin, this.params.Pmax],
          hoverformat: ".3r"
        },
        hovermode: 'closest',
    };
    return layout;
  }
  // Constant P Plotting 
  calc_yx_constP(){
    this.data = []; // reset data
    let xyLine = this.create_45degLine(); // 45 degree line to data
    this.data.push(xyLine);

    // Generate points for entire range of z values
    let z_arr = this.generateZ_arr();
    let points = this.generate_yx_constP_data(z_arr);
    let trace_eqm = this.create_trace_yx(points);
    trace_eqm.hovertemplate = '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
    trace_eqm.name = "eqm";
    this.data.push(trace_eqm);

    // Generate points for current value of z
    let zA = this.RR.z[0];
    z_arr = [zA];
    let points_fixedZ = this.generate_yx_constP_data(z_arr);
    let trace_eqm_fixedZ = this.create_trace_yx(points_fixedZ);
    trace_eqm_fixedZ.hovertemplate = '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
    trace_eqm_fixedZ.name = "eqm at z = " + Math.round(this.RR.z[0]*1000)/1000;
    this.data.push(trace_eqm_fixedZ);

    // Current point on (x,y) graph
    let marker = this.create_marker_yx(points_fixedZ);
    marker.name = "current";
    marker.hovertemplate = '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
    marker.text = [this.RR.T];
    this.data.push(marker);

    let title = 'y-x plot (P = '+ Math.round(this.RR.P*100)/100 + ' kPa)';
      
    this.layout =  this.create_layout_yx();
    this.layout.title = title;
    this.recalc_scheduled = false;

    this.curr_opt = 0;
  }

  // Constant T Plotting 
  calc_yx_constT(){
    this.data = []; // reset data
    let xyLine = this.create_45degLine(); // 45 degree line to data
    this.data.push(xyLine);

    // Generate points for entire range of z values
    let z_arr = this.generateZ_arr();
    let points = this.generate_yx_constT_data(z_arr);
    let trace_eqm = this.create_trace_yx(points);
    trace_eqm.hovertemplate = '<i>P</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
    trace_eqm.name = "eqm";
    this.data.push(trace_eqm);

    // Generate points for current value of z
    let zA = this.RR.z[0];
    z_arr = [zA];
    let points_fixedZ = this.generate_yx_constT_data(z_arr);
    let trace_eqm_fixedZ = this.create_trace_yx(points_fixedZ);
    trace_eqm_fixedZ.hovertemplate = '<i>P</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
    trace_eqm_fixedZ.name = "eqm at z = " + Math.round(this.RR.z[0]*1000)/1000;
    this.data.push(trace_eqm_fixedZ);

    // Current point on (x,y) graph
    let marker = this.create_marker_yx(points_fixedZ);
    marker.name = "current";
    marker.hovertemplate = '<i>P</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
    marker.text = [this.RR.P];
    this.data.push(marker);

    let title = 'y-x plot (T = '+ Math.round(this.RR.T*100)/100 + ' C)';
      
    this.layout =  this.create_layout_yx();
    this.layout.title = title;
    this.recalc_scheduled = false;

    this.curr_opt = 1;
  }

  calc_Txy(){
    // Plots (x,T) and (y,T) for const P,z

    this.data = [];

    // Generate points for entire range of z values
    let z_arr = this.generateZ_arr();
    let points = this.generate_yx_constP_data(z_arr);
    
    let trace_bbp = this.create_trace_bbp(points);
    trace_bbp.hovertemplate = '<i>T</i>: %{y:.3r} C'+' <br><i>x</i>: %{x:.3r}';
    this.data.push(trace_bbp);

    let trace_dp = this.create_trace_dp(points);
    trace_dp.hovertemplate = '<i>T</i>: %{y:.3r} C'+' <br><i>y</i>: %{y:.3r}';
    this.data.push(trace_dp);

    let tieline = this.create_tieline(this.RR.T);
    tieline.hovertemplate = '<i>T</i>: %{y:.3r}'+' <br><i>%{text}</i>: %{x:.3r}';
    this.data.push(tieline);

    this.layout = this.create_layout_Txy();
    this.recalc_scheduled = false;

    this.curr_opt = 2;
  }

  calc_Pxy(){
    // Plots (x,T) and (y,T) for const P,z

    this.data = [];

    // Generate points for entire range of z values
    let z_arr = this.generateZ_arr();
    let points = this.generate_yx_constT_data(z_arr);
    
    let trace_bbp = this.create_trace_bbp(points);
    trace_bbp.hovertemplate = '<i>P</i>: %{y:.3r} kPa'+' <br><i>x</i>: %{x:.3r}';
    this.data.push(trace_bbp);

    let trace_dp = this.create_trace_dp(points);
    trace_dp.hovertemplate = '<i>P</i>: %{y:.3r} kPa'+' <br><i>y</i>: %{y:.3r}';
    this.data.push(trace_dp);

    let tieline = this.create_tieline(this.RR.P);
    tieline.hovertemplate = '<i>P</i>: %{y:.3r}'+' <br><i>%{text}</i>: %{x:.3r}';
    this.data.push(tieline);

    this.layout = this.create_layout_Pxy();
    this.recalc_scheduled = false;

    this.curr_opt = 3;
  }


  generate_yx_constP_data(zA_arr){
    // Generates (x,y,T) values for a bunch of zA data at constant P
    // Then combine them together by sorting with x values
    let points = [];

    let RR; // Temporary Rachford Rice solutions
    let Tmin = this.params.Tmin; let Tmax = this.params.Tmax;
    let step = (Tmax-Tmin)/this.params.numPoints;
    RR = new RachfordRice(2,Tmin,this.RR.P,this.RR.components,[zA_arr[0],1-zA_arr[0]])
    for (let zA of zA_arr){
      RR.setZ([zA,1-zA]);
      for (let i = Tmin; i<=Tmax; i+= step){
        RR.setT(i);
        if (0<=RR.v && RR.v <= 1){
          points.push([RR.x[0],RR.y[0],i,RR.v])
        }
      }
    }
    points = points.sort((a,b)=> ((a[0]>b[0])?1:a[0]==b[0]?0:-1)); // sorted by x
    return points;
  }

  generate_yx_constT_data(zA_arr){
    // Generates (x,y,P) values for a bunch of zA data at constant T
    // Then combine them together by sorting with x values
    let points = [];

    let RR; // Temporary Rachford Rice solutions
    let Pmin = this.params.Pmin; let Pmax = this.params.Pmax;
    let step = (Pmax-Pmin)/this.params.numPoints;
    RR = new RachfordRice(2,this.RR.T,Pmin,this.RR.components,[zA_arr[0],1-zA_arr[0]])
    for (let zA of zA_arr){
      RR.setZ([zA,1-zA]);
      for (let i = Pmin; i<=Pmax; i+= step){
        RR.setP(i);
        if (0<=RR.v && RR.v <= 1){
          points.push([RR.x[0],RR.y[0],i,RR.v])
        }
      }
    }
    points = points.sort((a,b)=> ((a[0]>b[0])?1:a[0]==b[0]?0:-1)); // sorted by x
    return points;
  }

}