gradient = function(minValue, minColor, maxValue, maxColor, midColor) {

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
        if (value <= minValue) {
            return minColor;
        }
        if (value >= maxValue) {
            return maxColor
        }
        var midValue = (minValue + maxValue) / 2;

        var min = minValue, max = maxValue;
        var cMin = minColor, cMax = maxColor;
        if (value <= midValue) {
            max = midValue;
            cMax = midColor;
        } else {
            min = midValue;
            cMin = midColor;
        }

        var t = (value - min) / (max - min)

        return lerpRGB(cMin, cMax, t);
    }

    return g;
}