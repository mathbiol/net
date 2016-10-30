console.log('net.js loaded')

Net = function(){
    var d = (new Date).toJSON()
    this.id=d+'_Net_'+Math.random().toString().slice(2)
    this.type=this.constructor.name
    this.log=[{created:d}]
    this.nodes={}
    this.edges={}
}

net=new Net  // default net, will be used if none is declared

Node = function(p,nt){ // note second input argument is the net, or nets, this is being registered to
    if(!nt){nt=[net]}
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
    for(var i=0;i<nt.length;i++){
        nt[i].nodes[this.id]=this
    }    
}

Edge = function(p,nt){
    if(!nt){nt=[net]}
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
    for(var i=0;i<nt.length;i++){
        nt[i].edges[this.id]=this
    }
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

Net.assembleFromAdjacency=function(M,N,gf){ // assemble net using adjacency matrix M, vector of nodes N, and graph gf
    // default obj for nodes includes {title:"node i"} where i is the node index
    N = N || M.map(function(m,i){ 
    	return {title:'node '+(i+1)}
    })
    N = N.map(function(n){ // if each note is the note title then say so
    	if(typeof(n)=='string'){n = {title:n}}
    	return n
    })
    //console.log(N)
    // default net if needed
    if(!gf){
    	gf=[new Net] // default is net with single graph
    }else{
    	gf=[gf]
    }
    
    gf[0].adjacencyMatrix = M
    // check dimensions
    if((M.length!==N.length)||(M[0].length!==N.length)){
    	throw 'dimensions of adjancency matrix and list of nodes did not match'
    }
    // create nodes
    N = N.map(function(n){
    	return new Node(n,gf) // node added to gf
    })
    // create edges
    M.forEach(function(r,i){
    	r.forEach(function(c,j){
    		if(c){
    			if(typeof(c)!=='object'){c={value:c}} // if c is a value return it as a {value:<val>} object
    			var ej = new Edge(c,gf)
    			N[i].edge(ej).to(N[j])
    		}
    	})
    })
    //
    return gf[0]   
}

Net.UI=function(div){
	console.log(div)
	4
}



// SANDBOX

///*

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
//*/