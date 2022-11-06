const Vector3 = require("../Vector3");
const Object = require("./Object");

class Sphere extends Object
{
    /**
     * Sphere Constructor
     * @param {Vector3} center 
     * @param {Number} radius 
     * @param {Vector3} surfaceColor 
     * @param {Number} reflection 
     * @param {Number} transparency 
     * @param {Vector3} emissionColor 
     */
    constructor(center, radius, surfaceColor, reflection, transparency, emissionColor)
    {
        super(surfaceColor, reflection, transparency, emissionColor)
        
        this.center     = center;
        this.radius     = radius;
        this.radius2    = radius * radius;
    }

    /**
     * Sphere Intersect
     * @param {Vector3} rayOrigin 
     * @param {Vector3} rayDirection 
     * @param {object} result 
     * @returns {Boolean}
     */
    intersect(rayOrigin, rayDirection, result)
    {
        const length = rayOrigin.clone().subtract(this.center);

        const a = rayDirection.dot(rayDirection);
        const b = 2 * rayDirection.dot(length);
        const c = length.dot(length) - this.radius2;
        if (!this.solveQuadratic(a, b, c, result)) return false; 

        if(result.t0 > result.t1)
        {
            [result.t0, result.t1] = [result.t1, result.t0]
        }

        if(result.t0 < 0)
        {
            result.t0 = result.t1;
        }

        return result.t0 >= 0;
    }

    solveQuadratic(a, b, c, result)
    {
        const discriminant =  b * b - 4 * a * c;

        if (discriminant < 0) return false;
        else if (discriminant == 0)
        { 
            result.t0 = -0.5 * b / a;
            result.t1 = result.t0;
        }
        else
        {
            const q = (b > 0) ? -0.5 * (b + Math.sqrt(discriminant)) : -0.5 * (b - Math.sqrt(discriminant));

            result.t0 = q / a; 
            result.t1 = c / q; 
        }

        return true;
    }

    /**
     * Get Normal
     * @param {Vector3} point 
     * @returns {Vector3}
     */
    getNormal(otherVector)
    {
        const normal = otherVector.clone().subtract(this.center);
        normal.normalize();

        return normal;
    }
}

module.exports = Sphere;