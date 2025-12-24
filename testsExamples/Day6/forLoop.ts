// For Loop is typically used when the number of iterations is known beforehand.
/*
Der eigentliche Unterschied

for → zählerbasierte Iteration, kompakt und übersichtlich

while → bedingungsbasierte Iteration, flexibler, wird genutzt wenn man nicht zwingend mit einem Zähler arbeitet
*/
for (let i: number = 0; i < 5; i++) {
    console.log(`Iteration number: ${i}`);
}



// Example of using a for loop to iterate over an array
const fruits: string[] = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];


for (let j: number = 0; j < fruits.length; j++) {
    console.log(`Fruit at index ${j}: ${fruits[j]}`);// output each fruit with its index
}

// Example 2: print even numbers from 1 to 10 using a for loop
for (let k: number = 1; k <= 10; k++) {
    if (k % 2 == 0) {
        console.log(`Even number: ${k}`);

    }

}  
 // example 4:
 
let x: number; // i is declared outside the loop// accessible after the loop//Global scope
for (x = 0; x < 10; x++) {
    console.log(x); //1...9 --> 10 
    // i= 10 stop not printed
}

console.log(x); // i is accessible here and will be 10
console.log("Final value of i after the loop:", x); // i is accessible here and will be 10

// example 5: Nested for loop
for (let m: number = 1; m <= 3; m++) {
    for (let n: number = 1; n <= 2; n++) {
        console.log(`Outer loop iteration: ${m}, Inner loop iteration: ${n}`);
    }
}

// example 6: Using for loop to calculate the factorial of a number
let numm: number = 5;
let factorial: number = 1;  
for (let p: number = 1; p <= numm; p++) {
    factorial *= p; // factorial = factorial * p
    console.log(`Intermediate factorial after multiplying by ${p}: ${factorial}`);
}
console.log(`Factorial of ${numm} is ${factorial}`);
 /* 1*1 
    1*2
    2*3
    6*4
    24*5 = 120
    */