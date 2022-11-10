class Vector3
{
    /**
     * Create a Vector3D.
     * @param {number?} x - The x value.
     * @param {number?} y - The y value.
     * @param {number?} z - The z value.
     */
    constructor(x = 0, y = 0, z = 0)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Set X, Y and Z
     * @param {number} x - The x value.
     * @param {number} y - The y value.
     * @param {number} z - The z value.
     */
    set(x, y, z)
    {
        this.x = x || this.x;
        this.y = y || this.y;
        this.z = z || this.z;
        
        return this;
    }
    
    /** 
     * Add
     * @param {Vector3} otherVector
    */
    add(otherVector)
    {
        this.x += otherVector.x;
        this.y += otherVector.y;
        this.z += otherVector.z;
        
        return this;
    }
    
    /** 
     * Subtract
     * @param {Vector3} otherVector
    */
    subtract(otherVector)
    {
        this.x -= otherVector.x;
        this.y -= otherVector.y;
        this.z -= otherVector.z;

        return this;
    }

    /** 
     * Multiply
     * @param {Number} scalarValue
    */
    multiply(scalarValue)
    {
        this.x *= scalarValue;
        this.y *= scalarValue;
        this.z *= scalarValue;

        return this;
    }
    
    /**
     * Returns a new vector3 with the same X, Y and Z.
     * @return {Vector3} Return Vector3
     */
    clone()
    {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Returns Vector Length Square.
     * @return {Number} Return Length
     */
    lengthSquare()
    {
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
    }

    /**
     * Returns Vector Length.
     * @return {Number} Return Length
     */
    length()
    {
        const vectorLength = this.lengthSquare();

        return Math.sqrt(vectorLength);
    }

    /**
     * Normalize Vector
     */
    normalize()
    {
        const vectorLength = this.lengthSquare();
    
        if(vectorLength > 0)
        {
            const inverseLength = 1 / Math.sqrt(vectorLength);
            this.x *= inverseLength;
            this.y *= inverseLength;
            this.z *= inverseLength;
        }

        return this;
    }

    /**
     * Dot
     * @param {Vector3} otherVector
     * @return {Number}
     */
    dot(otherVector)
    {
        const x = this.x * otherVector.x;
        const y = this.y * otherVector.y;
        const z = this.z * otherVector.z;
        
        return x + y + z;
    }

    /** 
     * Product
     * @param {Vector3} otherVector
    */
    product(otherVector)
    {
        this.x *= otherVector.x;
        this.y *= otherVector.y;
        this.z *= otherVector.z;
        
        return this;
    }

    /**
     * Negative Sign
     */
    negativeSign()
    {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        
        return this;
    }
}

module.exports = Vector3;