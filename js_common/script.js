let canvas = document.getElementById("canvas");
let button = document.getElementById("button");
let context = canvas.getContext("2d");

canvas.width  = 600;
canvas.height = 600;


class Alphabet{
  constructor(){
    let labels = 'ABCDFGHJKLMPRTUVWXYZabcdefghijklkmnopqrstuvwxyzαβγδϵζηθκλμνξπρστυϕχψωאבס'
      this.alphabet = new Set();
      for(let label of labels)
      {
        this.alphabet.add(label)
      }
  }
  get_label(){
       let out = this.alphabet.values().next().value;
      this.alphabet.delete(out)
       return out
  }
  return_label(label){
       this.alphabet.add(label)
   }
}

let label_dispenser = new Alphabet();

class Vertice {
  constructor(x, y, label) {
    this.x = x;
    this.y = y;
    this.label = label;
  }
}

class Triangle {
  constructor(a, b, c) {
    this.vertices = [a,b,c];
  }
}

let triangles = [];


function get_distance(a,b){
  return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
}

let proximity_radius = 20;
function get_closest_vertice(vertice){
  for(let i=0; i<triangles.length; ++i)
    for(let j=0; j<3; ++j)
      if(get_distance(triangles[i].vertices[j], vertice)<proximity_radius) return [i,j];
  return -1
}

let new_triangle_scale = 50
function add_triangle(x,y){
  let a = new Vertice(x,y+new_triangle_scale, label_dispenser.get_label())
  let b = new Vertice(x-new_triangle_scale, y-new_triangle_scale, label_dispenser.get_label())
  let c = new Vertice(x+new_triangle_scale, y-new_triangle_scale, label_dispenser.get_label())
  triangles.push(new Triangle(a,b,c));
}


function pick_triangle(vertice){
  for(let i=0; i<triangles.length; ++i)
    if(is_inside_triangle(triangles[i], vertice)) return i;
  return -1
}


function delete_triangle(i)
{
  for(let x=0; x<3; ++x){
    let n = 0;
    for(let y=0; y<triangles.length; ++y){
      for(let z=0; z<3; ++z){
        n += (triangles[y].vertices[z].label == triangles[i].vertices[x].label);
      }
    }
    if(n==1) label_dispenser.return_label(triangles[i].vertices[x].label)
  }
  
  if(i+1!=triangles.length){
      [triangles[i], triangles[triangles.length-1]] = [triangles[triangles.length-1], triangles[i]];
  }
  triangles.splice(-1);
}


function draw_triangles()
{
    canvas.style.backgroundColor = "white";

    context.clearRect(0,0, canvas.width, canvas.height);
    context.strokeStyle = "grey";
    context.fillStyle = 'lightgreen';
    context.lineWidth = 1;
    context.beginPath();

    for(let i=0; i<triangles.length; ++i){
      context.moveTo(triangles[i].vertices[0].x, triangles[i].vertices[0].y);
      for(let j=0; j<3; ++j){
        context.lineTo(triangles[i].vertices[j].x, triangles[i].vertices[j].y);
        context.fill();
      }
      context.lineTo(triangles[i].vertices[0].x, triangles[i].vertices[0].y);    
      context.fill();
    }
    context.stroke();
    context.closePath();
}



function draw_vertices()
{
  context.fillStyle = 'lightcoral';
  for(let i=0; i<triangles.length; ++i){
    for(let j=0; j<3; ++j){
      context.beginPath();
      context.arc(triangles[i].vertices[j].x, triangles[i].vertices[j].y, 6, 0, 2*Math.PI);   
      context.fill();
    }
  } 
  context.fillStyle = 'red';
}



function draw_labels()
{ 
  for(let i=0; i<triangles.length; ++i){
    for(let j=0; j<3; ++j){
      context.fillStyle = 'black';
      context.font = "20px bold courier";
      context.fillText(triangles[i].vertices[j].label, triangles[i].vertices[j].x, triangles[i].vertices[j].y+20);
    } 
  }
}

function is_inside_triangle(triangle, P) {
  let denominator = ((triangle.vertices[1].y - triangle.vertices[2].y) * (triangle.vertices[0].x - triangle.vertices[2].x) +
                 (triangle.vertices[2].x - triangle.vertices[1].x) * (triangle.vertices[0].y - triangle.vertices[2].y));
  let a = ((triangle.vertices[1].y - triangle.vertices[2].y) * (P.x - triangle.vertices[2].x) +
       (triangle.vertices[2].x - triangle.vertices[1].x) * (P.y - triangle.vertices[2].y)) / denominator;
  
  
       let b = ((triangle.vertices[2].y - triangle.vertices[0].y) * (P.x - triangle.vertices[2].x) +
       (triangle.vertices[0].x - triangle.vertices[2].x) * (P.y - triangle.vertices[2].y)) / denominator;
  let c = 1 - a - b;   
  return a >= 0 && b >= 0 && c >= 0;
}



function update()
{
  requestAnimationFrame(update);
  draw_triangles();
  draw_vertices();
  draw_labels();
}


update();


