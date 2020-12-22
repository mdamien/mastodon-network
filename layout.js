var graph = require('ngraph.graph')();


const fs = require('fs');
const file = fs.readFileSync(process.argv[2], 'utf-8');
const data = file.split('\n');
var edges = {}
data.forEach(function (line) {
    if (!line.trim()) return
    const [src, dst] = line.trim().split(';');
    if (!graph.hasLink(src, dst)) {
        graph.addLink(src, dst);
    }
});

var createLayout = require('ngraph.forcelayout');
var layout = createLayout(graph);
var ITERATIONS_COUNT = 1000;
for (var i = 0; i < ITERATIONS_COUNT; ++i) {
  console.log('step', i)
  layout.step();
}

var detectClusters = require('ngraph.louvain');
var clusters = detectClusters(graph);

var toJSON = require('ngraph.tojson');

hashCode = function(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}
function clusters_getClass(node_id) {
    var server = node_id.split('@')[2];
    var code = Math.abs(hashCode(server));
    return code
}


var PALETTES = [[230,184,179],
[168,219,229],
[212,217,182],
[195,188,222],
[156,196,177]]

var json = toJSON(graph,
  node => {
    return {
        label: node.id,
        id: node.id,
        x: layout.getNodePosition(node.id).x,
        y: layout.getNodePosition(node.id).y,
        attributes: {
            cluster: clusters_getClass(node.id),
        },
        color: "rgb("
            + PALETTES[clusters_getClass(node.id) % PALETTES.length][0]
            + ","
            + PALETTES[clusters_getClass(node.id) % PALETTES.length][1]
            + ","
            + PALETTES[clusters_getClass(node.id) % PALETTES.length][2]
            + ")",
        size: 1,
    };
  },
  link => {
    return {
        source: link.fromId,
        target: link.toId,
        id: link.fromId+';'+link.toId,
        attributes: {},
        color: "rgba("
            + PALETTES[clusters_getClass(link.fromId) % PALETTES.length][0]
            + ","
            + PALETTES[clusters_getClass(link.fromId) % PALETTES.length][1]
            + ","
            + PALETTES[clusters_getClass(link.fromId) % PALETTES.length][2]
            + ","
            + "50"
            + ")",
        size: 1,
        };
  });

fs.writeFileSync('demo/data.json', json);