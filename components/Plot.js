import RachfordRice from "/components/RachfordRice.js"

export default class Plot {
  constructor(params,RR){
    this.params = params; // Plotting parameters
    this.RR = RR; // Rachford Rice current solution
    this.data;
    this.layout;
    this.replot_scheduled = true;
    this.alreadyDrawn = false;

    this.plot_idx = -1; // Nothing selected

    this.T = this.RR.T;
    this.P = this.RR.P;
    this.components = this.RR.components;
    this.z = this.RR.z;

    this.cache = [
      {name: "yx_constP", args:[0,0,0,"",""], data:[], layout:undefined},
      {name: "yx_constT", args:[0,0,0,"",""], data:[],layout:undefined},
      {name: "Txy", args:[0,0,0,"",""], data:[], layout:undefined},
      {name: "Pxy", args:[0,0,0,"",""], data:[], layout:undefined}
    ];
    // args = [T,P,z,components]


    
  }

  schedule_replot(){
    this.replot_scheduled = true;
  }


  draw(){
    this.layout.autosize=true;
    let config = {responsive: true};
    
    if (this.alreadyDrawn){
      Plotly.react(this.params.divID, this.data,this.layout,config)
      this.alreadyDrawn = true;
    } else {
      Plotly.newPlot(this.params.divID, this.data,this.layout,config);
    }
    this.replot_scheduled = false;
  }

   // Constant P Plotting 
   calc_yx_constP(){
     let plot_idx = 0;
     let prev_args = this.cache[plot_idx].args;
     let args = [this.RR.T, this.RR.P, this.RR.z[0], this.RR.components[0],this.RR.components[1]];
     // Plotting for the first time
     if (this.cache[plot_idx].data[0] == undefined){
       // data[0] is trace of 45 degree line
       // Calculate if (1) Not defined
       this.cache[plot_idx].data[0] = this.create_45degLine();
     } 
     if ( (this.cache[plot_idx].data[1] == undefined) || (args[1] != prev_args[1]) 
     || (args[3] != prev_args[3]) || (args[4] != prev_args[4]) ){
        // data[1] is trace of eqm curve
        // Calculate if (1) Not defined (2) P is different (3) components are different
      let z_arr = this.generateZ_arr();
      let points = this.generate_yx_constP_data(z_arr);
      let trace = this.create_trace_yx(points);
      trace.hovertemplate = '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
      this.cache[plot_idx].data[1] = trace; 
     }
     if ( (this.cache[plot_idx].data[1] == undefined) || (args[1] != prev_args[1]) 
     || (args[2] != prev_args[2]) || (args[3] != prev_args[3]) || (args[4] != prev_args[4])){
      // data[2] is trace of eqm curve restricted to only 1 value of z
      // Calculate if (1) Not defined (2) P is different (3) components are different (4) z is different
      let z_arr = [this.RR.z[0]]
      let points_fixedZ = this.generate_yx_constP_data(z_arr);
      let trace = this.create_trace_yx(points_fixedZ);
      trace.hovertemplate = '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
      trace.name = "eqm at z = " + Math.round(this.RR.z[0]*1000)/1000;
      this.cache[plot_idx].data[2] = trace;
     }
     if (true){
       // data[3] is the current point marker
       // Always calculate
       let z_arr = [this.RR.z[0]]
       let points_fixedZ = this.generate_yx_constP_data(z_arr);
       let marker = this.create_marker_yx(points_fixedZ);
       marker.name = "current";
       marker.hovertemplate = '<i>T</i>: %{text:.3r} C'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
       marker.text = [this.RR.T];
      this.cache[plot_idx].data[3] = marker;
     }
     if (this.cache[plot_idx].layout == undefined){
       // Change layout if not defined
       let layout = this.create_layout_yx();
       layout.title = 'y-x plot (P = '+ Math.round(this.RR.P*100)/100 + ' kPa)';
       this.cache[plot_idx].layout = layout;
     }

     // Store the newly calculated data
     this.data = this.cache[plot_idx].data;
     this.layout = this.cache[plot_idx].layout;

     // Save the arguments used by the plot
     this.cache[plot_idx].args = args;
  }

