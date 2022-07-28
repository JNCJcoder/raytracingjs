const Vector3 = require('./Vector3');
const Sphere = require('./Objects/Sphere');

/** @type {HTMLCanvasElement} */
const canvas    = document.getElementById('canvas');
const context   = canvas.getContext("2d");

const WIDTH             = canvas.width  || 640;
const HEIGHT            = canvas.height || 480;
const FOV               = 40;
const INVERSE_WIDTH     = 1 / WIDTH;
const INVERSE_HEIGHT    = 1 / HEIGHT;
const ASPECT_RATIO      = WIDTH / HEIGHT;
const ANGLE             = Math.tan(Math.PI * 0.5 * FOV / 180);
const MAX_RAY_DEPTH     = 2;
const MIN_RAY_DEPTH     = 0;
const COLOR_DEPTH       = 4;
const INFINITY          = 1e8;
const BIAS              = 1e-4;
const ALPHA             = (255 << 24);

/**
 * Object List
 * @type {Sphere[]}
 */
let objects = [];

const backgroundColor = new Vector3(2.0, 2.0, 2.0);

/**
 * Mix
 * @param {Number} a 
 * @param {Number} b 
 * @param {Number} c 
 * @returns {Number}
 */
const mix = (a, b, c) => b * c + a * (1 - c); 

/**
 * Trace
 * @param {Vector3} rayOrigin 
 * @param {Vector3} rayDirection 
 * @param {Number} depth 
 * @returns {Vector3}
 */
function trace(rayOrigin, rayDirection, depth)
{
    let tnear = INFINITY;
    let element = null;

    let rayInfo = { t0: INFINITY, t1: INFINITY };

    for (const object of objects)
    {
        rayInfo.t0 = INFINITY;
        rayInfo.t1 = INFINITY;

        if(object.intersect(rayOrigin, rayDirection, rayInfo))
        {
            if(rayInfo.t0 < 0)
            {
                rayInfo.t0 = rayInfo.t1;
            }

            if(rayInfo.t0 < tnear)
            {
                tnear = rayInfo.t0;
                element = object;
            }
        }
    }

    if(element == null) return backgroundColor;

    const surfaceColor = new Vector3(0, 0, 0);
    const intersectionPoint = rayOrigin.clone().add(rayDirection.clone().multiply(tnear));
    const intersectionNormal = element.getNormal(intersectionPoint);

    let inside = false;
    if(rayDirection.dot(intersectionNormal) > 0)
    {
        intersectionNormal.negativeSign();
        inside = true;
    }

    const material = element.getMaterial();

    if ((material.transparency > 0 || material.reflection > 0) && depth < MAX_RAY_DEPTH)
    {
        const rayDirectionDotIntersectionNormal = rayDirection.dot(intersectionNormal);
        const facingRatio = -rayDirectionDotIntersectionNormal;
        const fresnelEffect = mix(Math.pow(1 - facingRatio, 3), 1, 0.1);

        const reflectionDirection = rayDirection.clone()
            .subtract(intersectionNormal.clone().multiply(2).multiply(rayDirectionDotIntersectionNormal))
            .normalize();

        const reflection = trace(
            intersectionNormal.clone().multiply(BIAS).add(intersectionPoint),
            reflectionDirection,
            depth + 1
        );

        let refraction = new Vector3(0, 0, 0);

        if(material.transparency)
        {
            const ior = 1.1;
            const eta = (inside) ? ior : 1 / ior;
            const cosi = -intersectionNormal.dot(rayDirection)
            const k = 1 - eta * eta * (1 - cosi * cosi);

            const refractionDirection = new Vector3(0, 0, 0);
            reflectionDirection.set(
                rayDirection.x * eta + intersectionNormal.x * (eta * cosi - Math.sqrt(k)),
                rayDirection.y * eta + intersectionNormal.y * (eta * cosi - Math.sqrt(k)),
                rayDirection.z * eta + intersectionNormal.z * (eta * cosi - Math.sqrt(k))
            );
            refractionDirection.normalize();

            refraction = trace(
                intersectionNormal.clone().multiply(BIAS).subtract(intersectionPoint),
                refractionDirection,
                depth + 1
            );
        }

        surfaceColor.set(
            (reflection.x * fresnelEffect + refraction.x * (1 - fresnelEffect) * material.transparency) * material.surfaceColor.x,
            (reflection.y * fresnelEffect + refraction.y * (1 - fresnelEffect) * material.transparency) * material.surfaceColor.y,
            (reflection.z * fresnelEffect + refraction.z * (1 - fresnelEffect) * material.transparency) * material.surfaceColor.z
        )

        surfaceColor.add(material.emissionColor);
        return surfaceColor;
    }

    for (const object of objects)
    {
        const lightMaterial = object.getMaterial();

        if(lightMaterial.emissionColor.x > 0  || lightMaterial.emissionColor.y > 0 || lightMaterial.emissionColor.z > 0)
        {
            const transmission = new Vector3(1, 1, 1);
            const lightDirection = object.center.clone().subtract(intersectionPoint);
            lightDirection.normalize();

            const lightInfo = { t0:INFINITY, t1:INFINITY };
            for (const objectTwo of objects)
            {
                if(object == objectTwo) continue;

                if(objectTwo.intersect(intersectionPoint.clone().add(intersectionNormal.clone().multiply(BIAS)), lightDirection, lightInfo))
                {
                    transmission.set(0, 0, 0);
                    break;
                }
            }

            const lightRatio = Math.max(0, intersectionNormal.dot(lightDirection));
            surfaceColor.add(material.surfaceColor.clone().product(transmission).product(lightMaterial.emissionColor.clone().multiply(lightRatio)));
        }
    }

    surfaceColor.add(material.emissionColor);
    return surfaceColor;
}

