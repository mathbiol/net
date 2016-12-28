console.log('net.js loaded');

Net = function(){
    var d = (new Date).toJSON()
    this.id=d+'_Net_'+Math.random().toString().slice(2)
    //this.type=this.constructor.name
    this.log=[{created:d}]
    this.nodes={}
    this.edges={}
}

Net.net=new Net  // default net, will be used if none is declared

Node = function(p,nt){ // note second input argument is the net, or nets, this is being registered to
    nt = nt || Net.net
    var d = (new Date).toJSON()
    this.id=d+'_Node_'+Math.random().toString().slice(2)
    this.type=this.constructor.name
    if(!p){p={}}
    this.properties=p
    this.log=[{created:d}]
    this.EDGESto=[]
    this.EDGESfrom=[]
    this.edge=function(edg){
        this.EDGESfrom.push(edg)
        edg.lastParent=this
        return edg
    }
    nt.nodes[this.id]=this
    nt.nodes[this.id].parentNet=nt
}

Edge = function(p,nt){
    //if(!nt){nt=[net]}
    nt = nt || Net.net
    var d = (new Date).toJSON()
    this.id=d+'_Edge_'+Math.random().toString().slice(2)
    this.type=this.constructor.name
    if(!p){p={}}
    this.properties=p
    this.log=[{created:d}]
    this.FROM=[]
    this.TO=[]
    this.to=function(nd){
        this.TO.push(nd)
        this.FROM.push(this.lastParent)
        nd.EDGESto.push(this)      
        return nd
    }
    nt.edges[this.id]=this
    nt.edges[this.id].parentNet=nt
}

// Net fun

Net.segment=function(M,t){ // segments matrix M with value t
    return M.map(function(r){ // row
        return r.map(function(c){ // cell
    return c>=t
        })
    })
}

Net.paths=function(startNode,endNode,paths){
	//var nt = startNode.parentNet
	var paths = paths || [startNode]
	startNode.checkedPath=true
	4
}



// assemble network from adjancency matrix

Net.assembleFromAdjacency=function(M,N,nt){ // assemble net using adjacency matrix M, vector of nodes N, and graph nt
    // default obj for nodes includes {title:"node i"} where i is the node index
    N = N || M.map(function(m,i){ 
    	return {title:'node '+(i+1)}
    })
    N = N.map(function(n){ // if each note is the note title then say so
    	if(typeof(n)=='string'){n = {title:n}}
    	return n
    })
    nt = nt || (new Net)
    
    nt.adjacencyMatrix = M
    // check dimensions
    if((M.length!==N.length)||(M[0].length!==N.length)){
    	throw 'dimensions of adjancency matrix and list of nodes did not match'
    }
    // create nodes
    N = N.map(function(n){
    	return new Node(n,nt) // node added to nt
    })
    // create edges
    M.forEach(function(r,i){
    	r.forEach(function(c,j){
    		if(c){
    			if(typeof(c)!=='object'){c={value:c}} // if c is a value return it as a {value:<val>} object
    			var ej = new Edge(c,nt)
    			N[i].edge(ej).to(N[j])
    		}
    	})
    })
    //
    return nt   
}

