let canvas = document.getElementById("canvas");
let output = document.getElementById("output");
let context = canvas.getContext("2d");
let my_green = "rgb(144, 238, 144, 0.4)";
let my_coral = "rgb(240, 128, 128, 0.9)";

canvas.width  = 600;
canvas.height = 600;

MathJax = {
  loader: {load: ['[tex]/amsCd']},
  tex: {packages: {'[+]': ['amsCd']}},
  options: {ignoreHtmlClass: 'tex2jax_ignore'}
};

class Alphabet {
  constructor() {
    let alphabet = 'ωψχϕυτσρπξνμλκθηζϵδγβαzyxwvutsrqponmklkjihgfedcbaΘΞΩΨΣΛZYXWVUTRPMLKJHGFDCBA';
    this.labels = [];
    for(let ch of alphabet)
      this.labels.push(ch);
  }
  
  get_label() {
    let label = this.labels.pop()
    console.log("symbol " + label + " allocated");
    return label;
  }

  return_label(label) {
    this.labels.push(label);
    console.log("symbol " + label + " returned");
   }
}

let label_allocator = new Alphabet();

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
let current_point    = -1;
let current_triangle = -1;
let glue_condidate_1 = -1;

function get_distance(a,b) {
  return (a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y);
}

const RR = 15*15;
function get_closest_vertice(v) {
  for(let i=0; i<triangles.length; ++i)
    for(let j=0; j<3; ++j) {
      if(get_distance(triangles[i].vertices[j], v)<RR) return [i,j];
  }
  return -1;
}

const RR_1 = 15*15;
function get_closest_vertice_except_self(v) {
  for(let i=0; i<triangles.length; ++i)
    for(let j=0; j<3; ++j) {
      if(triangles[i].vertices[j]!==v) 
          if(get_distance(triangles[i].vertices[j], v)<RR_1) return [i,j];
    }
    return -1;
}

function return_label_if_poss(label) {
  for(let i=0; i<triangles.length; ++i) {
    for(let j=0; j<3; ++j) {
      if (triangles[i].vertices[j].label == label) 
        return;
    }
   }
  label_allocator.return_label(label);
}

const new_triangle_scale = 30;
function add_triangle(x,y) {
  triangles.push(new Triangle(new Vertice(x,                    y+new_triangle_scale, label_allocator.get_label()),
                              new Vertice(x-new_triangle_scale, y-new_triangle_scale, label_allocator.get_label()),
                              new Vertice(x+new_triangle_scale, y-new_triangle_scale, label_allocator.get_label())));
  recalculate_math();
}

function add_triangle_v(v1, v2, v3) {
  triangles.push(new Triangle(v1,v2,v3));
  recalculate_math();
}

function pick_triangle(vertice) {
  for(let i=0; i<triangles.length; ++i)
    if(is_inside_triangle(triangles[i], vertice)) return i;
  return -1
}

function delete_triangle(i) {
  let label1 = triangles[i].vertices[0].label;
  let label2 = triangles[i].vertices[1].label;
  let label3 = triangles[i].vertices[2].label;
  if(i+1!=triangles.length) 
      [triangles[i], triangles[triangles.length-1]] = [triangles[triangles.length-1], triangles[i]];
  triangles.splice(-1);
  return_label_if_poss(label1);
  return_label_if_poss(label2);
  return_label_if_poss(label3);
  recalculate_math();
}

function draw_triangles() {
    let set = {}
    for(let i=0; i<triangles.length; ++i) { 
      let labels = [triangles[i].vertices[0].label,triangles[i].vertices[1].label,triangles[i].vertices[2].label].sort().join("");
      if(!set.hasOwnProperty(labels)) 
        set[labels] = 1;
      else
        set[labels] += 1;
    }

    canvas.style.backgroundColor = "white";
    context.clearRect(0,0, canvas.width, canvas.height);
    for(let i=0; i<triangles.length; ++i) {
      let labels = [triangles[i].vertices[0].label,triangles[i].vertices[1].label,triangles[i].vertices[2].label].sort().join("");
      if(set[labels]==1)
        context.fillStyle = my_green;
      else
        context.fillStyle = 'LightPink';
      context.strokeStyle = "gray";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(triangles[i].vertices[0].x, triangles[i].vertices[0].y);
      for(let j=0; j<3; ++j) {
        context.lineTo(triangles[i].vertices[j].x, triangles[i].vertices[j].y);
        context.fill();
      }
      context.lineTo(triangles[i].vertices[0].x, triangles[i].vertices[0].y);    
      context.fill();
      context.stroke();
      context.closePath();
    }   
}