    // Constant T Plotting 
    calc_yx_constT(){
      let plot_idx = 1;
      let prev_args = this.cache[plot_idx].args;
      let args = [this.RR.T, this.RR.P, this.RR.z[0], this.RR.components[0],this.RR.components[1]];
       // Plotting for the first time
       if (this.cache[plot_idx].data[0] == undefined){
         // data[0] is trace of 45 degree line
         // Calculate if (1) Not defined
         this.cache[plot_idx].data[0] = this.create_45degLine();
       } 
       if ( (this.cache[plot_idx].data[1] == undefined) || (args[0] != prev_args[0]) 
       || (args[3] != prev_args[3]) || (args[4] != prev_args[4]) ){
          // data[1] is trace of eqm curve
          // Calculate if (1) Not defined (2) T is different (3) components are different
        let z_arr = this.generateZ_arr();
        let points = this.generate_yx_constT_data(z_arr);
        let trace = this.create_trace_yx(points);
        trace.hovertemplate = '<i>P</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
        this.cache[plot_idx].data[1] = trace; 
       }
       if ( (this.cache[plot_idx].data[1] == undefined) || (args[0] != prev_args[0]) 
       || (args[2] != prev_args[2]) || (args[3] != prev_args[3]) || (args[4] != prev_args[4]) ){
        // data[2] is trace of eqm curve restricted to only 1 value of z
        // Calculate if (1) Not defined (2) T is different (3) components are different (4) z is different
        let z_arr = [this.RR.z[0]]
        let points_fixedZ = this.generate_yx_constT_data(z_arr);
        let trace = this.create_trace_yx(points_fixedZ);
        trace.hovertemplate = '<i>P</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
        trace.name = "eqm at z = " + Math.round(this.RR.z[0]*1000)/1000;
        this.cache[plot_idx].data[2] = trace;
       }
       if (true){
         // data[3] is the current point marker
         // Always calculate
         let z_arr = [this.RR.z[0]]
         let points_fixedZ = this.generate_yx_constT_data(z_arr);
         let marker = this.create_marker_yx(points_fixedZ);
         marker.name = "current";
         marker.hovertemplate = '<i>P</i>: %{text:.3r} kPa'+' <br><i>y</i>: %{y:.3r}' +'<br><i>x</i>: %{x:.3r}';
         marker.text = [this.RR.P];
        this.cache[plot_idx].data[3] = marker;
       }
       if (this.cache[plot_idx].layout == undefined){
         // Change layout if not defined
         let layout = this.create_layout_yx();
         layout.title = 'y-x plot (T = '+ Math.round(this.RR.T*100)/100 + ' C)';
         this.cache[plot_idx].layout = layout;
       }
  
       // Store the newly calculated data
       this.data = this.cache[plot_idx].data;
       this.layout = this.cache[plot_idx].layout;
  
       // Save the arguments used by the plot
       this.cache[plot_idx].args = args;
    }

    calc_Txy(){
      let plot_idx = 2;
      let prev_args = this.cache[plot_idx].args;
      let args = [this.RR.T, this.RR.P, this.RR.z[0], this.RR.components[0],this.RR.components[1]];

      // Generate points for entire range of z values
      let z_arr = this.generateZ_arr();
      let points = this.generate_yx_constP_data(z_arr);
       // Plotting for the first time
       if ( (this.cache[plot_idx].data[0] == undefined) || (args[1] != prev_args[1]) 
       || (args[3] != prev_args[3]) || (args[4] != prev_args[4]) ){
         // data[0] is the bubble point curve
         // Calculated if (1) Not defined (2) P changed (3) Components changed
        let trace_bbp = this.create_trace_bbp(points);
        trace_bbp.hovertemplate = '<i>T</i>: %{y:.3r} C'+' <br><i>x</i>: %{x:.3r}';
        this.cache[plot_idx].data[0] = trace_bbp;
       }
       if ( (this.cache[plot_idx].data[1] == undefined) || (args[1] != prev_args[1]) 
       || (args[3] != prev_args[3]) || (args[4] != prev_args[4]) ){
        // data[1] is the dew point curve
        // Calculated if (1) Not defined (2) P changed (3) Components changed
        let trace_dp = this.create_trace_dp(points);
        trace_dp.hovertemplate = '<i>T</i>: %{y:.3r} C'+' <br><i>y</i>: %{y:.3r}';
        this.cache[plot_idx].data[1] = trace_dp;
       }
       if (true){
         // data[2] is tieline or point in 1 phase region
         // always calculate
        let tieline = this.create_tieline(this.RR.T);
        tieline.hovertemplate = '<i>T</i>: %{y:.3r}'+' <br><i>%{text}</i>: %{x:.3r}';
        this.cache[plot_idx].data[2] = tieline;
       }
       if (this.cache[plot_idx].layout == undefined){
         // set if layout is undefined
        this.cache[plot_idx].layout = this.create_layout_Txy();
       }
  
       // Store the newly calculated data
       this.data = this.cache[plot_idx].data;
       this.layout = this.cache[plot_idx].layout;
  
       // Save the arguments used by the plot
       this.cache[plot_idx].args = args;
      // // Plots (x,T) and (y,T) for const P,z
  
      // this.data = [];
  
      // // Generate points for entire range of z values
      // let z_arr = this.generateZ_arr();
      // let points = this.generate_yx_constP_data(z_arr);
      
      // let trace_bbp = this.create_trace_bbp(points);
      // trace_bbp.hovertemplate = '<i>T</i>: %{y:.3r} C'+' <br><i>x</i>: %{x:.3r}';
      // this.data.push(trace_bbp);
  
      // let trace_dp = this.create_trace_dp(points);
      // trace_dp.hovertemplate = '<i>T</i>: %{y:.3r} C'+' <br><i>y</i>: %{y:.3r}';
      // this.data.push(trace_dp);
  
      // let tieline = this.create_tieline(this.RR.T);
      // tieline.hovertemplate = '<i>T</i>: %{y:.3r}'+' <br><i>%{text}</i>: %{x:.3r}';
      // this.data.push(tieline);
  
      // this.layout = this.create_layout_Txy();
    }
  