Net.UI=function(div){

	var h = '<h3 style="color:maroon">NetJS <a href="https://github.com/mathbiol/net" target="_blank">source</a></h3>'
	h +='<table id="adjMatrixTable"><tr><td id="adjTd" style="vertical-align:top">'
	h +='<div>Adjacency Matrix <span id="hideShowTxt" style="color:blue">hide</span> <div><textarea id="adjTxt" style="width:200;height:200"></textarea></div><span id="demo" style="color:blue;cursor:pointer">demo</span> <button id="assembleNet">Assemble network</button><hr></div>'
	h +='</td><td style="vertical-align:top">'
	h +='<div id="selectToConnect" align="center" hidden="true">(select to connect)</div><hr><div id="adjTableDiv">...</div>'
	h +='</td></tr></table>'
	div.innerHTML=h
	// hide/show behaviour
	hideShowTxt.style.cursor="pointer"
	hideShowTxt.onclick=function(){
		if(this.textContent=='hide'){
			adjTxt.hidden=assembleNet.hidden=true
			this.textContent='show'
		}else{
			adjTxt.hidden=assembleNet.hidden=false
			this.textContent='hide'
		}
		4
	}

	// text area for matrix input
	demo.onclick=function(){
		adjTxt.textContent = 'USE,1,1,0,0,0,0\nEE,0,0,0,1,0,0\nBI,1,0,1,0,0,0\nFC,1,0,0,0,0,0\nSN,0,0,1,1,0,0\nPE,0,0,1,0,0,0'
		setTimeout(function(){
			demo.hidden=true
		},1000)
	}
	assembleNet.onclick=function(){
		selectToConnect.hidden=false
		if(adjTxt.textContent.length==0){
			demo.style.color='red'
			demo.click()
			setTimeout(function(){
				demo.style.color='blue'
			},1000)
		}
		var txt = adjTxt.value
		var parms = []
		var vals=[]
		txt.split(/[\n\r]+/).forEach(function(r,i){
			var cc = r.split(/[\s,]+/)
			parms[i]={title:cc[0]}
			vals[i]=cc.slice(1).map(function(c){ // <--- conection value captured here
				var ci = +c
				if (isNaN(ci)){ci=c} // in case it is a string of an object
				return ci
			})
		})
		// assemble table
		adjTableDiv.innerHTML=''
		var tb = document.createElement('table')
		adjTableDiv.appendChild(tb)
		var tr = document.createElement('tr') // header row
		tb.appendChild(tr)
		tb.style.fontFamily='courier'
		tb.style.fontSize='small'
		var r = ['from<i class="fa fa-arrow-right" aria-hidden="true"></i>to|'].concat(parms.map(function(x){return x.title}))
		r.forEach(function(h,i){
			var th = document.createElement('th')
			if(i>0){
				h='<input id="endNode_'+(i-1)+'" type="radio" class="endNode">'+h+'&nbsp;'
				th.style.borderBottom='solid'
				th.nd=i-1 // node index
			}else{
				th.style.textAlign="right"
			}
			th.innerHTML=h
			tr.appendChild(th)
		})
		vals.forEach(function(r,i){
			var tr = document.createElement('tr')
			tb.appendChild(tr)
			var th = document.createElement('th')
			tr.appendChild(th)
			th.innerHTML=parms[i].title+'<input id="startNode_'+(i)+'" type="radio" class="startNode">&nbsp;'
			th.style.textAlign="right"
			th.style.borderRight='solid'
			th.nd=i // node index
			r.forEach(function(v,j){
				var td = document.createElement('td')
				tr.appendChild(td)
				td.textContent=v
			})
		})

		// assemble net
		Net.UI.net = Net.assembleFromAdjacency(vals,parms)
		// show paths
		if(document.getElementById('pathList')){
			var div = document.getElementById('pathList')
			div.innerHTML=""
		}else{
			var div = document.createElement('div')
			div.id="pathList"		
		}
		//div.innerHTML='Connections found:'
		var ol = document.createElement('ol')
		div.appendChild(ol)
		//adjTableDiv.appendChild(div)
		adjTd.appendChild(div)
		var links = []
  		//{source: "Microsoft", target: "Amazon", type: "licensing"}
		Object.getOwnPropertyNames(Net.UI.net.edges).forEach(function(ed,i){
			var edli = document.createElement('li')
			var edj = Net.UI.net.edges[ed]
			ol.appendChild(edli)
			edli.innerHTML=JSON.stringify(edj.FROM[0].properties.title)+' --('+JSON.stringify(edj.properties.value)+')--> '+JSON.stringify(edj.TO[0].properties.title)
			edli.style.fontFamily='courier'
			edli.style.color='navy'
			edli.style.fontSize="x-small"
			links.push({
				source:edj.FROM[0].properties.title,
				target:(''+edj.properties.value),
				type:edj.TO[0].properties.title
			})
			// link nodes to radio button
			//edli.fromNode=edj.FROM[0]
			//edli.toNode=edj.TO[0]	
		})
		var IPstart = document.getElementsByClassName("startNode")
		var IPend = document.getElementsByClassName("endNode")
		var startNodes=[], endNodes=[]
		for(var i = 0 ; i<IPstart.length ; i++){
			startNodes.push(IPstart[i])
			endNodes.push(IPend[i])
		}
		startNodes.forEach(function(ip,i){
			ip.onchange=function(evi){
				if(evi.currentTarget.checked){
					startNodes.forEach(function(evj,j){
						if((i!==j)&&(evj.checked)){evj.checked=false}
					})
				}
			}
			ip.onmouseover=function(){
				Net.UI.startValOver=this.checked
			}
			ip.onclick=function(){
				Net.UI.startValOver=this.checked=!Net.UI.startValOver
				setTimeout(Net.UI.getStartEnd,100)
			}
		})
		endNodes.forEach(function(ip,i){
			ip.onchange=function(evi){
				if(evi.currentTarget.checked){
					endNodes.forEach(function(evj,j){
						if((i!==j)&&(evj.checked)){evj.checked=false}
					})
				}
			}
			ip.onmouseover=function(){
				Net.UI.endValOver=this.checked
			}
			ip.onclick=function(){
				Net.UI.endValOver=this.checked=!Net.UI.endValOver
				setTimeout(Net.UI.getStartEnd,100)
			}
		})
		Net.UI.getStartEnd=function(){ // look for start en end nodes in the UI
			var X = startNodes
			var Y = endNodes
			Net.UI.startInput=X.filter(function(N){return N.checked})[0]
			Net.UI.endInput=Y.filter(function(N){return N.checked})[0]
			if(Net.UI.startInput){
				// get the actual node ref instead of the index
				Net.UI.startInput=Net.UI.net.nodes[Object.getOwnPropertyNames(Net.UI.net.nodes)[Net.UI.startInput.parentNode.nd]]
			}
			if(Net.UI.endInput){
				// get the actual node ref instead of the index
				Net.UI.endInput=Net.UI.net.nodes[Object.getOwnPropertyNames(Net.UI.net.nodes)[Net.UI.endInput.parentNode.nd]]
			}
			// input only
			if(Net.UI.startInput&&(!Net.UI.endInput)){
				console.log('only input: ',Net.UI.startInput)
				Net.UI.pathList(Net.UI.startInput.EDGESfrom)
			}
			// output only
			if(Net.UI.endInput&&(!Net.UI.startInput)){
				console.log('only output: ',Net.UI.endInput)
				Net.UI.pathList(Net.UI.endInput.EDGESto)
			}
			// both input and output available
			if(Net.UI.startInput&&Net.UI.endInput){
				console.log('both input: ',Net.UI.startInput, 'and output:',Net.UI.endInput)
				Net.UI.pathList(Net.UI.net.edges)
			}
			// neither input nor output available
			if((!Net.UI.startInput)&&(!Net.UI.endInput)){
				console.log('neither input nor output available')
				Net.UI.pathList(Net.UI.net.edges)
			}
			//Net.paths(Net.UI.startNode,Net.UI.endNode)
		}
		Net.UI.pathList=function(edjs){
			if(!Array.isArray(edjs)){ // make sure edjs is an Array
				edjs=Object.getOwnPropertyNames(edjs).map(function(Ind){return edjs[Ind]})
			}
			var div = document.getElementById('pathList')
			div.innerHTML=""
			var ol = document.createElement('ol')
			div.appendChild(ol)
			edjs.forEach(function(edj){
				var edli = document.createElement('li')
				edli.innerHTML=JSON.stringify(edj.FROM[0].properties.title)+' --('+JSON.stringify(edj.properties.value)+')--> '+JSON.stringify(edj.TO[0].properties.title)
				edli.style.fontFamily='courier'
				edli.style.color='navy'
				edli.style.fontSize="x-small"
				ol.appendChild(edli)
			})
			4
		}
		// select firs edge by default
		// startNodes[0].click();endNodes[0].click()
		// build the plot using http://bl.ocks.org/mbostock/1153292 as a starting point
		var n3Div = document.createElement('div')
		//div.appendChild(n3Div)
		adjTableDiv.appendChild(n3Div)
		n3Div.id='n3Div'
		Net.d3GraphLoad(n3Div)
		
		// CSS
		//$('circle').css({fill: '#ccc',stroke: '#333',strokeWidth: '1.5px'})
		//$('text').css ({font: '10px sans-serif',pointerEvents: 'none',textShadow: '0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff'})
	}
}