function draw_vertices() {
  for(let i=0; i<triangles.length; ++i) {
    for(let j=0; j<3; ++j) {
      context.beginPath();
      context.fillStyle = triangles[i].vertices[j].picked ? 'red' : my_coral;
      context.arc(triangles[i].vertices[j].x, triangles[i].vertices[j].y, 5, 0, 2*Math.PI);   
      context.fill();
      context.closePath();
    }
  } 
}

function draw_labels() { 
  let labels = new Set();
  context.fillStyle = 'black';
  context.font = "italic 15px Verdana";
  for(let i=0; i<triangles.length; ++i) {
    for(let j=0; j<3; ++j) {
      if(!labels.has(triangles[i].vertices[j])) {
        context.fillText(triangles[i].vertices[j].label, triangles[i].vertices[j].x, triangles[i].vertices[j].y+20);
        labels.add(triangles[i].vertices[j]);
      }
    } 
  }
}

function get_median(triangle) {
  let x = 0;
  let y = 0;
  for(let i=0; i<3; ++i) {
    x += triangle.vertices[i].x;
    y += triangle.vertices[i].y;
  }
  return [x/3,y/3];
}

function get_direction(x,y) {
  console.log([x, y]);
  let dx = x[0]-y[0];
  let dy = x[1]-y[1];

  let d = Math.sqrt(dx*dx+dy*dy);
  return [dx/d, dy/d];
}

function update() {
  draw_triangles();
  draw_vertices();
  draw_labels();
  requestAnimationFrame(update);
}

function can_glue(x,y) {
  for(let i=0; i<triangles.length; ++i)
  {
    let has_y = 0;
    let has_x_label = 0;
    for(let j=0; j<3; ++j){
      has_y += (triangles[i].vertices[j]===triangles[y[0]].vertices[y[1]]);
      has_x_label += (triangles[i].vertices[j].label==triangles[x[0]].vertices[x[1]].label);
    
    }
    if(has_y && has_x_label) return false;
  }
  return true;

}

function glue(x, y) { // y gets label from x
  triangles[y[0]].vertices[y[1]].label = triangles[x[0]].vertices[x[1]].label
  return_label_if_poss(triangles[y[0]].vertices[y[1]].label);
}

