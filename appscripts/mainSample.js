
console.log("yo, I'm alive!");

var paper = new Raphael(document.getElementById("mySVGCanvas"));
// Find get paper dimensions
var dimX = paper.width;
var dimY = paper.height;


//--------------------------------

var bg = paper.rect(0, 0, dimX, dimY);

bg.attr({
        "stroke": "#444444",
        "stroke-width": 20,
        "fill" : "#CCAAFF"        // must be filled to get mouse clicks        
})


bg.node.addEventListener('mousedown', function(ev){
	console.log("OK, got a mousedown event");
});

let line1 = paper.path(["M", dimX/2,dimY/2, "L", 0.75*dimX,0.75*dimY]);

line1.attr({
	"stroke":"red",
	"stroke-width":20
});

//cx,cy,r
let circle1=paper.circle(dimX/2,dimY/2,25).attr({
	"fill":"#F0F",
	"stroke-width":5,
	"stroke":"red"
});

let circle2=paper.circle(0.75*dimX,0.75*dimY,50).attr({
	"fill":"blue",
	"stroke-width":5,
	"stroke":"blue"
});

var state=0; //initialising
// 0 for up, 1 for down

circle2.node.addEventListener('mousedown', function(ev){
	console.log("OK, got a mousedown event");
	state=1;
});

circle2.node.addEventListener('mouseup', function(ev){
	console.log("OK, got a mouseup event");
	state=0;
});

circle2.node.addEventListener("mousemove", function(ev){
	console.log("Mouse is at (" +ev.offsetX+","+ev.offsetY+")");
	if (state===1){
	circle2.animate({cx:ev.offsetX,cy:ev.offsetY},
			0.001,"linear")
	line1.animate({path:["M", dimX/2,dimY/2, "L", ev.offsetX,ev.offsetY]},
			0.001,"linear");
}
});

bg.node.addEventListener("mousemove", function(ev){
	console.log("Mouse is at (" +ev.offsetX+","+ev.offsetY+")");
	if (state===1){
	circle2.animate({cx:ev.offsetX,cy:ev.offsetY},
			0.001,"linear")
	line1.animate({path:["M", dimX/2,dimY/2, "L", ev.offsetX,ev.offsetY]},
			0.001,"linear");
}
});

var expand=function(r){
	circle1.animate({'r':100},5000,"linear",contract)
};

var contract=function(r){
	circle1.animate({'r':10},1000,"linear",expand)
};

expand();





