gradient = function(points) {

    function lerp(a, b, ratio) {
        return Math.round((1 - ratio) * a + ratio * b);
    }

    function lerpRGB(c1, c2, ratio) {
        return {
            r: lerp(c1.r, c2.r, ratio),
            g: lerp(c1.g, c2.g, ratio),
            b: lerp(c1.b, c2.b, ratio)
        };
    }

    // Find the range in which x falls in (0...0.5...1)
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

    /**
    * Returns the color
    * @param  value : must be relative to vals in points
    * @return resulting color
    */
    function g(value) {
        var values = points.map(function(p) { return p.value; });
        var bucket = findBucket(values, value);

        if (bucket[0] === undefined) { // Value is smaller than min value
            return points[bucket[1]].color;
        }
        if (bucket[1] === undefined) { // Value is greater than min value
            return points[bucket[0]].color;
        }

        var bucketMin = points[bucket[0]];
        var bucketMax = points[bucket[1]];

        var ratio = (value - bucketMin.value) / (bucketMax.value - bucketMin.value)

        return lerpRGB(bucketMin.color, bucketMax.color, ratio);
    }

    return g;
}
