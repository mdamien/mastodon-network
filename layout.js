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

function hashCode(s) {
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

function clusters_getClass(node_id) {
    var server = node_id.split('@')[2];
    var code = Math.abs(hashCode(server));
    return code
}

function indegree(node_id) {
    var count = 0
    graph.forEachLinkedNode(node_id,
        function(linkedNode, link) {
            count += 1;
        }
    );
    return count;
}

function get_link(node_id) {
    var server = node_id.split('@')[2];
    var user = node_id.split('@')[1];
    return "https://"+server+"/users/"+user+"/"
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
            link: get_link(node.id),
        },
        color: "rgb("
            + Math.max(150 - indegree(node.id), 0)
            + ","
            + Math.max(150 - indegree(node.id), 0)
            + ","
            + Math.max(150 - indegree(node.id), 0)
            + ")",
        size: 1 + Math.log(indegree(node.id)+1)/2,
    };
  },
  link => {
    return {
        source: link.fromId,
        target: link.toId,
        id: link.fromId+';'+link.toId,
        attributes: {},
        color: "rgba("
            + Math.max(150 - indegree(link.fromId), 0)
            + ","
            + Math.max(150 - indegree(link.fromId), 0)
            + ","
            + Math.max(150 - indegree(link.fromId), 0)
            + ","
            + 0.1
            + ")",
        size: 1,
        };
  });

fs.writeFileSync('demo/data.json', json);