Net.d3GraphLoad=function(div,net){
	//laod https://d3js.org/d3.v3.min.js if not there already
	var d3GraphFun = function(div,net){
		if(typeof(d3)=='undefined'){
			$.getScript('d3.v3.min.js',function(){
				Net.d3Graph(div,net)
			})
		}else{
			Net.d3Graph(div,net)
		}
	}
	// check if jQuery is there first
	if(typeof(jQuery)=='undefined'){
		scrp = document.createElement('script')
		scrp.src='jquery-3.1.1.min.js'
		scrp.onload=function(){
			d3GraphFun(div,net)
		}
		document.head.appendChild(scrp)
	}else{
		d3GraphFun(div,net)
	}
		
}

Net.d3Graph= function(div,net){ // assemble d3 network on div
	net = net || Net.UI.net
		// taking clues from http://bl.ocks.org/mbostock/1153292
		var links = []
		var types ={}
		Object.getOwnPropertyNames(net.edges).forEach(function(edid){
			//console.log(net.edges[edid])
			var edj=net.edges[edid]
			var lnk = { // many later enable multiple source and target nodes
				source:(edj.FROM[0].properties.title || JSON.stringify(edj.FROM[0].properties,null,3)),
				target:(edj.TO[0].properties.title || JSON.stringify(edj.TO[0].properties,null,3)),
				type:edj.properties.value||JSON.stringify(edj.properties,null,3)
			}
			if(typeof(lnk.type)=='number'){
				lnk.type=lnk.type.toString()
			}
			types[lnk.type]=true
			links.push(lnk)	
		})
		types=Object.getOwnPropertyNames(types)
		var nodes = {}
		links.forEach(function(link) {
			link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
			link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
		});

		var width = 300, height = 300;

		var force = d3.layout.force()
			.nodes(d3.values(nodes))
			.links(links)
			.size([width, height])
			.linkDistance(60)
			.charge(-300)
			.on("tick", tick)
			.start();

		var svg = d3.select(div).append("svg")
			.attr("width", width)
			.attr("height", height);

		// Per-type markers, as they don't inherit styles.
		svg.append("defs").selectAll("marker")
			//.data(["suit", "licensing", "resolved"])
			.data(types)
			.enter().append("marker")
			.attr("id", function(d) { 
				return d; 
			 })
			.attr("viewBox", "0 -5 10 10")
			.attr("refX", 15)
			.attr("refY", -1.5)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
			.append("path")
			.attr("d", "M0,-5L10,0L0,5");


		var path = svg.append("g").selectAll("path")
			.data(force.links())
			.enter().append("path")
			.attr("class", function(d) { return "link " + d.type; })
			.attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
			.attr("fill","none")
			.attr("stroke","#666")
			.attr("strokeWidth","1.5px")

		var circle = svg.append("g").selectAll("circle")
			.data(force.nodes())
			.enter().append("circle")
			.attr("r", 4)
			.call(force.drag)
			.attr("fill","#ccc")
			.attr("stroke","#333")
			.attr("strokeWidth","1.5px")


		var text = svg.append("g").selectAll("text")
			.data(force.nodes())
			.enter().append("text")
			.attr("x", 8)
			.attr("y", ".31em")
			.text(function(d) { return d.name; })
			.attr("font","10px sans-serif")
			.attr("pointerEvents","none")
			.attr("textShadow","0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff")

		
		// if it was set as CSS, the styles would have been
		/*
		$(".link").css({
			fill: "none",
			stroke: "#666",
			"strokeWidth": "1.5px"
		})
		$('circle').css({
			fill: '#ccc',
			stroke: '#333',
			strokeWidth: '1.5px'
		})
		$('text').css ({
			font: '10px sans-serif',
			pointerEvents: 'none',
			textShadow: '0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff'
		})
		*/

		// Use elliptical arc path segments to doubly-encode directionality.
		function tick() {
		  path.attr("d", linkArc);
		  circle.attr("transform", transform);
		  text.attr("transform", transform);
		}

		function linkArc(d) {
		  var dx = d.target.x - d.source.x,
			  dy = d.target.y - d.source.y,
			  dr = Math.sqrt(dx * dx + dy * dy);
		  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
		}

		function transform(d) {
		  return "translate(" + d.x + "," + d.y + ")";
		}
	
}


