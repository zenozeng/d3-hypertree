d3.json('fs.json', function(err, data) {
    var options = {
        data: data,
        width: 900,
        height: 600,
        container: '#page-main'
    };
    window.render(options);
});
