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
        console.log(label)
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