function update_text()
{
  context.fillStyle = 'lightgreen';
  context.font = "16px courier";
  context.fillText("スコア:"+ s.toString(), 15, 20);
}

let current_point = -1;
let current_triangle = -1;

canvas.addEventListener('mousedown', function(event) {
  var x = event.x
  var y = event.y
  current_point = get_closest_vertice(new Vertice(x,y));
  if(current_point==-1){
    current_triangle = pick_triangle(new Vertice(x,y));
    console.log("triag:", current_triangle);
  }
});

canvas.addEventListener('mouseup', function(event) {
  var x = event.x
  var y = event.y
  current_point = -1;
  current_triangle = -1;
});


canvas.addEventListener('mousemove', function(event) {
  if(current_point!=-1)
  {
    var x = event.x
    var y = event.y
    let triangle = current_point[0]
    let triangle_vertice = current_point[1]
    let picked = get_closest_vertice(new Vertice(x,y));
    if(picked==-1)
    {
      triangles[triangle].vertices[triangle_vertice].x = x; 
      triangles[triangle].vertices[triangle_vertice].y = y; 
    }
    else
    {
        let picked_triangle = picked[0];
        let picked_triangle_vertice = picked[1];    
        if(triangles[triangle].vertices[triangle_vertice].label!=triangles[picked_triangle].vertices[picked_triangle_vertice].label) 
        {
          console.log("returning           : ",triangles[picked_triangle].vertices[picked_triangle_vertice].label)
          label_dispenser.return_label(triangles[picked_triangle].vertices[picked_triangle_vertice].label)
          triangles[picked_triangle].vertices[picked_triangle_vertice] = triangles[triangle].vertices[triangle_vertice]; 
        }
     }
   }
   else if(current_triangle!=-1)
  {
    var dx = event.movementX;
    var dy = event.movementY;
    for(let i=0; i<3; ++i){
      triangles[current_triangle].vertices[i].x += dx; 
      triangles[current_triangle].vertices[i].y += dy; 
    }    
  }
});
canvas.addEventListener('dblclick', function(event) {
  let x = event.x;
  let y = event.y;
  let picked = pick_triangle(new Vertice(x,y));
  if(picked!=-1){
    delete_triangle(picked);
  }
  else{
    add_triangle(x, y);
  }
});

async function calculate(triangles) {
  const result = await google.colab.kernel.invokeFunction('notebook.homologies', [triangles], {});
  params = result.data['application/json'];
}


button.addEventListener('click', function(event) {
  out_triangles = []
  for(let i=0; i<triangles.length; ++i)
    out_triangles.push(triangles[i].vertices[0].label+triangles[i].vertices[1].label+triangles[i].vertices[2].label)
  calculate(out_triangles);
});

///////////////////////////////////////

function my_print(message){
  console.log(message)
}

function set_triangles(tt){
   let triangles = []
   for (let t of tt){
      my_print(t.split("").sort().join(""))
      triangles.push(t.split("").sort().join(""))
   }
   my_print('triangles : ' + triangles.toString())
   return triangles
}


function get_complex(tt){
   let parts = new Set()
   for (let t of tt)
       [t, t[0], t[1], t[2], [t[0],t[1]].sort().join(""),[t[1],t[2]].sort().join(""), [t[0],t[2]].sort().join("")].forEach(x=>parts.add(x))
   let complex_ = [...parts].sort()
   my_print('complexes : ' + complex_.toString())
   return complex_
}

function get_chain_order(complex, order){
   let chain = complex.filter((c) => c.length == order+1);
   my_print('{order}-chain : ' + chain.toString());
   return chain;
}
   
function get_span(tt){
   let string = "";
   for (i in tt)
       string  += (tt[i][0]=="-" ? "-" : "+") + 'x'+(i).toString()+'*'+(tt[i]).toString();
   my_print("span    :"+string);
   return tt;
}


function calculate_boundary(tt, space="ker"){
   let n = tt.length;
   let matrix = {};
   for(let i=0; i<n; ++i)
       for(let j=0; j<tt[i].length; ++j){
           let x = tt[i].slice(0,j).concat(tt[i].slice(j+1));
           if (x=='') continue;
           if(matrix[x]==undefined)
               matrix[x] = (Array(n)).fill(0);
           matrix[x][i] += (j%2==0 ? 1 : -1);
       }

   let m = [];
   for(let key in matrix)
       m.push(matrix[key]);
    return m;
}
///////////////////////////////////////
function z_div(a, b) {
  var remainder = a % b;
  var aIsInfinite = a === -Infinity || a === Infinity;
  var bIsInfinite = b === -Infinity || b === Infinity;
  var aIsNeg = a + 1 / a < 0;
  var bIsNeg = b + 1 / b < 0;
  return [
    (aIsInfinite !== bIsInfinite && a) ? aIsInfinite ? NaN : aIsNeg === bIsNeg ? 0 : -1 : Math.floor(a / b),
    (!a && b < 0) ? -0 : remainder + (remainder !== 0 && aIsNeg !== bIsNeg ? b : 0)
  ];
}

