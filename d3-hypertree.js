window.render = function(options) {
    "use strict";

    // import d3
    var d3 = window.d3;

    // init options
    var width = options.width,
        height = options.height,
        container = options.container,
        data = options.data;

    // convert data to nodes and links
    var nodes = [],
        links = [];
    var parseNode = function(node) {
        nodes.push(node);
        if(node.children) {
            node.children.forEach(function(child) {
                links.push({source: child, target: node});
                parseNode(child);
            });
        }
    };
    parseNode(data); // note that data must starts with single root node
    links = links.map(function(link) {
        link.source = nodes.indexOf(link.source);
        link.target = nodes.indexOf(link.target);
        return link;
    });

    // init target
    var svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

    // init force
    var force = d3.layout.force()
            .charge(-1000)
            .linkDistance(100)
            .size([width, height])
            .nodes(nodes)
            .links(links)
            .start();

    // init links
    var $links = svg.selectAll('.hypertree-link')
            .data(links)
            .enter()
            .append('line')
            .attr('class', 'hypertree-link');

    // init nodes
    var $nodes = svg.selectAll('.hypertree-node')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('class', 'hypertree-node')
            .attr('r', 10)
            .style('fill', function(d) {
                return 'rgba(0, 0, 0, .5)';
            })
            .call(force.drag);

    $nodes.append('text').text(function(d) {
        return d.name;
    });

    // force on tick
    force.on('tick', function() {
        $links.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        $nodes.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });
};


