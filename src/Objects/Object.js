const Vector3 = require('../Vector3');

class Object
{
    /**
     * Object Constructor
     * @param {Vector3} surfaceColor 
     * @param {Number} reflection 
     * @param {Number} transparency 
     * @param {Vector3} emissionColor 
     */
    constructor(surfaceColor, reflection, transparency, emissionColor)
    {
        this.surfaceColor   = surfaceColor;
        this.emissionColor  = emissionColor;
        this.transparency   = transparency;
        this.reflection     = reflection;
    }

    /**
     * Intersect
     * @param {Vector3} rayOrigin 
     * @param {Vector3} rayDirection 
     * @param {object} result 
     * @returns {Boolean}
     */
    intersect(rayOrigin, rayDirection, result)
    {
        return false;
    }

    getMaterial()
    {
        return {
            surfaceColor:   this.surfaceColor,
            emissionColor:  this.emissionColor,
            transparency:   this.transparency,
            reflection:     this.reflection
        };
    }
}

module.exports = Object;