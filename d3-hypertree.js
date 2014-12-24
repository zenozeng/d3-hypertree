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

    // init target
    var $svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

    // init force
    var force = d3.layout.force()
            .charge(-1000)
            .linkDistance(50)
            .linkStrength(function(link) {
                if(link.target.focused) {
                    return 0.5;
                } else {
                    return 10;
                }
            })
            .size([width, height])
            .nodes(nodes)
            .links(links)
            .start();

    // init links
    var $links = $svg.selectAll('.hypertree-link')
            .data(links)
            .enter()
            .append('path')
            // .style('fill', '#000')
            .style('fill', 'none')
            .style('stroke-width', '3')
            .style('stroke', 'rgba(0, 0, 0, .7)')
            .attr('class', 'hypertree-link');

    // init nodes
    var $nodes = $svg.selectAll('.hypertree-node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'hypertree-node')
            .call(force.drag);

    var r = 10;

    $nodes.append('circle')
        .attr('r', r)
        .style('fill', function(d) {
            return 'rgba(0, 0, 0)';
        });

    $nodes.append('text')
        .style('fill', 'rgba(0, 100, 200, .5)')
        .style('stroke-width', '0')
        .style('font-size', '12px')
        .text(function(d) {
            return d.name.substring(0, 8) + '...';
        });

    var focus = function($elem) {
        $elem.classed('focused', true);

        // highlight it
        $elem.select('circle').transition().attr('r', 2 * r);
        $elem.style('fill', 'red');

        // move to center
        var center = {x: width / 2, y: height / 2};
        $elem.select('circle').attr('dx', center.x).attr('dy', center.y);
    };

    var unfocus = function($elem) {
        $elem.classed('focused', false);
        $elem.select('circle').transition().attr('r', r);
        $elem.style('fill', 'black');
    };

    $nodes.selectAll('circle').on("click", function(d) {
        nodes.forEach(function(d) {
            d.focused = false;
        });
        d.focused = true;


        unfocus($svg.selectAll('.focused'));

        focus(d3.select(this.parentElement));
        force.start(); // restart focus layout
    });

    // force on tick
    force.on('tick', function() {
        $links.attr('d', function(d) {
            var path = "M" + d.source.x + "," + d.source.y; // move to source
            // 控制点在垂直中线上方 5px 处
            var dx = d.target.x - d.source.x;
            var dy = d.target.y - d.source.y;
            var angle = Math.atan(dx, dy);
            var control = {
                x: (d.source.x + d.target.x) / 2 + 10,
                y: (d.source.y + d.target.y) / 2 + 10
            };
            path += "Q" + control.x + ' ' + control.y + "," + d.target.x + ' ' + d.target.y; // curve
            return path;
        })
            .style('stroke', function(d) {
                return d.target.focused ? '#000' : '#ccc';
            });
        $links.attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        $nodes.select('circle')
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; })
            .style('fill', function(d) {
                var shouldHighlight = d.focused;
                links.filter(function(link) {
                    return link.source === d;
                }).forEach(function(link) {
                    if(link.target.focused) {
                        shouldHighlight = true;
                    }
                });
                return shouldHighlight ? '#000' : '#ccc';
            });

        $nodes.select('text')
            .attr('x', function(d) { return d.x + r * 1.2; })
            .attr('y', function(d) { return d.y + r * 0.5; });
    });

    // click root
    var e = document.createEvent('UIEvent');
    e.initUIEvent('click', true, true);
    var root = document.querySelector('.hypertree-node circle');
    root.dispatchEvent(e);
};


