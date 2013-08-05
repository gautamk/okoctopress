(function($) {

    var $canvas, canvas, w, h, brush, palette, timerID;

    /* We model a rotating palette with the Palette object.
     */
    var Palette = function(colours) {
        var colours = colours
          , index = -1
          , len = colours.length;

        this.next = function() {
            index = (index + 1) % len;
            return colours[index];
        };
    };

    /* We encapsulate all the painting behaviour into a nice Brush object
     */
    var Brush = function(canvas) {

        var ctx = canvas.getContext('2d')
          , painting = false
          , points = []
          , maxPoints = 1000
          , previous = {};

        var stroke = function(x1, y1, x2, y2) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        };

        var dist = function(x1, y1, x2, y2) {
            return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
        };

        this.strokeTo = function(x, y) {
            var pl = points.length
              , i, p, d;

            // We go through all the points in the cache and check to
            // see if we are close enough to draw a line to them.
            for (i = 0; i < pl; i += 1) {
                p = points[i];
                d = dist(x, y, p.x, p.y);
                if (d < 1400) {
                    stroke(x, y, p.x, p.y);
                    // Add a white pseudo-shadow next to the line - gives
                    // a cool effect.
                    ctx.save();
                    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                    stroke(x-1, y-1, p.x-1, p.y-1);
                    ctx.restore();
                }
            }

            previous = {x: x, y: y};

            // The points cache is LRU so we delete the oldest point.
            if (points[maxPoints] != null) { points.shift(); };
            points.push(previous);

            return this;
        };

        this.painting = function(value) {
            if (value != null) painting = value;
            return painting;
        };

        this.pos = function(x, y) {
            previous = {x: x, y: y};
            return this;
        };

        this.colour = function(style) {
            ctx.strokeStyle = style;
            return this;
        };

    };

    /* Initialize all variables.
     */
    h = $(document).height()
    w = $(document).width()

    $canvas = $('#canvas')

    canvas = $canvas[0];
    canvas.height = h;
    canvas.width = w;

    palette = new Palette([
        'rgba(199, 82, 51, 0.3)',
        'rgba(199, 137, 51, 0.3)',
        'rgba(214, 206, 170, 0.3)',
        'rgba(121, 181, 172, 0.3)',
        'rgba(94, 47, 70, 0.3)'
    ]);

    brush = new Brush(canvas);
    brush.colour(palette.next()).painting(true);

    /* Add listeners on the canvas to draw things.
     */
    $canvas.on('mousemove', function(e) {
        var x = e.pageX
          , y = e.pageY;
        if (brush.painting()) brush.strokeTo(x, y);
    });

    // Change the brush colour every second.
    window.setInterval(function() {
        brush.colour(palette.next());
    }, 1000);

}(jQuery));