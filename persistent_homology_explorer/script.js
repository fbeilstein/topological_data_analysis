const canvas1  = document.getElementById("canvas1");
const canvas2  = document.getElementById("canvas2");
const canvas3  = document.getElementById("canvas3");
const output   = document.getElementById("output");
const context1 = canvas1.getContext("2d");
const context2 = canvas2.getContext("2d");
const context3 = canvas3.getContext("2d");
let btn1 = document.getElementsByClassName("btn1")[0];
let btn2 = document.getElementsByClassName("btn2")[0];

//colors
const my_green   = "rgb(144, 238, 144, 0.4)";
const my_coral   = "rgb(240, 128, 128, 0.2)";
const red_histo_color  = "rgb(240, 128, 128, 0.7)";
const my_lightgray  = "rgb(211, 211, 211, 0.2)";
const scan_line_color = "rgb(139, 0, 139, 0.5)"
const blue_histo_color    = "DodgerBlue"
const axis_ticks_labels_color = "lightgray";
const red_curve_color = "lightcoral";
const blue_curve_color ="DodgerBlue";
const label_font  = "12px Verdana";

canvas1.width  = 
canvas1.height = 
canvas2.width  = 
canvas2.height = 
canvas3.width  = 
canvas3.height = parseInt(getComputedStyle(canvas1).getPropertyValue('width'));


//globals
let vertices = [];
let current_point = -1;
const RR = 19*19;
let radius = 15;
let L_data = undefined;
let alpha_filtration = undefined;
let show_balls = true;
let is_cech_not_alpha = true;

const canvas_setup = {"r_max" : 150, "x_off" : 30, "y_off" : 30, "n" : 50}; 