function render()
{
    const buffer = new ArrayBuffer(WIDTH * HEIGHT * COLOR_DEPTH);
    const bufferView = new Uint32Array(buffer);
    const rayOrigin = new Vector3(0, 0, 0); // 0, 10, 50

    let absoluteIndex = 0;
    for (let y = 0; y < HEIGHT; y++)
    {
        for (let x = 0; x < WIDTH; x++, absoluteIndex++)
        {
            const xx = (2 * ((x + 0.5) * INVERSE_WIDTH) - 1) * ANGLE * ASPECT_RATIO
            const yy = (1 - 2 * ((y + 0.5) * INVERSE_HEIGHT)) * ANGLE;
            const zz = -1;
            const rayDirection = new Vector3(xx, yy, zz);
            rayDirection.normalize();

            const pixel = trace(rayOrigin, rayDirection, MIN_RAY_DEPTH);

            const R = Math.round(Math.min(1, pixel.x) * 255);
            const G = Math.round(Math.min(1, pixel.y) * 255) << 8;
            const B = Math.round(Math.min(1, pixel.z) * 255) << 16;

            bufferView[absoluteIndex] = ALPHA | B | G | R;
        }
    }

    return new Uint8ClampedArray(buffer);
}

function init()
{
    objects.push(new Sphere(
        new Vector3(0.0, -10004, -20),
        10000,
        new Vector3(0.20, 0.20, 0.20),
        0,
        0.0,
        new Vector3(0, 0, 0)
    ));

    objects.push(new Sphere(
        new Vector3(-1.0, 0, -60),
        4,
        new Vector3(2.00, 0.30, 0.34),
        1,
        0.9,
        new Vector3(0, 0, 0)
    ));

    objects.push(new Sphere(
        new Vector3(5.0, -1, -15),
        2,
        new Vector3(0.90, 0.76, 0.46),
        1,
        0.0,
        new Vector3(0, 0, 0)
    ));

    objects.push(new Sphere(
        new Vector3(5.0, 0, -35),
        3,
        new Vector3(0.65, 0.77, 0.97),
        1,
        0.0,
        new Vector3(0, 0, 0)
    ));

    objects.push(new Sphere(
        new Vector3(-5.5, 0, -25),
        3,
        new Vector3(1.40, 0.00, 2.55), // 0.90
        1,
        0.0,
        new Vector3(0, 0, 0)
    ));

    objects.push(new Sphere(
        new Vector3(0.0, 20, -30),
        3,
        new Vector3(0.00, 0.00, 0.00),
        0,
        0.0,
        new Vector3(3, 3, 3)
    ));

    const buffer = render();

    const canvasBuffer = context.getImageData(0, 0, WIDTH, HEIGHT);
    canvasBuffer.data.set(buffer);
    context.putImageData(canvasBuffer, 0, 0);
}

init();