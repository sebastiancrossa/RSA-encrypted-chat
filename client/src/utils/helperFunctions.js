const getBytesFromString = (str) => {
    var bytesArr = [];

    for (var i = 0; i < str.length; ++i) {
        var curr = str.charCodeAt(i);
        bytesArr = [...bytesArr, curr]
    }

    return bytesArr;
}

// Sieve of Eratosthenes
// Genera todos los números primeros de cierto rango y regresa uno de forma aleatoria
// https://stackoverflow.com/questions/61700358/generating-random-prime-number
const getPrimes = (min, max) => {
    const result = Array(max + 1)
    .fill(0)
    .map((_, i) => i);

    for (let i = 2; i <= Math.sqrt(max + 1); i++) {
        for (let j = i ** 2; j < max + 1; j += i) delete result[j];
    }

    return Object.values(result.slice(min));
};

const getRandNum = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandPrime = (min, max) => {
    const primes = getPrimes(min, max);
    return primes[getRandNum(0, primes.length - 1)];
};

export const gcd = function(a, b) {
    if (!b) {
        return a;
    }

    return gcd(b, a % b);
}

export const getE = (phi) => {
    let e = 2;

    while (e < phi-1) {
        let res = gcd(e, phi);

        if (res === 1) return e;
        e+=1;
    }

    return -1;
}

// http://umaranis.com/2018/07/12/calculate-modular-exponentiation-powermod-in-javascript-ap-n/
export function powerMod(base, exponent, modulus) {
    if (modulus === 1) return 0;

    var result = 1;
    base = base % modulus;

    while (exponent > 0) {
        if (exponent % 2 === 1)  //odd number
            result = (result * base) % modulus;
        exponent = exponent >> 1; //divide by 2
        base = (base * base) % modulus;
    }

    return result;
}

export const generatePrivateKey = (phi, e) => {
    let i = 0;
    let clavePrivada;

    while (i <= 10) {
        let x = 1 + (i * phi);

        if (x % e === 0) {
        clavePrivada = x / e;
        break;
        }

        i += 1;
    }

    return clavePrivada;
}

export const encrypt = (msgStr, e, n) => {
    let bytesArr = getBytesFromString(msgStr);

    for (let i = 0; i < bytesArr.length; i++){
        bytesArr[i] = powerMod(bytesArr[i], e, n)
    }

    return bytesArr;
}

export const decrypt = (encryptedArr, clavePrivada, n) => {
    let decryptedBytesArr = [...encryptedArr];

    for (let i = 0; i < decryptedBytesArr.length; i++) {
        decryptedBytesArr[i] = powerMod(decryptedBytesArr[i], clavePrivada, n)
    }

    return decryptedBytesArr;
}