class Vertice {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function get_distance(a,b) {
  return (a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y);
}

function get_closest_vertice(v) {
  for(let i=0; i<vertices.length; ++i)
      if(get_distance(vertices[i], v)<RR) return i;
  return -1;
}

function draw_triangles(context, triangles) {
  for(let i=triangles.length-1; i>=0; --i) {
    context.beginPath();
    context.fillStyle = my_coral; 
    context.moveTo(vertices[triangles[i][0]].x, vertices[triangles[i][0]].y);
    context.lineTo(vertices[triangles[i][1]].x, vertices[triangles[i][1]].y);
    context.lineTo(vertices[triangles[i][2]].x, vertices[triangles[i][2]].y);
    context.lineTo(vertices[triangles[i][0]].x, vertices[triangles[i][0]].y);
    context.fill();
    context.closePath();
  }   
}


function get_lines_alpha(r) { 
  let T = [];
  for (let i = 0; i < alpha_filtration.length; ++i)
  {
    if (alpha_filtration[i][1] < r && alpha_filtration[i][0].length == 2)
      T.push(alpha_filtration[i][0]);
  }
  return T;
}

function get_lines_cech(r) { 
  let lines = [];
  for(let i=0; i<vertices.length; ++i)
    for(let j=i+1; j<vertices.length; ++j)
      if(Math.sqrt(get_distance(vertices[i], vertices[j]))<2*r) lines.push([i, j]);
  return lines;
}

function get_triangles_alpha(r) { 
  let T = [];
  for (let i = 0; i < alpha_filtration.length; ++i)
  {
    if (alpha_filtration[i][1] < r && alpha_filtration[i][0].length == 3)
      T.push(alpha_filtration[i][0]);
  }
  return T;
}
 
function get_triangles_cech(r) { 
  let triangles = [];
  for(let i=0; i<vertices.length; ++i)
    for(let j=i+1; j<vertices.length; ++j)
      for(let k=j+1; k<vertices.length; ++k)
      {
        let l1 = Math.sqrt(get_distance(vertices[i], vertices[j]));
        let l2 = Math.sqrt(get_distance(vertices[j], vertices[k]));
        let l3 = Math.sqrt(get_distance(vertices[i], vertices[k]));
        let p = l1+l2+l3;
        let R = l1*l2*l3 / Math.sqrt(p*(p-2*l1)*(p-2*l2)*(p-2*l3));
        let f1 = Math.sqrt(get_distance(vertices[i], new Vertice((vertices[j].x+vertices[k].x)/2, (vertices[j].y+vertices[k].y)/2)));
        let f2 = Math.sqrt(get_distance(vertices[j], new Vertice((vertices[i].x+vertices[k].x)/2, (vertices[i].y+vertices[k].y)/2)));
        let f3 = Math.sqrt(get_distance(vertices[k], new Vertice((vertices[i].x+vertices[j].x)/2, (vertices[i].y+vertices[j].y)/2)));
        if(l1<2*r && l2<2*r && l3<2*r && (f1<r || f2<r || f3<r || R<r))
          triangles.push([i,j,k]);
      }
  return triangles;
}

function draw_connections(context, lines) {
  for (let i=0; i<lines.length; ++i) {   
    context.fillStyle = context.strokeStyle = "grey";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(vertices[lines[i][0]].x, vertices[lines[i][0]].y);
    context.lineTo(vertices[lines[i][1]].x, vertices[lines[i][1]].y);
    context.stroke();
    context.fill();
    context.closePath();          
  }
}

function draw_points(context) {
    for(let i=0; i<vertices.length; ++i) {
      context.beginPath();
      context.fillStyle = 'gray';
      context.arc(vertices[i].x, vertices[i].y, 3, 0, 2*Math.PI);   
      context.fill();
      context.closePath();
  } 
}

function draw_ball_outlines(context) {
  for(let i=0; i<vertices.length; ++i) {
    context.beginPath();
    context.strokeStyle = 'gray';
    context.arc(vertices[i].x, vertices[i].y, radius, 0, 2*Math.PI);   
    context.stroke();
    context.closePath();
  } 
}

function draw_balls(context) {
  for(let i=0; i<vertices.length; ++i) {
    context.beginPath();
    context.fillStyle = my_green;
    context.arc(vertices[i].x, vertices[i].y, radius, 0, 2*Math.PI);   
    context.fill();
    context.closePath();
  } 
}

function translate_vertices(dx,dy) {
  for(let i=0; vertices.length; ++i) {
    vertices[i].x += dx;
    vertices[i].y += dy;
  }
}

function clear_canvas(context, canvas) {
  canvas.style.backgroundColor = "white";
  context.clearRect(0,0, canvas.width, canvas.height);
}

function update() {
  let lines     = undefined; 
  let triangles = undefined;
  
  if(is_cech_not_alpha){
    lines = get_lines_cech(radius);
    triangles = get_triangles_cech(radius);
  } else {
    lines = get_lines_alpha(radius);
    triangles = get_triangles_alpha(radius);
  }
  
  clear_canvas(context1, canvas1);
  
  if(show_balls) {
    draw_ball_outlines(context1);
    draw_balls(context1);
  }

  draw_triangles(context1, triangles);
  draw_connections(context1, lines);
  draw_points(context1);

  if(L_data != undefined) {
    draw_betti_curves(context2, canvas2, [L_data[1], L_data[2]]);
    draw_betti_histograms(context3, canvas3, L_data[0])
  }
  requestAnimationFrame(update);
}

function radius_plus_delta(delta) {
  if(delta<0 && radius>10-delta) radius += delta;
  if(delta>0 && radius<200)     radius += delta;
}

document.addEventListener('keydown', function (event) {
  if(event.keyCode==49) {
    show_balls = !(show_balls);     
    change_glyph_btn1(button);
  }
});

document.addEventListener('mousewheel', function (event) {
  radius_plus_delta(event.wheelDelta/20);
});

canvas1.addEventListener('mousedown', function(event) {
  const x = event.offsetX;
  const y = event.offsetY;
  current_point = get_closest_vertice(new Vertice(x,y));
});

canvas1.addEventListener('mouseup', function(event) {
  current_point = -1;
});

canvas2.addEventListener('mousemove', function(event) {
  if(event.buttons==1) {
    move_scanning_line(canvas3, event);
  }
});

canvas2.addEventListener('mouseup', function(event) {
  move_scanning_line(canvas2, event);
});

canvas3.addEventListener('mousemove', function(event) {
  if(event.buttons==1) {
    move_scanning_line(canvas3, event);
  }
});

canvas3.addEventListener('mouseup', function(event) {
  move_scanning_line(canvas3, event);
});

function move_scanning_line(canvas, event) {
  let x = event.offsetX;
  let y = event.offsetY;
  let padding = parseInt(getComputedStyle(canvas3).getPropertyValue('padding-left'));
  radius = canvas_setup.r_max * Math.max(0, x - padding-canvas_setup.x_off)/(canvas2.width-canvas_setup.x_off);
}

canvas1.addEventListener('mousemove', function(event) {
  if(event.buttons==4) {
    translate_vertices(event.movementX, event.movementY);
    return 
  } else if(current_point!=-1) {
    let x = event.offsetX;
    let y = event.offsetY;
    vertices[current_point].x = x; 
    vertices[current_point].y = y; 
    alpha_filtration = create_filtration();
    L_data = get_barcodes(alpha_filtration);
  }
});

function add_point(x,y) {
  vertices.push(new Vertice(x,y));
  alpha_filtration = create_filtration()
  L_data = get_barcodes(alpha_filtration);
}

function delete_vertice(i) {
  if(i+1!=vertices.length) 
      [vertices[i], vertices[vertices.length-1]] = [vertices[vertices.length-1], vertices[i]];
  vertices.splice(-1);
  alpha_filtration = create_filtration()
  L_data = get_barcodes(alpha_filtration);
}

canvas1.addEventListener('dblclick', function(event) {
  const x = event.offsetX;
  const y = event.offsetY;
  const current_point = get_closest_vertice(new Vertice(x, y));
  if(current_point!=-1)
    delete_vertice(current_point);
  else
    add_point(x,y);
});

function draw_betti_curves(context, canvas, RB) {
  const red = RB[0].data;
  const blue = RB[1].data;
  const x_off       = canvas_setup.x_off;
  const y_off       = canvas_setup.y_off;
  const r_max       = canvas_setup.r_max;
  const x_ticks     = 10;
  const y_max       = 1+Math.max(RB[0].max, RB[1].max);
  const y_ticks     = y_max;
  const width_off   = canvas.width-x_off;
  const height_off  = canvas.height-y_off;
 
  clear_canvas(context, canvas);
  draw_x_axis(context, canvas, {"x_off" : x_off, "y_off" : y_off, "x_ticks" : x_ticks, "x_max" : r_max, "label" : "r" });
  draw_y_axis(context, canvas, {"x_off" : x_off, "y_off" : y_off, "y_ticks" : y_ticks, "y_max" : y_max, "label" : "betti numbers" });
  draw_scanning_line(context, canvas, {"x_off" : x_off, "y_off" : y_off, "x_ticks" : x_ticks, "x_max" : r_max });
 
  context.lineWidth = 1; // draw red curve
  const n = canvas_setup.n;
  const x_delta = canvas_setup.r_max/n;

  context.strokeStyle = red_curve_color;
  context.beginPath();
  let y_prev = red[0][1];
  context.moveTo(x_off, Math.round(canvas.height-y_off-y_prev*height_off/y_ticks)); 
  for(let i=0; i<red.length; ++i) {    
    let x_curr = Math.round(red[i][0]);
    let y_curr = red[i][1];
    context.lineTo(Math.round(x_off+(width_off/r_max)*x_curr), Math.round(canvas.height-y_off-y_prev*height_off/y_ticks));   
    context.lineTo(Math.round(x_off+(width_off/r_max)*x_curr), Math.round(canvas.height-y_off-y_curr*height_off/y_ticks)); 
    y_prev = y_curr;
    context.stroke();
  } 
  context.closePath();

  if(blue.length>0) {
    if(blue[blue.length-1][1]==0) blue.push([canvas_setup.r_max,0]);
    context.strokeStyle = blue_curve_color;
    context.beginPath();
    y_prev = 0;
    context.moveTo(x_off, Math.round(canvas.height-y_off-y_prev*height_off/y_ticks)); 
    
    for(let i=0; i<blue.length; ++i) {    
      let x_curr = Math.round(blue[i][0]);
      let y_curr = blue[i][1];
      context.lineTo(Math.round(x_off+(width_off/r_max)*x_curr), Math.round(canvas.height-y_off-y_prev*height_off/y_ticks));   
      context.lineTo(Math.round(x_off+(width_off/r_max)*x_curr), Math.round(canvas.height-y_off-y_curr*height_off/y_ticks)); 
      y_prev = y_curr;
      context.stroke();
    } 
    context.closePath();
  }
}

function draw_betti_histograms(context, canvas, L) { 
  clear_canvas(context, canvas);
  if(L==undefined) return;
  const x_off = canvas_setup.x_off;
  const y_off = canvas_setup.y_off;
  const r_max = canvas_setup.r_max;
  const x_ticks = 10;

  draw_x_axis(context, canvas, {"x_off" : x_off, "y_off" : y_off, "x_ticks" : x_ticks, "x_max" : r_max, "label" : "r"  });
  draw_y_axis(context, canvas, {"x_off" : x_off, "y_off" : y_off, "y_ticks" : 0, "y_max" : 0, "label" : "birth/death"  });
  
  let red  = L[0];
  let blue = L[1];
  let h     = 2;
  let  delta = 5;
  let y       = 5;

  if(red.size + blue.size >25)
  {
    h     = 1;
    delta = 2;
    y     = 2;
  }


  for(let key of red)  {
    let start = (canvas.width-x_off)*key[0]/r_max;
    let end = (canvas.width-x_off)*key[1]/r_max;
    context.beginPath();
    context.fillStyle = red_histo_color;
    context.moveTo(x_off+start,   y_off+y);
    context.lineTo(x_off+end, y_off+y);
    context.lineTo(x_off+end, y_off+y+delta);
    context.lineTo(x_off+start,   y_off+y+delta);
    context.lineTo(x_off+start,   y_off+y);
    context.fill();
    context.closePath();
    y += h+delta;
  }

  for(let key of blue) {
    let start = (canvas.width-x_off)*key[0]/r_max;
    let end = (canvas.width-x_off)*key[1]/r_max;
    context.beginPath();
    context.fillStyle = blue_histo_color;
    context.moveTo(x_off+start,   y_off+y);
    context.lineTo(x_off+end, y_off+y);
    context.lineTo(x_off+end, y_off+y+delta);
    context.lineTo(x_off+start,   y_off+y+delta);
    context.lineTo(x_off+start,   y_off+y);
    context.fill();
    context.closePath();
    y += h+delta;
  }
  draw_scanning_line(context, canvas, {"x_off" : x_off, "y_off" : y_off, "x_ticks" : x_ticks, "x_max" : r_max });
}


function draw_scanning_line(context, canvas, params) {
  const x_off   = params.x_off;
  const y_off   = params.y_off;
  const x_max   = params.x_max;

  context.lineWidth = 1;  // vertical scanning line
  context.strokeStyle = scan_line_color;
  context.beginPath();
  context.moveTo(x_off+((canvas.width-x_off)/x_max)*radius, y_off);
  context.lineTo(x_off+((canvas.width-x_off)/x_max)*radius, canvas.height-y_off);
  context.stroke();
  context.closePath();
  context.fillStyle = scan_line_color;
  context.fillText(parseInt(radius), x_off-10+((canvas.width-x_off)/x_max)*radius, y_off-3);
}

function draw_x_axis(context, canvas, params) {
  let x_ticks = params.x_ticks;
  let x_off   = params.x_off;
  let y_off   = params.y_off;
  let x_max   = params.x_max;
  let tick_length = y_off/4;

  for(let i=0; i<x_ticks; ++i) { //draw x-ticks and labels
    context.strokeStyle = axis_ticks_labels_color;
    context.beginPath();
    context.moveTo(x_off+(canvas.width - x_off)*i/x_ticks, canvas.height-y_off+tick_length);
    context.lineTo(x_off+(canvas.width - x_off)*i/x_ticks, canvas.height-y_off);
    context.fillStyle = axis_ticks_labels_color;
    context.font = label_font;
    context.fillText((x_max*i/x_ticks).toString(), x_off-15+(canvas.width - x_off)*i/x_ticks, canvas.height-y_off/4);
    context.stroke();
    context.closePath();  
  }
  context.fillText(params.label, canvas.width-10,  canvas.height-y_off/4);

  context.strokeStyle = axis_ticks_labels_color;  // x-axis
  context.beginPath();
  context.moveTo(x_off, canvas.height-y_off);
  context.lineTo(canvas.width, canvas.height-y_off);
  context.stroke();
  context.closePath();
}

function draw_y_axis(context, canvas, params) {
  const y_ticks = params.y_ticks;
  const x_off   = params.x_off;
  const y_off   = params.y_off;
  const y_max   = params.y_max;
  const tick_length = x_off/4;

  context.lineWidth = 1;
  for(let i=0; i<y_ticks; ++i) { //draw y-ticks and labels
    context.strokeStyle = axis_ticks_labels_color;
    context.beginPath();
    context.moveTo(x_off-tick_length, canvas.height-y_off-(canvas.height-y_off)*i/y_ticks);
    context.lineTo(x_off, canvas.height-y_off-(canvas.height-y_off)*i/y_ticks);
    context.strokeStyle = my_lightgray;
    context.stroke();
    context.lineTo(canvas.width, canvas.height-y_off-(canvas.height-y_off)*i/y_ticks);
    context.stroke();
    context.fillStyle = axis_ticks_labels_color;
    context.font = label_font;
    context.fillText(parseInt(Math.ceil(i*y_max/y_ticks)).toString(), x_off/4, canvas.height+5-y_off-(canvas.height-y_off)*i/y_ticks);
    context.stroke();
    context.closePath();  
  }

  context.strokeStyle = axis_ticks_labels_color;  // y-axis
  context.beginPath();
  context.moveTo(x_off, y_off/2);
  context.lineTo(x_off, canvas.height-y_off);
  context.stroke();
  context.closePath();
  context.fillText(params.label, 10,  10);  //axis label
  context.closePath();  
}


function create_filtration()
{
  // send data there;
  coords = [];
  for(let i = 0; i < vertices.length; ++i)
  {
    coords.push(vertices[i].x);
    coords.push(vertices[i].y);
  }
  let delaunator = new Delaunator(coords);

  //get data from there
  let simplex_data = [];

  const r_crit_triag = (indices) => {
    const [i, j, k] = indices;
    const l1 = Math.sqrt(get_distance(vertices[i], vertices[j]));
    const l2 = Math.sqrt(get_distance(vertices[j], vertices[k]));
    const l3 = Math.sqrt(get_distance(vertices[i], vertices[k]));
    const p = l1 + l2 + l3;
    const R = l1 * l2 * l3 / Math.sqrt(p * (p - 2 * l1) * (p - 2 * l2)*(p - 2 * l3));
    const f1 = Math.sqrt(get_distance(vertices[i], new Vertice((vertices[j].x + vertices[k].x) / 2, (vertices[j].y + vertices[k].y) / 2)));
    const f2 = Math.sqrt(get_distance(vertices[j], new Vertice((vertices[i].x + vertices[k].x) / 2, (vertices[i].y + vertices[k].y) / 2)));
    const f3 = Math.sqrt(get_distance(vertices[k], new Vertice((vertices[i].x + vertices[j].x) / 2, (vertices[i].y + vertices[j].y) / 2)));
    const r_critical = Math.max(Math.min(R, f1, f2, f3), l1/2, l2/2, l3/2);
    return r_critical; 
  }
  for (let idx = 0; idx < delaunator.triangles.length; idx += 3) {
    let indices = [delaunator.triangles[idx], delaunator.triangles[idx + 1], delaunator.triangles[idx + 2]];
    const r_crit = r_crit_triag(indices);
    indices.sort(function(i, j) { return i - j; });
    simplex_data.push([indices, r_crit]);
  }

  const r_crit_edge = (indices) => {
    const [i, j] = indices;
    const r_critical = Math.sqrt(get_distance(vertices[i], vertices[j])) / 2.0;
    return r_critical;
  }
  const next_half_edge = (e) => {return (e % 3 === 2) ? e - 2 : e + 1;};
  edge_indices = [];
  for (let e = 0; e < delaunator.triangles.length; e++)
    if (e > delaunator.halfedges[e])
    {
      let indices = [delaunator.triangles[e], delaunator.triangles[next_half_edge(e)]];
      indices.sort(function(i, j) { return i - j; });
      const r_crit = r_crit_edge(indices);
      simplex_data.push([indices, r_crit]);
    }

  for (let i = 0; i < vertices.length; ++i)
    simplex_data.push([[i], 0.0]);

  const epsilon = 0.001;
  simplex_data.sort(function(sx, sy) {
    if (epsilon < sy[1] - sx[1]) { return -1; }
    if (sx[1] - sy[1] > epsilon) { return 1;  }
    if (sx[0].length > sy[0].length) { return 1; }
    if (sx[0].length < sy[0].length) { return -1; }
    return 0;
  });  
  return simplex_data;
}

function calculate_simplex_boundary(simplex) {
  let span = [];
  if (simplex.length==1) return [];
  for(let i=0; i<simplex.length; ++i) {
    let x = simplex.slice(0,i).concat(simplex.slice(i+1));
    span.push([x, (i%2)==0 ? 1 : -1]);
  }
  return span;
}

function get_max_index(filtration_set, span) {
  let max_index = -1;
  for(let i=0; i<span.length; ++i) {
    if(filtration_set[span[i][0]]!=undefined)
      max_index = Math.max(max_index, filtration_set[span[i][0]]);
  }
  return max_index;
 }

// algo from the paper https://geometry.stanford.edu/papers/zc-cph-05/zc-cph-05.pdf
function get_barcodes(filtration) {
  const n = canvas_setup.n;
  let L   = [new Set(), new Set(), new Set()];

  let filtration_set = {};
  for(let i=0; i<filtration.length; ++i)
    filtration_set[filtration[i][0]] = i;

  let M = new Array(filtration.length).fill(undefined);
  let T = new Array(filtration.length).fill(undefined);
  let J = new Array(filtration.length).fill(undefined);
  let D = new Array(filtration.length).fill(undefined);
   for(let j=0; j<filtration.length; ++j) {
    let d_span = remove_pivot_rows(filtration, filtration_set, M, D, j); 
    if(d_span.length==0 || d_span==undefined) 
      M[j]=true;
    else {
      let i = get_max_index(filtration_set, d_span);
      let k = filtration[i][0].length-1;
      J[i] = j;
      D[i] = d_span;
       if(filtration[i][1] != filtration[j][1])
        L[k].add([filtration[i][1], filtration[j][1]]);
    }
   }
  
  for(let j=0; j<filtration.length; ++j) {
    let simplex = filtration[j][0];
    if(M[j]==true && D[j]==undefined) {
      let k = simplex.length-1;
       if(k==0)
        L[k].add([filtration[j][1], canvas_setup.r_max+10]);
    }
  }

  let red  = create_curve(L[0]);
  let blue = create_curve(L[1]); 

  return [L, red, blue];
}

function create_curve(L) {
  let out = [];
  let temp = [];
  
  for (let key of L) {
    temp.push([key[0], 1]);
    temp.push([key[1], -1]);
  }
  temp.sort((x,y)=>x[0]-y[0]);
  let M = 0;
  let acc = 0;
  for (let i=0; i<temp.length; ) {
    acc += temp[i][1];
    let j=i+1;
    for ( ; j<temp.length && temp[i][0]==temp[j][0]; ++j) {
      acc += temp[i][1];
    }
    out.push([temp[i][0], acc]);
    M=Math.max(M, acc)
    i = j;
  }
  return {"data" : out, "max": M};
}

function remove_pivot_rows(filtration, filtration_set, M, D, j) {
  let simplex = filtration[j][0];
  let k = simplex.length-1;
  let d_span = calculate_simplex_boundary(simplex); 
  let d_marked_span = [];
  for(let i=0; i<d_span.length; ++i) {
      let index = filtration_set[d_span[i][0]];
      if(M[index]==true)
          d_marked_span.push([ [...d_span[i][0]], d_span[i][1] ]);
  }

  while(d_marked_span.length>0) {
    let i = get_max_index(filtration_set, d_marked_span);
    if(D[i]==undefined) break;
    let sigma_i = filtration[i][0];
    let coeff = undefined;
    for(let k=0; k<D[i].length; ++k){
      if(JSON.stringify(D[i][k][0])==JSON.stringify(sigma_i)){
        coeff = D[i][k][1];
        break;
      }
    }

    let coeff1 = undefined;
    for(let k=0; k<d_marked_span.length; ++k){
      if(JSON.stringify(d_marked_span[k][0])==JSON.stringify(sigma_i)){
        coeff1 = d_marked_span[k][1];
        break;
      }
    }
    d_marked_span = add_spans(d_marked_span, multiply_span(D[i], -coeff1/coeff))
  }
  return d_marked_span;
}

function multiply_span(span, number) {
  let out_span = [];
  for(let i=0; i<span.length; ++i)
    out_span.push([[...span[i][0]], span[i][1] * number])
  return out_span;
}

function add_spans(span1, span2) {
  let set = new Set();
  for(let i=0; i<span1.length; ++i)
    set[span1[i][0]] = span1[i][1];
  for(let i=0; i<span2.length; ++i) {
    if(set.hasOwnProperty(span2[i][0])) 
        set[span2[i][0]] += span2[i][1];
    else
        set[span2[i][0]] = span2[i][1];
  }
  let span = [];    
  for (let key in set) {
    if(set[key]!=0) {
      let strings = key.split(',');
      let numbers = []
      for(let i=0; i<strings.length; ++i) 
        numbers.push(parseInt(strings[i]))
      span.push([numbers, set[key]]);
    }
  }
  return span;
}

btn1.addEventListener('click', function(event) {
  show_balls = !(show_balls);  
  change_glyph_btn1();
});

btn2.addEventListener('click', function(event) {
  is_cech_not_alpha = !(is_cech_not_alpha);  
  change_glyph_btn2();
});


function change_glyph_btn1() {
  if(show_labels==true)
    btn1.style.backgroundImage = `url("./btn_1_on.png")`;
  else
    btn1.style.backgroundImage = `url("./btn_1_off.png")`;
}


function change_glyph_btn2() {
  if(is_cech_not_alpha==true)
    btn2.style.backgroundImage = `url("./btn_2_on.png")`;
  else
    btn2.style.backgroundImage = `url("./btn_2_off.png")`;
}



update();