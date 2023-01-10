
//a* path finding algorithm: f(n) = g(n)+h(n)
//f(n): how much does each nodes cost theoretically 
//g: actual cost of the time/distance(..) from begin to end
//h: heuristics: an educated guess to skip checking lots of 
//possibilities and makes the algorithm much faster
//reference: a*: https://en.wikipedia.org/wiki/A*_search_algorithm#Pseudocode
//reference: the coding train - instance mode: https://www.youtube.com/watch?v=Su792jEauZg

  
var cols = 60;
var rows = 60;

//the 2d array
var grid = new Array(cols);

//open set stores the nodes that still need to be evaluated
//closed set stores all the nodes that has been finished evaluated
//the algorithm is finished when there's nothing left in the open set
//or it has arrived the end successfully
var openSet = [];
var closedSet = [];

// start and end
var start;
var end;

// width and height of each cell of grid
var w, h;

// the road taken
var path = [];

//check if the p5js sketch is loaded inside the max jweb object
function detectMax() {
  try {
    window.max.outlet('Hello Max!');
    return true;
  }
  catch(e) {
    console.log('Max, where are you?');
  }
  return false;
}

var sketch = function(p){
  //for time control in max
  let frameRate_speed = 2;

  //test and memorize if the sketch is loaded inside jweb
  var maxIsDetected = detectMax();

  p.removeFromArray = function(arr, elt) {
    //loop through the array, if it has the element then delete it
    //loop from backwards
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i] == elt) {
        arr.splice(i, 1);
      }
    }
  }
  
  p.heuristic = function(a, b) {
    var d = p.dist(a.i, a.j, b.i, b.j);
    // var d = abs(a.i - b.i) + abs(a.j - b.j);
    return d;
  }
  

p.Spot = function(i, j) {

  // location
 this.i = i;
 this.j = j;

 // f, g, and h values for A*
 this.f = 0;
 this.g = 0;
 this.h = 0;

 // neighbors
 this.neighbors = [];

 // where the previous is
 this.previous = undefined;

 // check if it's a wall
 this.wall = false;
 if (p.random(1) < 0.4) {
   this.wall = true;
 }

 // display
 this.show = function(col) {
   if (this.wall) {
     p.fill(0);
     p.noStroke();
     p.ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 2, h / 2);
   } else if (col) {
     p.fill(col);
     p.rect(this.i * w, this.j * h, w, h);
   }
 }

 // figure out who my neighbors are
 this.addNeighbors = function(grid) {
   var i = this.i;
   var j = this.j;
   if (i < cols - 1) {
     this.neighbors.push(grid[i + 1][j]);
   }
   if (i > 0) {
     this.neighbors.push(grid[i - 1][j]);
   }
   if (j < rows - 1) {
     this.neighbors.push(grid[i][j + 1]);
   }
   if (j > 0) {
     this.neighbors.push(grid[i][j - 1]);
   }
   //make it able to move diagonally
   if (i > 0 && j > 0) {
     this.neighbors.push(grid[i - 1][j - 1]);
   }
   if (i < cols - 1 && j > 0) {
     this.neighbors.push(grid[i + 1][j - 1]);
   }
   if (i > 0 && j < rows - 1) {
     this.neighbors.push(grid[i - 1][j + 1]);
   }
   if (i < cols - 1 && j < rows - 1) {
     this.neighbors.push(grid[i + 1][j + 1]);
   }
 }
}

  
  p.setup = function() {
    p.createCanvas(400, 400);
    console.log('A*');
    
    //set the frame rate
    window.max.bindInlet('set_frameRate', function (speed) {
      frameRate_speed = speed;
      p.frameRate(frameRate_speed);
  });
  
    // grid cell size
    w = p.width / cols;
    h = p.height / rows;
  
  // create a 2d array
    for (var i = 0; i < cols; i++) {
      grid[i] = new Array(rows);
    }
  
  // make each spot in the grid an object
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        grid[i][j] = new p.Spot(i, j);
      }
    }
  
  //make everything has its own neighbors
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        grid[i][j].addNeighbors(grid);
      }
    }
  
  
  // start at top left and end at bottom right
    start = grid[0][0];
    end = grid[cols - 1][rows - 1];
    start.wall = false;
    end.wall = false;
  
    // open set starts with beginning only
    openSet.push(start);
  }
  
  
  p.draw = function() {

    p.frameRate(frameRate_speed);
    // continue or start to find the path
    if (openSet.length > 0) {
  
      //find the one thats the winner
      var winner = 0;
      for (var i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[winner].f) {
          winner = i;
        }
      }
      var current = openSet[winner];
  
      //finish when the winner is the end
      if (current === end) {
        p.noLoop();
        console.log("DONE!");
      }
  
      //if evaluated remove the element from open set
      p.removeFromArray(openSet, current);
      closedSet.push(current);
  
      //check if neighbor is not in the closed set
      var neighbors = current.neighbors;
      for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];
  
        //check if its a better plan
        //calculate the heuristics
        if (!closedSet.includes(neighbor) && !neighbor.wall) {
          var tempG = current.g + p.heuristic(neighbor, current);
          var newPath = false;
          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
              newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            openSet.push(neighbor);
          }
  
          //if its a better plan
          if (newPath) {
            neighbor.h = p.heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
          }
        }
  
      }
      // no solution
    } else {
      console.log('no solution');
      p.noLoop();
      return;
    }
  
    // draw current state of everything
    p.background(255);
  
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        grid[i][j].show();
      }
    }
  
    for (var i = 0; i < closedSet.length; i++) {
      closedSet[i].show(p.color(237, 230, 223));
    }
  
    for (var i = 0; i < openSet.length; i++) {
      openSet[i].show(p.color(197, 199, 201));
    }
  
    //find the path 
    path = [];
    var temp = current;
    path.push(temp);
    //back track the path
    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
    }
  
    // drawing path as continuous line
    p.noFill();
    p.stroke(125, 176, 239);
    p.strokeWeight(w / 2);
    p.beginShape();
    for (var i = 0; i < path.length; i++) {
      p.vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
    }
    p.endShape();
  
    // generate diffrent number
    console.log(i);

        //establish communication between the patcher and sketch
        if(maxIsDetected){          
          // 2 data outputs
          window.max.outlet('spot', i, j);
          let dict = {
            x: i,
            y: j
          };
          window.max.setDict('spotDict', dict);
        }
    
  
  }

}

var myp5 = new p5(sketch);
