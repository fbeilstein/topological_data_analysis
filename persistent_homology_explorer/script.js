let canvas1 = document.getElementById("canvas1");
let canvas2 = document.getElementById("canvas2");
let canvas3 = document.getElementById("canvas3");
let output = document.getElementById("output");
let context1 = canvas1.getContext("2d");
let context2 = canvas2.getContext("2d");
let context3 = canvas3.getContext("2d");
//colors
let my_green   = "rgb(144, 238, 144, 0.4)";
let my_coral   = "rgb(240, 128, 128, 0.2)";
let my_coral2  = "rgb(240, 128, 128, 0.7)";
let my_grey    = "rgb(211, 211, 211, 0.4)";
let my_magenta = "rgb(139, 0, 139, 0.5)"
let my_blue    = "rgb(135, 206, 250)"
let show_balls = true;

canvas1.width  = 
canvas1.height = 
canvas2.width  = 
canvas2.height = 
canvas3.width  = 
canvas3.height = parseInt(getComputedStyle(canvas1).getPropertyValue('width'));


//globals
let vertices = [];
let current_point = -1;
const RR = 15*15;
let radius = 50;
let betti_data = undefined;
let L_data = undefined;
let canvas2_setup = {"r_max" : 250, "x_off" : 30, "y_off" : 30}; 
let n = 50; // number of r samples