function change_all_v1_to_v2(v1, v2) {
  if(v1!==v2) {
    let label = v1.label;
    for(let i=0; i<triangles.length; ++i) {
      let common_vert = 0;
      for(let j=0; j<3; ++j) {
        common_vert += (triangles[i].vertices[j]===v1) + (triangles[i].vertices[j]===v2);
      }
      if(common_vert==2) return;
    }
    for(let i=0; i<triangles.length; ++i) {
      for(let j=0; j<3; ++j) {
        if (triangles[i].vertices[j]===v1)
          triangles[i].vertices[j] = v2;
      }
    }
    return_label_if_poss(label);
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

document.addEventListener('keyup', function(event) {
  if(glue_condidate_1!=-1)
    triangles[glue_condidate_1[0]].vertices[glue_condidate_1[1]].picked = false;
  glue_condidate_1 = -1;
});


const R = 20;
function split(v) {
  let vertice = triangles[v[0]].vertices[v[1]]; 
  let label = triangles[v[0]].vertices[v[1]].label;
  let new_vertices = new Set();
  let n_new = 0;
  for(let i=0; i<triangles.length; ++i){
    for(let j=0; j<3; ++j){
      if(triangles[i].vertices[j]===vertice){
        triangles[i].vertices[j] = new Vertice(triangles[i].vertices[j].x, triangles[i].vertices[j].y, label_allocator.get_label()); 
        new_vertices.add(triangles[i].vertices[j]);
        n_new += 1;
      }
    }
  }
  return_label_if_poss(label);
  if(n_new>1) {
    for(let i=0; i<triangles.length; ++i){
      for(let j=0; j<3; ++j){
        if(new_vertices.has(triangles[i].vertices[j])) {
          let dir = get_direction([triangles[i].vertices[j].x, triangles[i].vertices[j].y], get_median(triangles[i]));
          triangles[i].vertices[j].x -= parseInt(R*dir[0]);
          triangles[i].vertices[j].y -= parseInt(R*dir[1]);
        }
      }
    }
  }
}

canvas.addEventListener('mousedown', function(event) {
  let x = event.offsetX;
  let y = event.offsetY;
  current_point = get_closest_vertice(new Vertice(x,y));
  if(event.altKey) {
    if(current_point!=-1) {
      split(current_point);
      return;
    }
  }
  if(event.ctrlKey) { // glue
    if(current_point!=-1) {
      if (glue_condidate_1==-1) {
          glue_condidate_1 = current_point;
          triangles[glue_condidate_1[0]].vertices[glue_condidate_1[1]].picked = true;
      } else {
        if(can_glue(glue_condidate_1, current_point)) glue(glue_condidate_1, current_point);
        triangles[glue_condidate_1[0]].vertices[glue_condidate_1[1]].picked = false;
        glue_condidate_1 = -1;
      }
    }
  }
  else
    if(current_point==-1) {
      current_triangle = pick_triangle(new Vertice(x,y));
    }
});

canvas.addEventListener('mouseup', function(event) {
  current_point    = -1;
  current_triangle = -1;
  recalculate_math();
});

canvas.addEventListener('mousemove', function(event) {
  if(current_point!=-1) {
    let x = event.offsetX;
    let y = event.offsetY;
    let triangle = current_point[0]
    let triangle_vertice = current_point[1]
    triangles[triangle].vertices[triangle_vertice].x = x; 
    triangles[triangle].vertices[triangle_vertice].y = y; 
    let closest = get_closest_vertice_except_self(triangles[triangle].vertices[triangle_vertice]);
    if(!event.shiftKey && closest!=-1) {
      let closest_triangle = closest[0];
      let closest_vertice  = closest[1];
      if(triangles[triangle].vertices[triangle_vertice].label==triangles[closest_triangle].vertices[closest_vertice].label ||
        can_glue(closest,current_point))
        change_all_v1_to_v2(triangles[triangle].vertices[triangle_vertice], triangles[closest_triangle].vertices[closest_vertice]);    
    }
  } else if(current_triangle!=-1) {
    var dx = event.movementX;
    var dy = event.movementY;
    for(let i=0; i<3; ++i) {
      triangles[current_triangle].vertices[i].x += dx; 
      triangles[current_triangle].vertices[i].y += dy; 
    }    
  }
});

canvas.addEventListener('dblclick', function(event) {
  let x = event.offsetX;
  let y = event.offsetY;
  if(event.shiftKey) { //add grid
    add_grid(x,y);
    return;
  }
  let picked = pick_triangle(new Vertice(x,y));
  if(picked!=-1){
    delete_triangle(picked);
  } else {
    add_triangle(x, y);
  }
});

/////////////////////////////////////// math 

function set_triangles(tt) {
   let triangles = []
   for (let t of tt)
      triangles.push(t.split("").sort().join(""))
   return triangles
}

function get_complex(tt) {
   let parts = new Set();
   for (let t of tt)
       [t, t[0], t[1], t[2], [t[0],t[1]].sort().join(""),[t[1],t[2]].sort().join(""), [t[0],t[2]].sort().join("")].forEach(x=>parts.add(x));
   let complex_ = [...parts].sort();
   return complex_;
}

function get_chain_order(complex, order) {
   return complex.filter((c) => c.length == order+1);
}
   
function z_div(a, b) {
  let remainder = a % b;
  let aIsInfinite = a === -Infinity || a === Infinity;
  let bIsInfinite = b === -Infinity || b === Infinity;
  let aIsNeg = a + 1 / a < 0;
  let bIsNeg = b + 1 / b < 0;
  return [ (aIsInfinite !== bIsInfinite && a) ? aIsInfinite ? NaN : aIsNeg === bIsNeg ? 0 : -1 : Math.floor(a / b),
           (!a && b < 0) ? -0 : remainder + (remainder !== 0 && aIsNeg !== bIsNeg ? b : 0)];
}

function z_gcdex(a, b) {
  if (a==0 && b==0) return [0, 1, 0];
  if (a==0) return [0, parseInt(b/Math.abs(b)), Math.abs(b)];
  if (b==0) return [parseInt(a/Math.abs(a)), 0, Math.abs(a)];

  let x_sign = undefined;
  if (a < 0) {
    a = -a;
    x_sign = -1;
  } else {
    x_sign = 1;
  }

  let y_sign = undefined;
  if (b < 0) {
    b = -b;
    y_sign = -1;
  } else {
    y_sign = 1
  }

  let c = undefined;
  let q = undefined;
  let x = 1;
  let y = 0;
  let r = 0;
  let s = 1;
  while (b!=0) {
    [c, q] = [a % b, parseInt(a / b)];
    [a, b, r, s, x, y] = [b, c, x - q*r, y - q*s, r, s];  
  }
  return [x * x_sign, y * y_sign, a];
}

function add_columns(m, i, j, a, b, c, d) {
  for(let k=0; k<m.length; ++k) {
      let e = m[k][i];
      m[k][i] = a*e + b*m[k][j];
      m[k][j] = c*e + d*m[k][j];
  }
}

function add_rows(m, i, j, a, b, c, d) {
  for (let k=0; k<m[0].length; ++k) {
    let e = m[i][k];
    m[i][k] = a*e + b*m[j][k];
    m[j][k] = c*e + d*m[j][k];
  }
}

function clear_column(m) {
  if(m[0][0] == 0) return m;
  let pivot = m[0][0];
  for (let j=1; j<m.length; ++j) {
    if (m[j][0] == 0) continue;
    let d = undefined;
    let r = undefined;
    [d, r] = z_div(m[j][0], pivot)
    if (r==0) {
        add_rows(m, 0, j, 1, 0, -d, 1);
    } else {
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

function add_grid(x,y) {
  let d = 70;
  let n = 3;
  let m = 3;
  let vertices = [];
  for(let i=0; i<=m; ++i) {
    let row = [];
    for(let j=0; j<=n; ++j) {
      row.push(new Vertice(x+d*i, y+d*j, label_allocator.get_label())); 
    }
    vertices.push(row);
  }
  for(let i=0; i<m; ++i) {
    for(let j=0; j<n; ++j) {
      add_triangle_v(vertices[i][j],vertices[i+1][j],vertices[i+1][j+1]);
      add_triangle_v(vertices[i][j],vertices[i][j+1],vertices[i+1][j+1]);
    }
  }
}

function clear_row(m) {
  if (m[0][0] == 0) return m;
  let pivot = m[0][0];
  for(let j=1; j<m[0].length; ++j){
    if (m[0][j] == 0) continue;
    let d = undefined;
    let r = undefined;
    [d, r] = z_div(m[0][j], pivot)
    if (r==0){
        add_columns(m, 0, j, 1, 0, -d, 1)
    } else {
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

function invariant_factors(m) {
  if (m.length==0 || m[0].length==0) return [];
  let ind = [];
  for(let i=0; i<m.length; ++i)
    if(m[i][0]!=0) ind.push(i)

  if (ind.length>0 && ind[0] != 0){
    [m[0], m[ind[0]]] = [m[ind[0]], m[0]];
  } else {
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
  let matrix = new Object();
  let k = [];
  for(let i=0; i<n; ++i) {
      k.push(tt[i].toString())
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
  let v = [];  
  let new_m = [];
  for (let key in matrix) {
      m.push([...matrix[key]]);
      new_m.push([...matrix[key]]);
      v.push(key);
  }
  let m_dim = m.length;
  let smith = invariant_factors(new_m);
  let rank  = 0;
  let torsion = [];
  for (let f of smith) {
    if(f!=0) {
      rank++;
      if(Math.abs(f)!=1) torsion.push(f);
    } 
  }
  return {"dim" : m_dim, "rank" : rank, "smith_invs" : smith, "torsion" : torsion, "m" : m, "v" : v, "k" : k};
}

function check_triangles(tt)
{
  let set = new Set();
  for(let t of tt)
  {
    if(set.has(t))
      return [false, t];
    else
      set.add(t);   
  }
     return [true, ];
}

function matrix_latex(m, v, k) {
  let out_string = "$$ \n";
  out_string += "\\begin{pmatrix}\n";
  for(let i=0; i<v.length; ++i) {
    if(i!=0) out_string += "\\\\ \n";
    out_string += "k_{"+v[i].toString()+"}"; 
  } 
  out_string += "\\end{pmatrix} = ";
  out_string += "\n \\begin{pmatrix}\n";
  for(let i=0; i<m.length; ++i) {
    let row = "";
    if(i!=0) row += "\\\\ \n";
    for(let j=0; j<m[0].length; ++j) {
      if(j!=0) row += "&";
      row += m[i][j].toString(); 
  }
  out_string += row;
  }
  out_string += "\\end{pmatrix}";
  out_string += "\\begin{pmatrix}\n";
  if(k.length>0) {
    for(let i=0; i<k.length; ++i) {
      if(i!=0) out_string += "\\\\ \n";
      out_string += "k_{"+(k[i]).toString()+"}"; 
    }
  }
  out_string += "\\end{pmatrix}";
  out_string += "\n$$";
  return out_string;
}

function show_hide_latex(div_name, btn_name) {
  console.log(div_name, btn_name);
  let out = document.getElementById(div_name);
  let btn = document.getElementById(btn_name);

  if(out.classList.contains('tex2jax_ignore')) {
    out.classList.remove("tex2jax_ignore");
    MathJax.typesetPromise().then(() => {
      MathJax.typesetClear([out]);
      MathJax.typesetPromise([out]);
    }).catch((err) => console.log(err.message));
  }

  if(out.style.display=="none") {
    out.style.display = "block";
    btn.innerText = "▼";
  } else {
    out.style.display = "none";
    btn.innerText = "▶";
  }
}

function hide_show_latex(latex_code, div_name, btn_name) {
  let out_str = "";
  out_str += "<br><button style='border:none; background-color: white; width:24px' id=\"" + btn_name + "\"";
  out_str += "onclick='show_hide_latex(\"" + div_name + "\", \"" + btn_name + "\")' "; 
  out_str += div_name + ", " + btn_name;
  out_str += "> ▶ </button>\n";
  out_str += "<div id=\"" + div_name + "\" style='display:none' class='tex2jax_ignore'>\n"
  out_str += latex_code;
  out_str += "\n</div>\n";
  return out_str;
}

function chain_latex(chain) {
  let latex = "";
  for(let ch of chain)
   latex += "\\(" + ch + "\\), ";
  return latex;
}

function recalculate_math() {
  let out_triangles = [];
  for(let i=0; i<triangles.length; ++i)
    out_triangles.push(triangles[i].vertices[0].label+triangles[i].vertices[1].label+triangles[i].vertices[2].label);
  let out_string = "";
  let b1 = undefined;
  let b2 = undefined;
  let tt = set_triangles(out_triangles);
  if(tt.length==0) {
    output.innerHTML = "";
    return;
  }
  let tt_status = check_triangles(tt);
  if(!tt_status[0]) {
    output.style.color = "red";
    out_string += "Duplicate triangle : \\(" + tt_status[1].toString() + "\\)";
    output.innerHTML = out_string;
    MathJax.typesetClear([output]);
    MathJax.typesetPromise([output]).then(() => {});
    return;
  } 

  const max_length = 15;

  output.style.color = "black";
  out_string += "triangles  : ";  
  let tt_latex = chain_latex(tt);
  out_string += (tt.length > max_length) ? hide_show_latex(tt_latex, 'TT_div', 'TT_btn') : tt_latex;
  
  let complex_ = get_complex(tt);
  let ch0 = get_chain_order(complex_, 0);
  out_string += "<br><br>0-chain   : ";
  let ch0_latex = chain_latex(ch0);
  out_string += (ch0.length > max_length) ? hide_show_latex(ch0_latex, 'CH0_div', 'CH0_btn') : ch0_latex;

  let ch1 = get_chain_order(complex_, 1);
  out_string += "<br> 1-chain   : ";
  let ch1_latex = chain_latex(ch1);
  out_string += (ch1.length > max_length) ? hide_show_latex(ch1_latex, 'CH1_div', 'CH1_btn') : ch1_latex;

  let ch2 = get_chain_order(complex_, 2);
  out_string += "<br> 2-chain  : ";
  let ch2_latex = chain_latex(ch2);
  out_string += (ch2.length > max_length) ? hide_show_latex(ch2_latex, 'CH2_div', 'CH2_btn') : ch2_latex;


  let b0 = calculate_boundary(ch0);
  out_string += "<br><br> &nbsp &nbsp &nbsp 0-boundary : dim = \\(" + b0.dim.toString() + "\\); rank = \\(" + b0.rank.toString() + "\\)";
  b1 = calculate_boundary(ch1);
  let b1_matrix_latex = matrix_latex(b1.m, b1.v, b1.k);
  out_string += hide_show_latex(b1_matrix_latex, 'BD1_div', 'BD1_btn'); 
  out_string += "1-boundary : dim = \\(" + b1.dim.toString() + "\\); rank = \\(" + b1.rank.toString() + "\\); Smith = [";
  for(let s of b1.smith_invs)
    out_string += "\\(" + s + "\\), ";
  out_string += "]<div id='b1_matrix' style=\"display:none\"></div>";   
  b2 = calculate_boundary(ch2);
  let b2_matrix_latex = matrix_latex(b2.m, b2.v, b2.k);
  out_string += hide_show_latex(b2_matrix_latex, 'BD2_div', 'BD2_btn'); 

  out_string += "2-boundary : dim = \\(" + b2.dim.toString() + "\\); rank = \\(" + b2.rank.toString() + "\\); Smith = [";
  for(let s of b2.smith_invs)
    out_string += "\\(" + s + "\\), ";
  out_string += "]<div id='b2_matrix' style=\"display:none\"></div>";
  let conn_components = b1.dim - b1.rank - b0.rank;
  out_string += "<br><br>connected components: \\(" + conn_components.toString() + "\\)";
  let holes = b2.dim - b2.rank - b1.rank;
  out_string += "<br>holes : \\(" + holes.toString() + "\\)";
  let voids = out_triangles.length - b2.rank;
  out_string += "<br>voids :  \\(" + voids.toString()+"\\)";
  out_string += "<br><br> \\( H_0(K) = \\text{Ker}(\\partial_0) / \\text{Im}(\\partial_1) \\cong \\mathbb{Z}^{" + conn_components.toString() + "}\\)"; 
  out_string += "<br> \\( H_1(K) = \\text{Ker}(\\partial_1) / \\text{Im}(\\partial_2) \\cong \\mathbb{Z}^{" + holes.toString() + "}"; 
  for (let t of b2.torsion)
    out_string += "\\oplus \\mathbb{Z}_{" + Math.abs(t).toString() + "}";
  out_string += "\\)";  
  out_string += "<br> \\( H_2(K) = \\text{Ker}(\\partial_2) / \\text{Im}(\\partial_3) \\cong \\mathbb{Z}^{" + voids.toString() + "}\\)"; 

  out_string += "<br>\n";
  out_string += "$$\n";
  out_string += "\\begin{CD}\n";
  out_string += "\\emptyset @>\\partial_{3}>> C_2 @>\\partial_{2}>> C_{1} @>\\partial_{1}>> C_0 @>\\partial_0>> 0\n";
  out_string += "\\end{CD}\n"; 
  out_string += "$$\n";

  MathJax.typesetPromise().then(() => {
    MathJax.typesetClear([output]);
    output.innerHTML = out_string;  
    MathJax.typesetPromise([output]);
  }).catch((err) => console.log(err.message)); 
}

update();