// SANDBOX
/*
"USE" },
            { title: "EE" },
            { title: "BI" },
            { title: "FC" },
            { title: "SN" },
            { title: "PE"
*/


// define 2 nodes and 1 edge
y = new Node({name:'node y'})
x = new Node({name:'node x'})
f = new Edge({name:'edge f'})
//link them
x.edge(f).to(y)

// Wolfgang's mass example
wolfgang_N = [
    { title: "USE" },
    { title: "QU" },
    { title: "PU" },
    { title: "PEU" },
    { title: "ENJ" },
    { title: "BI" },
    { title: "JR" },
    { title: "PF" },
    { title: "BM" },
    { title: "SA" }       
];

wolfgang_M=[
	[-1, 	1.41,	1.73,	1.39,	1.49,	1.95,	1.48,	1.50,	1.44,	1.32],
	[1.53,	-1,		1.55,	1.39,	1.52,	1.62,	1.44,	1.44,	1.36,	1.32],
	[1.62, 	1.41,	-1	,	1.38,	1.55,	1.70,	1.48,	1.46,	1.42,	1.32],
	[1.4, 	1.36,	1.40,	-1	,	1.58,	1.45,	1.47,	1.47,	1.38,	1.30],
	[1.43, 	1.35,	1.48,	1.45,	-1	,	1.48,	1.48,	1.43,	1.38,	1.35],
	[1.72, 	1.39,	1.58,	1.39,	1.45,	-1	,	1.37,	1.49,	1.41,	1.32],
	[1.39, 	1.28,	1.33,	1.38,	1.41,	1.43,	-1	,	1.46,	1.43,	1.33],
	[1.41, 	1.29,	1.35,	1.38,	1.42,	1.46,	1.52,	-1	,	1.38,	1.33],
	[1.46, 	1.31,	1.42,	1.38,	1.46,	1.46,	1.55,	1.43,	-1	,	1.40],
	[1.42, 	1.30,	1.36,	1.40,	1.47,	1.43,	1.46,	1.49,	1.44,	-1],
]

//wolfNet = assembleFromAdjacency(wolfgang_M,wolfgang_N)