class Vertice {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Triangle {
  constructor(a, b, c) {
    this.vertices = [a,b,c];
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

function find_lines(r) { 
  let lines = [];
  for(let i=0; i<vertices.length; ++i)
    for(let j=i+1; j<vertices.length; ++j)
      if(get_distance(vertices[i], vertices[j])<r*r) lines.push([i, j]);
  return lines;
}

function find_triangles(r) { 
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
        if(l1<r && l2<r && l3<r && (2*f1<r || 2*f2<r || 2*f3<r || 2*R<r))
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
      context.arc(vertices[i].x, vertices[i].y, 4, 0, 2*Math.PI);   
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
    context.beginPath();
    context.fillStyle = 'gray';
    context.arc(vertices[i].x, vertices[i].y, 4, 0, 2*Math.PI);   
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
  let lines = find_lines(2*radius);
  let triangles = find_triangles(2*radius)
  clear_canvas(context1, canvas1);
  if(show_balls) {
    draw_balls(context1);
    draw_ball_outlines(context1);
  }
  draw_triangles(context1, triangles);
  draw_connections(context1, lines);
  draw_points(context1);
   if(L_data!=undefined) {
    draw_betti_curves(context2, canvas2, [L_data[1], L_data[2]]);
    draw_betti_histograms1(context3, canvas3, L_data[0])
  }
  requestAnimationFrame(update);
}

function radius_plus_delta(delta) {
  if(delta<0 && radius>10-delta) radius += delta;
  if(delta>0 && radius<200)  radius += delta;
}

document.addEventListener('keydown', function (event) {
  if(event.keyCode==49)
    radius_plus_delta(10);
  if(event.keyCode==50)
    radius_plus_delta(-10);
  if(event.keyCode==51)
    show_balls = !(show_balls); 
});

document.addEventListener('mousewheel', function (event) {
  radius_plus_delta(event.wheelDelta/20);
});

canvas1.addEventListener('mousedown', function(event) {
  let x = event.offsetX;
  let y = event.offsetY;
  current_point = get_closest_vertice(new Vertice(x,y));
});

canvas1.addEventListener('mouseup', function(event) {
  current_point = -1;
});

canvas2.addEventListener('mousemove', function(event) {
  if(event.buttons==1) {
    let x = event.offsetX;
    let y = event.offsetY;
    let padding = parseInt(getComputedStyle(canvas2).getPropertyValue('padding-left'));
    radius = canvas2_setup.r_max * Math.max(0, x - padding-canvas2_setup.x_off)/(canvas2.width-canvas2_setup.x_off);
  }
});

canvas2.addEventListener('mouseup', function(event) {
  let x = event.offsetX;
  let y = event.offsetY;
  let padding = parseInt(getComputedStyle(canvas2).getPropertyValue('padding-left'));
  radius = canvas2_setup.r_max * Math.max(0, x - padding-canvas2_setup.x_off)/(canvas2.width-canvas2_setup.x_off);
 
});

canvas3.addEventListener('mousemove', function(event) {
  if(event.buttons==1) {
    let x = event.offsetX;
    let y = event.offsetY;
    let padding = parseInt(getComputedStyle(canvas3).getPropertyValue('padding-left'));
    radius = canvas2_setup.r_max * Math.max(0, x - padding-canvas2_setup.x_off)/(canvas2.width-canvas2_setup.x_off);
  }
});

canvas3.addEventListener('mouseup', function(event) {
  let x = event.offsetX;
  let y = event.offsetY;
  let padding = parseInt(getComputedStyle(canvas3).getPropertyValue('padding-left'));
  radius = canvas2_setup.r_max * Math.max(0, x - padding-canvas2_setup.x_off)/(canvas2.width-canvas2_setup.x_off);
 
});


canvas1.addEventListener('mousemove', function(event) {
  if(event.buttons==4) {
    translate_vertices(event.movementX, event.movementY);
    return 
  } else if(current_point!=-1) {
    let x = event.offsetX;
    let y = event.offsetY;
    vertices[current_point].x = x; 
    vertices[current_point].y = y; 
    L_data = get_barcodes(create_filtration());
  }
});

function add_point(x,y) {
  vertices.push(new Vertice(x,y));
  L_data = get_barcodes(create_filtration());
}

function delete_vertice(i) {
  if(i+1!=vertices.length) 
      [vertices[i], vertices[vertices.length-1]] = [vertices[vertices.length-1], vertices[i]];
  vertices.splice(-1);
  L_data = get_barcodes(create_filtration());
}

canvas1.addEventListener('dblclick', function(event) {
  let x = event.offsetX;
  let y = event.offsetY;
  let current_point = get_closest_vertice(new Vertice(x, y));
  if(current_point!=-1)
    delete_vertice(current_point);
  else
    add_point(x,y);
});

/////////////////////////////////////// math 

function calculate_boundary(tt){
  let n = tt.length;
  let matrix = new Object();
  for(let i=0; i<n; ++i) {
      for(let j=0; j<tt[i].length; ++j){
          let x = tt[i].slice(0,j).concat(tt[i].slice(j+1));
          if (x=='') continue;
          if(!matrix.hasOwnProperty(x)){
              matrix[x] = (Array(n)).fill(0);
          }
          matrix[x][i] += ((j%2)==0 ? 1 : -1);
      }
  }

  let m = [];
  for (let key in matrix) {
      m.push([...matrix[key]]);
  }

  let m_dim = [m.length, n];
  let rank = matrixRank(m); 
  return {"dim" : m_dim, "rank" : rank, "matrix" : matrix};
}


function matrixRank(matrix) {
  const numRows = matrix.length;
  if(numRows==0) return 0;
  const numCols = matrix[0].length;
  let rank = Math.min(numRows, numCols);
  let row = 0;

  for (let col = 0; col < numCols && row < numRows; col++) {
      let pivotRow = row;
      while (pivotRow < numRows && matrix[pivotRow][col] === 0) {
          pivotRow++;
      }

      if (pivotRow === numRows) {
          continue;
      }

      [matrix[row], matrix[pivotRow]] = [matrix[pivotRow], matrix[row]];

      for (let i = row + 1; i < numRows; i++) {
          if(matrix[i][col]==0) continue;
          const gcd = gcd_(Math.abs(matrix[row][col]), Math.abs(matrix[i][col]));
          const lcm = Math.abs(matrix[row][col] / gcd * matrix[i][col]);
          const multiplier1 = lcm / matrix[row][col];
          const multiplier2 = lcm / matrix[i][col];

          for (let j = col; j < numCols; j++) {
              matrix[i][j] = (matrix[i][j] * multiplier1 - matrix[row][j] * multiplier2);
          }
      }
      row++;
  }

  rank = matrix.reduce((count, row) => {
      return count + (row.some(entry => entry !== 0) ? 1 : 0);
  }, 0);

  return rank;
}

function gcd_(a, b) {  
  if (b == 0) return a;  
  return gcd_(b, a % b);  
}  
  
function calculate_betti(lines, triangles) { 
  let b1 = calculate_boundary(lines);
  let b2 = calculate_boundary(triangles);
  let n = vertices.length;
  let beta_0 = n - b1.rank;
  let beta_1 = b1.dim[1] - b2.rank - b1.rank;
  return [beta_0, beta_1];
}

function calclutate_betti_data() {
  betti_data = get_betti_data();
}

function get_betti_data() {
  let M = 0;

  let out = [];
  let r = 0;
  let current_b0 = -1;
  let histo = [];
  for(let i=0; i<=n; ++i) {
    let lines = find_lines(2*r);
    let triangles = find_triangles(2*r);
    let b = calculate_betti(lines, triangles);
    M = Math.max(Math.max(M, b[0]), b[1]);
    out.push([r, b]);
    if(b[0]!=current_b0) {
      histo.push([r, b[0]]);
      current_b0 = b[0];
    }
    r += canvas2_setup.r_max/n;
  }
  histo.push([canvas2_setup.r_max, 0])
  return {"data": out, "max" : M, "histo" : histo};
}

function draw_betti_curves(context, canvas, RB) {
 
  let x_off = canvas2_setup.x_off;
  let y_off = canvas2_setup.y_off;
  let r_max = canvas2_setup.r_max;
  let x_ticks = 10;
  let y_ticks = vertices.length+1;
  let y_max = vertices.length+1;
  let width_off = canvas.width-x_off;
  let height_off = canvas.height-y_off;
  let tick_length = x_off/4;

  clear_canvas(context, canvas);
  context.lineWidth = 1;

  for(let i=0; i<y_ticks; ++i) { //draw y-ticks and labels
    context.strokeStyle = "lightgray";
    context.beginPath();
    context.moveTo(x_off-tick_length, canvas.height-y_off-(height_off)*i/y_ticks);
    context.lineTo(x_off, canvas.height-y_off-(height_off)*i/y_ticks);
    context.fillStyle = 'lightgray';
    context.font = "12px Verdana";
    context.fillText(parseInt(Math.ceil(i*y_max/y_ticks)).toString(), x_off/4, canvas.height+5-y_off-(height_off)*i/y_ticks);
    context.stroke();
    context.closePath();  
  }

  draw_x_axis(context, canvas, {"x_off" : x_off, "y_off" : y_off, "x_ticks" : x_ticks, "x_max" : r_max, "label" : "r" });
  draw_y_axis(context, canvas, {"x_off" : x_off, "y_off" : y_off, "y_ticks" : y_ticks, "y_max" : y_max, "label" : "betti numbers" });
  draw_scanning_line(context, canvas, {"x_off" : x_off, "y_off" : y_off, "x_ticks" : x_ticks, "x_max" : r_max });
 
  context.lineWidth = 1; // draw red curve
  let red = RB[0];
  let blue = RB[1];
  let red_accum = red[0];
  let blue_accum = blue[0];
  let x = 0;
  let x_delta = canvas2_setup.r_max/n;
  context.strokeStyle = "lightcoral";
  context.beginPath();
  context.moveTo(x_off, parseInt(canvas.height-y_off-red_accum*height_off/y_ticks)); 
  for(let i=1; i<red.length; ++i) {    
    context.lineTo(parseInt(x_off+(width_off/r_max)*x), parseInt(canvas.height-y_off-red_accum*height_off/y_ticks));   
    red_accum += red[i];
    x = parseInt(i*x_delta);  
    context.stroke();
   
  } 
  context.closePath();
  x=0;
  context.lineWidth = 1;    // draw blue curve
  context.strokeStyle = "DodgerBlue";
  context.beginPath();
  context.moveTo(x_off, parseInt(canvas.height-y_off-blue_accum*height_off/y_ticks)); 
  for(let i=1; i<blue.length; ++i) {    
    context.lineTo(parseInt(x_off+(width_off/r_max)*x), parseInt(canvas.height-y_off-blue_accum*height_off/y_ticks));  
    x = parseInt((i-0.5)*x_delta);  
    context.lineTo(parseInt(x_off+(width_off/r_max)*x), parseInt(canvas.height-y_off-blue_accum*height_off/y_ticks));
    x = parseInt(i*x_delta);
    blue_accum += blue[i]; 
    context.stroke();
  } 
  context.closePath();
}

function draw_betti_histograms(context, canvas, histo) { 
  clear_canvas(context, canvas);
  if(histo==undefined) return;

  let x_off = canvas2_setup.x_off;
  let y_off = canvas2_setup.y_off;
  let r_max = canvas2_setup.r_max;
  let x_ticks = 10;
  draw_x_axis(context, canvas, {"x_off" : x_off, "y_off" : y_off, "x_ticks" : x_ticks, "x_max" : r_max, "label" : "r"  });
  draw_y_axis(context, canvas, {"x_off" : x_off, "y_off" : y_off, "y_ticks" : 0, "y_max" : 0, "label" : "birth/death"  });
  draw_scanning_line(context, canvas, {"x_off" : x_off, "y_off" : y_off, "x_ticks" : x_ticks, "x_max" : r_max });
  let h = 5;
  let delta = 10;
  let y = 20;
  
  for(let i=histo.length-1; i>0; --i) {
    let x = (canvas.width-x_off)*histo[i][0]/r_max;
    let n = histo[i-1][1]-histo[i][1]
    for(let j=0; j<n; ++j) {
      context.beginPath();
      context.fillStyle = my_coral2;
      context.moveTo(x_off,   y_off+y);
      context.lineTo(x_off+x, y_off+y);
      context.lineTo(x_off+x, y_off+y+delta);
      context.lineTo(x_off,   y_off+y+delta);
      context.lineTo(x_off,   y_off+y);
      context.fill();
      context.closePath();
      y += h+delta;
    }
  }
}

function draw_betti_histograms1(context, canvas, L) { 
  clear_canvas(context, canvas);
  if(L==undefined) return;
  let x_off = canvas2_setup.x_off;
  let y_off = canvas2_setup.y_off;
  let r_max = canvas2_setup.r_max;
  let x_ticks = 10;
  draw_x_axis(context, canvas, {"x_off" : x_off, "y_off" : y_off, "x_ticks" : x_ticks, "x_max" : r_max, "label" : "r"  });
  draw_y_axis(context, canvas, {"x_off" : x_off, "y_off" : y_off, "y_ticks" : 0, "y_max" : 0, "label" : "birth/death"  });
  
  let h = 5;
  let delta = 10;
  let y = 20;
  
  let red = L[0];
  for(let key of red)  {
    let start = (canvas.width-x_off)*(key[0]*r_max/n)/r_max;
    let end = (canvas.width-x_off)*(key[1]*r_max/n)/r_max;
      context.beginPath();
      context.fillStyle = my_coral2;
      context.moveTo(x_off+start,   y_off+y);
      context.lineTo(x_off+end, y_off+y);
      context.lineTo(x_off+end, y_off+y+delta);
      context.lineTo(x_off+start,   y_off+y+delta);
      context.lineTo(x_off+start,   y_off+y);
      context.fill();
      context.closePath();
      y += h+delta;
  }

  if(L[1]!=undefined){ 
    let blue = L[1];
    for(let key of blue)  {
      let start = (canvas.width-x_off)*(key[0]*r_max/n)/r_max;
      let end = (canvas.width-x_off)*(key[1]*r_max/n)/r_max;
        context.beginPath();
        context.fillStyle = my_blue;
        context.moveTo(x_off+start,   y_off+y);
        context.lineTo(x_off+end, y_off+y);
        context.lineTo(x_off+end, y_off+y+delta);
        context.lineTo(x_off+start,   y_off+y+delta);
        context.lineTo(x_off+start,   y_off+y);
        context.fill();
        context.closePath();
        y += h+delta;
    }
  }
  draw_scanning_line(context, canvas, {"x_off" : x_off, "y_off" : y_off, "x_ticks" : x_ticks, "x_max" : r_max });
}


function draw_scanning_line(context, canvas, params) {
  let x_off   = params.x_off;
  let y_off   = params.y_off;
  let x_max   = params.x_max;

  context.lineWidth = 1;  // vertical scanning line
  context.strokeStyle = my_magenta;
  context.beginPath();
  context.moveTo(x_off+((canvas.width-x_off)/x_max)*radius, y_off);
  context.lineTo(x_off+((canvas.width-x_off)/x_max)*radius, canvas.height-y_off);
  context.stroke();
  context.closePath();
  context.fillStyle = my_magenta;
  context.fillText(parseInt(radius), x_off-10+((canvas.width-x_off)/x_max)*radius, y_off-3);
}

function draw_x_axis(context, canvas, params) {
  let x_ticks = params.x_ticks;
  let x_off   = params.x_off;
  let y_off   = params.y_off;
  let x_max   = params.x_max;
  let tick_length = y_off/4;

  for(let i=0; i<x_ticks; ++i) { //draw x-ticks and labels
    context.strokeStyle = "lightgray";
    context.beginPath();
    context.moveTo(x_off+(canvas.width - x_off)*i/x_ticks, canvas.height-y_off+tick_length);
    context.lineTo(x_off+(canvas.width - x_off)*i/x_ticks, canvas.height-y_off);
    context.fillStyle = 'lightgray';
    context.font = "12px Verdana";
    
    context.fillText((x_max*i/x_ticks).toString(), x_off-15+(canvas.width - x_off)*i/x_ticks, canvas.height-y_off/4);
    context.stroke();
    context.closePath();  
  }
  context.fillText(params.label, canvas.width-10,  canvas.height-y_off/4);

  context.strokeStyle = "lightgray";  // x-axis
  context.beginPath();
  context.moveTo(x_off, canvas.height-y_off);
  context.lineTo(canvas.width, canvas.height-y_off);
  context.stroke();
  context.closePath();
}

function draw_y_axis(context, canvas, params) {
  let y_ticks = params.y_ticks;
  let x_off   = params.x_off;
  let y_off   = params.y_off;
  let y_max   = params.y_max;
  let tick_length = x_off/4;

  context.lineWidth=1;
  for(let i=0; i<y_ticks; ++i) { //draw y-ticks and labels
    context.strokeStyle = "lightgray";
    context.beginPath();
    context.moveTo(x_off-tick_length, canvas.height-y_off-(canvas.height-y_off)*i/y_ticks);
    context.lineTo(x_off, canvas.height-y_off-(canvas.height-y_off)*i/y_ticks);
    context.fillStyle = 'lightgray';
    context.font = "12px Verdana";
    context.fillText(parseInt(Math.ceil(i*y_max/y_ticks)).toString(), x_off/4, canvas.height+5-y_off-(canvas.height-y_off)*i/y_ticks);
    context.stroke();
    context.closePath();  
  }

  context.strokeStyle = "lightgray";  // y-axis
  context.beginPath();
  context.moveTo(x_off, y_off);
  context.lineTo(x_off, canvas.height-y_off);
  context.stroke();
  context.closePath();
  context.fillText(params.label, 10,  20);  //axis label
}
update();


function create_filtration()
{
  let pre_filtration = new Array(n);
  for(let i=0; i<pre_filtration.length; ++i)  
    pre_filtration[i] = new Array();

  for(let i=0; i<vertices.length; ++i)  
    pre_filtration[0].push([i]);

  let r_max = canvas2_setup.r_max;
  let delta_r = r_max/n;
  for(let i=0; i<vertices.length; ++i)  
    for(let j=i+1; j<vertices.length; ++j) {
      let r_critical = Math.sqrt(get_distance(vertices[i], vertices[j]))/2;
      let index = Math.ceil(r_critical/delta_r);
      if(index<pre_filtration.length)
        pre_filtration[index].push([i,j]);
  }

  for(let i=0; i<vertices.length; ++i)  
    for(let j=i+1; j<vertices.length; ++j) 
      for(let k=j+1; k<vertices.length; ++k) {
        let l1 = Math.sqrt(get_distance(vertices[i], vertices[j]));
        let l2 = Math.sqrt(get_distance(vertices[j], vertices[k]));
        let l3 = Math.sqrt(get_distance(vertices[i], vertices[k]));
        let p = l1+l2+l3;
        let R = l1*l2*l3 / Math.sqrt(p*(p-2*l1)*(p-2*l2)*(p-2*l3));
        let f1 = Math.sqrt(get_distance(vertices[i], new Vertice((vertices[j].x+vertices[k].x)/2, (vertices[j].y+vertices[k].y)/2)));
        let f2 = Math.sqrt(get_distance(vertices[j], new Vertice((vertices[i].x+vertices[k].x)/2, (vertices[i].y+vertices[k].y)/2)));
        let f3 = Math.sqrt(get_distance(vertices[k], new Vertice((vertices[i].x+vertices[j].x)/2, (vertices[i].y+vertices[j].y)/2)));

        let r_critical = Math.max(Math.min(R, f1, f2, f3), l1/2, l2/2, l3/2);
        let index = Math.ceil(r_critical/delta_r);
        if(index<pre_filtration.length)
          pre_filtration[index].push([i,j,k]);
    }
    let filtration = []; 
    for(let i=0; i<pre_filtration.length; ++i)
      for(let j=0; j<pre_filtration[i].length; ++j){
        filtration.push([pre_filtration[i][j],i])    
    }
    return filtration;
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

function get_barcodes(filtration){
  let L = [new Set(), new Set(), new Set()];
  let red = new Array(n+1).fill(0);
  let blue = new Array(n+1).fill(0);

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
        L[k].add([filtration[j][1], canvas2_setup.r_max]);
    }
  }

  for (let key of L[0]) {
    red[key[0]] +=1;
    red[key[1]] -=1;
  }

  for (let key of L[1]) {
    blue[key[0]] +=1;
    blue[key[1]] -=1;
  }
  return [L, red, blue];
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
  for(let i=0; i<span2.length; ++i)
    if(set.hasOwnProperty(span2[i][0])) 
        set[span2[i][0]] += span2[i][1];
    else
        set[span2[i][0]] = span2[i][1];

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