    calc_Pxy(){
      let plot_idx = 3;
      let prev_args = this.cache[plot_idx].args;
      let args = [this.RR.T, this.RR.P, this.RR.z[0], this.RR.components[0],this.RR.components[1]];

      // Generate points for entire range of z values
      let z_arr = this.generateZ_arr();
      let points = this.generate_yx_constT_data(z_arr);
       // Plotting for the first time
       if ( (this.cache[plot_idx].data[0] == undefined) || (args[0] != prev_args[0]) 
       || (args[3] != prev_args[3]) || (args[4] != prev_args[4]) ){
         // data[0] is the bubble point curve
         // Calculated if (1) Not defined (2) T changed (3) Components changed
        let trace_bbp = this.create_trace_bbp(points);
        trace_bbp.hovertemplate = '<i>P</i>: %{y:.3r} kPa'+' <br><i>x</i>: %{x:.3r}';
        this.cache[plot_idx].data[0] = trace_bbp;
       }
       if ( (this.cache[plot_idx].data[1] == undefined) || (args[0] != prev_args[0]) 
       || (args[3] != prev_args[3]) || (args[4] != prev_args[4]) ){
        // data[1] is the dew point curve
        // Calculated if (1) Not defined (2) T changed
        let trace_dp = this.create_trace_dp(points);
        trace_dp.hovertemplate = '<i>P</i>: %{y:.3r} kPa'+' <br><i>y</i>: %{y:.3r}';
        this.cache[plot_idx].data[1] = trace_dp;
       }
       if (true){
         // data[2] is tieline or point in 1 phase region
         // always calculate
        let tieline = this.create_tieline(this.RR.P);
        tieline.hovertemplate = '<i>P</i>: %{y:.3r}'+' <br><i>%{text}</i>: %{x:.3r}';
        this.cache[plot_idx].data[2] = tieline;
       }
       if (this.cache[plot_idx].layout == undefined){
         // set if layout is undefined
        this.cache[plot_idx].layout = this.create_layout_Pxy();
       }
  
       // Store the newly calculated data
       this.data = this.cache[plot_idx].data;
       this.layout = this.cache[plot_idx].layout;
  
       // Save the arguments used by the plot
       this.cache[plot_idx].args = args;
      // // // Plots (x,T) and (y,T) for const P,z
      // // Plots (x,T) and (y,T) for const P,z
  
      // this.data = [];
  
      // // Generate points for entire range of z values
      // let z_arr = this.generateZ_arr();
      // let points = this.generate_yx_constT_data(z_arr);
      
      // let trace_bbp = this.create_trace_bbp(points);
      // trace_bbp.hovertemplate = '<i>P</i>: %{y:.3r} kPa'+' <br><i>x</i>: %{x:.3r}';
      // this.data.push(trace_bbp);
  
      // let trace_dp = this.create_trace_dp(points);
      // trace_dp.hovertemplate = '<i>P</i>: %{y:.3r} kPa'+' <br><i>y</i>: %{y:.3r}';
      // this.data.push(trace_dp);
  
      // let tieline = this.create_tieline(this.RR.P);
      // tieline.hovertemplate = '<i>P</i>: %{y:.3r}'+' <br><i>%{text}</i>: %{x:.3r}';
      // this.data.push(tieline);
  
      // this.layout = this.create_layout_Pxy();
  
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
      name: 'eqm'
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

function is_arr_eq(arr1,arr2){
  if (arr1.length != arr2.length){
    return false;
  } 
  for (let i = 0; i<arr1.length;i++){
    if (arr1[i] != arr2[i]){
      return false;
    }
  }
  return true;
}
