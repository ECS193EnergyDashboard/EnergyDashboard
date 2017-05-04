gradient = function(points) {

    function lerp(a, b, t) {
        return Math.round((1 - t) * a + t * b);
    }
    
    function lerpRGB(c1, c2, t) {
        return { 
            r: lerp(c1.r, c2.r, t), 
            g: lerp(c1.g, c2.g, t),
            b: lerp(c1.b, c2.b, t)
        };
    }

    function g(value) {
        points.sort(function(a, b) {
            return a.value - b.value;
        })

        if (value <= points[0].value) { 
            return points[0].color;
        }
        if (value >= points[points.length - 1].value) {
            return points[points.length - 1].color;
        }

        var start = undefined;
        for (var i = 0; i < points.length; i++) {
            if (value < points[i].value) {
                start = i - 1;
                break;
            }
        }

        if (start === undefined) {
            // Should never happen
            return { r: 0, g: 0, b: 0 };
        }

        var end = start + 1;

        var min = points[start].value;
        var max = points[end].value;

        var t = (value - min) / (max - min)

        return lerpRGB(points[start].color, points[end].color, t);
    }

    return g;
}