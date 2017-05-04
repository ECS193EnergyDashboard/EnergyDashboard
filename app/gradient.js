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

    function findBucket(values, x) {
        var dists = values.map(function(v) { 
            return v - x;
        });
        var max = -Infinity, min = Infinity;
        var start, end;
        dists.forEach(function(d, i) {
            if (d >= 0) {
                if (d < min) {
                    min = d;
                    end = i;
                }
            } else {
                if (d > max) {
                    max = d;
                    start = i;
                }
            }
        });
        return [ start, end ];
    }

    function g(value) {
        var values = points.map(function(p) { return p.value; });
        var bucket = findBucket(values, value);

        if (bucket[0] === undefined) { // Value is smaller than min value
            return points[bucket[1]].color;
        }
        if (bucket[1] === undefined) { // Value is greater than min value
            return points[bucket[0]].color;
        }

        var min = points[bucket[0]];
        var max = points[bucket[1]];

        var t = (value - min.value) / (max.value - min.value)

        return lerpRGB(min.color, max.color, t);
    }

    return g;
}