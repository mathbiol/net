console.log('net.js loaded')

Net = function(){
    var d = (new Date).toJSON()
    this.id=d+'_Net_'+Math.random().toString().slice(2)
    //this.type=this.constructor.name
    this.log=[{created:d}]
    this.nodes={}
    this.edges={}
}

net=new Net  // default net, will be used if none is declared

Node = function(p,nt){ // note second input argument is the net, or nets, this is being registered to
    nt = nt || net
    var d = (new Date).toJSON()
    this.id=d+'_Node_'+Math.random().toString().slice(2)
    this.type=this.constructor.name
    if(!p){p={}}
    this.properties=p
    this.log=[{created:d}]
    this.EDGESto=[]
    this.EDGESfrom=[]
    this.edge=function(edg){
        this.EDGESto.push(edg)
        edg.lastParent=this
        return edg
    }
    nt.nodes[this.id]=this   
}

Edge = function(p,nt){
    //if(!nt){nt=[net]}
    nt = nt || net
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
        nd.EDGESfrom.push(this)      
        return nd
    }
    nt.edges[this.id]=this
}

// Net fun

Net.segment=function(M,t){ // segments matrix M with value t
    return M.map(function(r){ // row
        return r.map(function(c){ // cell
    return c>=t
        })
    })
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
	h +='<div>Adjacency Matrix: <div><textarea id="adjTxt" style="width:200;height:200"></textarea></div><span id="demo" style="color:blue;cursor:pointer">demo</span> <button id="assembleNet">Assemble network</button></div>'
	h +='<div id="adjTableDiv">...</div>'
	div.innerHTML=h
	// text area for matrix input
	demo.onclick=function(){
		adjTxt.textContent = 'USE,0,0,0,0,0,0\nEE,0,0,1,0,0,0\nBI,1,0,0,0,0,0\nFC,1,0,0,0,0,0\nSN,0,0,1,0,0,0\nPE,0,0,1,0,0,0'
	}
	assembleNet.onclick=function(){
		if(adjTxt.textContent.length==0){
			demo.style.color='red'
			demo.click()
			setTimeout(function(){
				demo.style.color='blue'
			},1000)
		}
		var txt = adjTxt.textContent
		var parms = []
		var vals=[]
		txt.split(/[\n\r]+/).forEach(function(r,i){
			var cc = r.split(/[\s,]+/)
			parms[i]={title:cc[0]}
			vals[i]=cc.slice(1).map(function(c){return +c})
		})
		// assemble table
		adjTableDiv.innerHTML=''
		var tb = document.createElement('table')
		adjTableDiv.appendChild(tb)
		var tr = document.createElement('tr') // header row
		tb.appendChild(tr)
		var r = ['[from/to]'].concat(parms.map(function(x){return x.title}))
		r.forEach(function(h){
			var th = document.createElement('th')
			th.textContent=h
			tr.appendChild(th)
		})
		vals.forEach(function(r,i){
			var tr = document.createElement('tr')
			tb.appendChild(tr)
			var th = document.createElement('th')
			tr.appendChild(th)
			th.textContent=parms[i].title
			r.forEach(function(v){
				var td = document.createElement('td')
				tr.appendChild(td)
				td.textContent=v
			})
		})
		


		4
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
