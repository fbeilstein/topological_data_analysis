let canvas = document.getElementById("canvas");
let output = document.getElementById("output");
let context = canvas.getContext("2d");

canvas.width  = 700;
canvas.height = 700;

class Alphabet{
  constructor(){
    let labels = 'ABCDFGHJKLMPRTUVWXYZabcdefghijklkmnopqrstuvwxyzαβγδϵζηθκλμνξπρστυϕχψωאבס'
    this.alphabet = new Set();
    for(let label of labels){
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
    this.picked = false;
  }
}

class Triangle {
  constructor(a, b, c) {
    this.vertices = [a,b,c];
  }
}

let triangles = [];

function get_distance(a,b){
  return (a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y);
}

const rr = 20*20;
function get_closest_vertice(x,y){
  for(let i=0; i<triangles.length; ++i)
    for(let j=0; j<3; ++j)
  {
    let temp = (triangles[i].vertices[j].x-x)*(triangles[i].vertices[j].x-x)+(triangles[i].vertices[j].y-y)*(triangles[i].vertices[j].y-y);
    if(temp<rr) return [i,j];
  }
  return -1;
}

function get_closest_vertice_except_self(x,y){
  for(let i=0; i<triangles.length; ++i)
    for(let j=0; j<3; ++j)
  {
    let temp = (triangles[i].vertices[j].x-x)*(triangles[i].vertices[j].x-x)+(triangles[i].vertices[j].y-y)*(triangles[i].vertices[j].y-y);
    if(temp<rr && temp>1) return [i,j];
  }
  return -1;
}


const new_triangle_scale = 30;
function add_triangle(x,y){
  triangles.push(new Triangle(new Vertice(x,                    y+new_triangle_scale, label_dispenser.get_label()),
                              new Vertice(x-new_triangle_scale, y-new_triangle_scale, label_dispenser.get_label()),
                              new Vertice(x+new_triangle_scale, y-new_triangle_scale, label_dispenser.get_label())));
  recalculate_math();
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
  recalculate_math();
}


function draw_triangles()
{
    canvas.style.backgroundColor = "white";
    context.clearRect(0,0, canvas.width, canvas.height);
    context.strokeStyle = "gray";
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
  for(let i=0; i<triangles.length; ++i){
    for(let j=0; j<3; ++j){
      context.beginPath();
      context.fillStyle = triangles[i].vertices[j].picked ? 'red' : 'lightcoral';
      context.arc(triangles[i].vertices[j].x, triangles[i].vertices[j].y, 6, 0, 2*Math.PI);   
      context.fill();
      context.closePath();
    }
  } 
      
}

function draw_labels(){ 
  let labels = new Set();
  context.fillStyle = 'black';
  context.font = "20px courier";
  for(let i=0; i<triangles.length; ++i){
    for(let j=0; j<3; ++j){
      if(!labels.has(triangles[i].vertices[j])){
        context.fillText(triangles[i].vertices[j].label, triangles[i].vertices[j].x, triangles[i].vertices[j].y+20);
        labels.add(triangles[i].vertices[j]);
      }
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
  draw_triangles();
  draw_vertices();
  draw_labels();
  requestAnimationFrame(update);
}

update();


let current_point    = -1;
let current_triangle = -1;
let glue_condidate_1 = -1;

document.addEventListener('keyup', function(event) {
  if(glue_condidate_1!=-1)
    triangles[glue_condidate_1[0]].vertices[glue_condidate_1[1]].picked = false;
  glue_condidate_1 = -1;
});

canvas.addEventListener('mousedown', function(event) {
  let x = event.offsetX;
  let y = event.offsetY;
  current_point = get_closest_vertice(x,y);
  if(event.ctrlKey)
  {
    if(current_point!=-1)
    {
      if (glue_condidate_1==-1) {
          glue_condidate_1 = current_point;
          triangles[glue_condidate_1[0]].vertices[glue_condidate_1[1]].picked = true;
      }
      else
      {
        if(triangles[glue_condidate_1[0]].vertices[glue_condidate_1[1]].label!=triangles[current_point[0]].vertices[current_point[1]].label) 
        {
          label_dispenser.return_label(triangles[current_point[0]].vertices[current_point[1]].label)
          triangles[current_point[0]].vertices[current_point[1]].label = triangles[glue_condidate_1[0]].vertices[glue_condidate_1[1]].label
          triangles[glue_condidate_1[0]].vertices[glue_condidate_1[1]].picked = false;
        }
        glue_condidate_1 = -1;
      }
    }
  }
  else
    if(current_point==-1){
      current_triangle = pick_triangle(new Vertice(x,y));
    }
});

canvas.addEventListener('mouseup', function(event) {
  current_point    = -1;
  current_triangle = -1;
  recalculate_math();
});


canvas.addEventListener('mousemove', function(event) {
  if(current_point!=-1){
    let x = event.offsetX;
    let y = event.offsetY;
    let triangle = current_point[0]
    let triangle_vertice = current_point[1]
    let closest = get_closest_vertice_except_self(x,y);
    triangles[triangle].vertices[triangle_vertice].x = x; 
    triangles[triangle].vertices[triangle_vertice].y = y; 
    if(closest!=-1){
        let closest_triangle = closest[0];
        let closest_triangle_vertice = closest[1];    
        if(triangle !=closest_triangle && triangles[triangle].vertices[triangle_vertice]!=triangles[closest_triangle].vertices[closest_triangle_vertice]) {
          if(triangles[triangle].vertices[triangle_vertice].label!=triangles[closest_triangle].vertices[closest_triangle_vertice].label) 
            label_dispenser.return_label(triangles[triangle].vertices[triangle_vertice].label)
            triangles[triangle].vertices[triangle_vertice] = triangles[closest_triangle].vertices[closest_triangle_vertice]; 
        }
    }
  }
  else if(current_triangle!=-1){
    var dx = event.movementX;
    var dy = event.movementY;
    for(let i=0; i<3; ++i){
      triangles[current_triangle].vertices[i].x += dx; 
      triangles[current_triangle].vertices[i].y += dy; 
    }    
  }
});

canvas.addEventListener('dblclick', function(event) {
  let x = event.offsetX;
  let y = event.offsetY;
  let picked = pick_triangle(new Vertice(x,y));
  if(picked!=-1){
    delete_triangle(picked);
  }
  else{
    add_triangle(x, y);
  }
});


/////////////////////////////////////// math 

function set_triangles(tt){
   let triangles = []
   for (let t of tt)
      triangles.push(t.split("").sort().join(""))
   return triangles
}


function get_complex(tt){
   let parts = new Set();
   for (let t of tt)
       [t, t[0], t[1], t[2], [t[0],t[1]].sort().join(""),[t[1],t[2]].sort().join(""), [t[0],t[2]].sort().join("")].forEach(x=>parts.add(x))
   let complex_ = [...parts].sort()
   return complex_
}

function get_chain_order(complex, order){
   return complex.filter((c) => c.length == order+1);
}
   
function get_span(tt){
   let string = "";
   for (i in tt)
       string  += (tt[i][0]=="-" ? "-" : "+") + 'x'+(i).toString()+'*'+(tt[i]).toString();
   return tt;
}


function z_div(a, b) {
  let remainder = a % b;
  let aIsInfinite = a === -Infinity || a === Infinity;
  let bIsInfinite = b === -Infinity || b === Infinity;
  let aIsNeg = a + 1 / a < 0;
  let bIsNeg = b + 1 / b < 0;
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

function calculate_boundary(tt){
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
  for (let key in matrix)
      m.push(matrix[key]);
  let m_dim = m.length;
  let smith = invariant_factors(m);
  let rank  = 0;
  let torsion = [];
  for (let f of smith) {
    if(f!=0){
      rank++;
      if(Math.abs(f)!=1) torsion.push(f);
    } 
  }
  
  return {"dim" : m_dim, "rank" : rank, "smith invs" : smith, "torsion" : torsion};
}

function recalculate_math(){
  let out_triangles = [];
  for(let i=0; i<triangles.length; ++i)
    out_triangles.push(triangles[i].vertices[0].label+triangles[i].vertices[1].label+triangles[i].vertices[2].label);
  out_string = "";
  let tt = set_triangles(out_triangles);
  out_string += "triangles  : \\("+tt.toString()+"\\)";
    
  let complex_ = get_complex(tt);
  out_string += "\n complex  : \\("+complex_.toString()+"\\)";
  let ch0 = get_chain_order(complex_, 0);
  out_string += "\n\n 0-chain   : \\("+ch0.toString()+"\\)";
  let ch1 = get_chain_order(complex_, 1);
  out_string += "\n 1-chain   : \\("+ch1.toString()+"\\)";
  let ch2 = get_chain_order(complex_, 2);
  out_string += "\n 2-chain  : \\("+ch2.toString()+"\\)";

  let b0 = calculate_boundary(ch0);
  out_string += "\n\n 0-boundary : "+JSON.stringify(b0);
  let b1 = calculate_boundary(ch1);
  out_string += "\n 1-boundary : "+JSON.stringify(b1);
  let b2 = calculate_boundary(ch2);
  out_string += "\n 2-boundary : "+JSON.stringify(b2);
    
  let conn_components = b1.dim - b1.rank - b0.rank;
  out_string += "\n\nconnected components: \\(" + conn_components.toString()+"\\)";
  let holes = b2.dim - b2.rank - b1.rank;
  out_string += "\nholes : \\(" + holes.toString()+"\\)";

  let voids = out_triangles.length - b2.rank;
  out_string += "\n voids :  \\(" + voids.toString()+"\\)";


  out_string += "\n\n \\( H_0(K) \\cong \\mathbb{Z}^{" + conn_components.toString() + "}\\)"; // ??

  out_string += "\n \\( H_1(K) \\cong \\mathbb{Z}^{" + holes.toString() + "}"; 
  for (let t of b2.torsion)
    out_string += "\\oplus \\mathbb{Z}_{" + t.toString() + "}";
  out_string += "\\)";  

  out_string += "\n \\( H_2(K) \\cong \\mathbb{Z}^{" + voids.toString() + "}\\)"; // ??

  output.innerText = out_string;

  MathJax.typesetClear([output]);
  output.innerText = out_string;
  MathJax.typesetPromise([output]).then(() => {});
}