function z_gcdex(a, b){
  if (a==0 && b==0) return [0, 1, 0];
  if (a==0) return [0, parseInt(b/Math.abs(b)), Math.abs(b)];
  if (b==0) return [parseInt(a/Math.abs(a)), 0, Math.abs(a)];

  let x_sign = undefined;
  if (a < 0){
    a = -a;
    x_sign = -1;
  }
  else{
    x_sign = 1;
  }

  let y_sign = undefined;
  if (b < 0){
    b = -b;
    y_sign = -1;
  }
  else{
    y_sign = 1
  }


  let c = undefined;
  let q = undefined;
  let x = 1;
  let y = 0;
  let r = 0;
  let s = 1;
  while (b!=0){
    [c, q] = [a % b, parseInt(a / b)];
    [a, b, r, s, x, y] = [b, c, x - q*r, y - q*s, r, s];  
  }
  return [x * x_sign, y * y_sign, a];
}



function add_columns(m, i, j, a, b, c, d){
  for(let k=0; k<m.length; ++k){
      let e = m[k][i];
      m[k][i] = a*e + b*m[k][j];
      m[k][j] = c*e + d*m[k][j];
  }
}


function add_rows(m, i, j, a, b, c, d){
  for (let k=0; k<m[0].length; ++k) {
    let e = m[i][k];
    m[i][k] = a*e + b*m[j][k];
    m[j][k] = c*e + d*m[j][k];
  }
}

function clear_column(m){
  if(m[0][0] == 0) return m;
  let pivot = m[0][0];
  for (let j=1; j<m.length; ++j){
    if (m[j][0] == 0) continue;
    let d = undefined;
    let r = undefined;
    [d, r] = z_div(m[j][0], pivot)
    if (r==0){
        add_rows(m, 0, j, 1, 0, -d, 1);
    }
    else{
        let a = undefined;
        let b = undefined;
        let g = undefined;
        [a, b, g] = z_gcdex(pivot, m[j][0]);
        let d_0 = z_div(m[j][0], g)[0];
        let d_j = z_div(pivot, g)[0];
        add_rows(m, 0, j, a, b, d_0, -d_j);
        pivot = g;
    }
  }
  return m;
}

function clear_row(m){
  if (m[0][0] == 0) return m;
  let pivot = m[0][0];
  for(let j=1; j<m[0].length; ++j){
    if (m[0][j] == 0) continue;
    let d = undefined;
    let r = undefined;
    [d, r] = z_div(m[0][j], pivot)
    if (r==0){
        add_columns(m, 0, j, 1, 0, -d, 1)
    }
    else{
        let a = undefined;
        let b = undefined;
        let g = undefined;
        [a, b, g] = z_gcdex(pivot, m[0][j]);
        let d_0 = z_div(m[0][j], g)[0];
        let d_j = z_div(pivot, g)[0];
        add_columns(m, 0, j, a, b, d_0, -d_j);
        pivot = g;
    }
  }
  return m;
}

function invariant_factors(m){
  if (m.length==0 || m[0].length==0) return [];
  let ind = [];
  for(let i=0; i<m.length; ++i)
    if(m[i][0]!=0) ind.push(i)

  if (ind.length>0 && ind[0] != 0){
    [m[0], m[ind[0]]] = [m[ind[0]], m[0]];
  }
  else{
    let ind = [];
    for(let j=0; j<m[0].length; ++j)
      if(m[0][j] != 0) ind.push(j)
    
    if (ind.length>0 && ind[0] != 0){
      for(let r=0; r<m.length; ++r){
        [m[r][0], m[r][ind[0]]] = [m[r][ind[0]], m[r][0]];
      }
    }
  }

  while (true){
    let result = false;
    for (let i=1; i<m[0].length; ++i)
      result |= (m[0][i] != 0);

    for (let i=1; i<m.length; ++i)  
      result |= (m[i][0] != 0);

    if(!result) break;
    m = clear_column(m);
    m = clear_row(m);
  }

  let invs = undefined;
  if (m.length==1 || m[0].length==1){
    invs = [];
  }
  else{
    let lower_right = [];
    for(let i=1; i<m.length; ++i){
      let row = [];
      for(let j=1; j<m[0].length; ++j)
        row.push(m[i][j]);
      lower_right.push(row);
    }
    invs = invariant_factors(lower_right);
  }

  let result = [];
  if (m[0][0]!=0){
    result = [m[0][0]];
    result.push(...invs);
    for (let i=0; i<result.length-1; ++i){
      if (result[i] && z_div(result[i+1], result[i])[1] != 0){
          let g = z_gcdex(result[i+1], result[i])[2];
          result[i+1] = z_div(result[i], g)[0] * result[i+1];
          result[i] = g;
        }
        else
          break;
      }
  }
  else{
    invs.push(m[0][0]);
    result = invs;
  }
  return result;
}


T_klein = set_triangles(["ABC", "ABF", "BDF", "BGC", "DFC", "DGC", "CFE", "FHE",
                   "AFH", "ADH", "AGD", "AEG", "ACE", "HDB", "HBE", "BEG"]); 


K = get_complex(T_klein);



C1 = get_chain_order(K, 2);
x = calculate_boundary(get_span(C1), "∂C1");
console.log(x)
console.log(invariant_factors(x))