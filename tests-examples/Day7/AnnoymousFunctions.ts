// Annonymous Functions
let add = function(a: number, b: number): number {
    return a + b;
};

let multiply = function (a: number, b: number): number {
    return a * b;
};

console.log("Addition: " + add(5, 10)); // Output: Addition: 15
console.log("Multiplication: " + multiply(5, 10)); // Output: Multiplication: 50


// Using anonymous function as a callback
let nummern = [1, 2, 3, 4, 5];
let squaredNumbers = nummern.map(function (num: number): number {
    return num * num;
});
console.log("Squared Numbers: " + squaredNumbers); // Output: Squared Numbers: 1,4,9,16,25


// Example of an IIFE (Immediately Invoked Function Expression)
(let result = function (x: number, y: number): number {
    return x - y;
})(10, 5);
console.log("IIFE Result: " + result); // Output: IIFE Result: 5


// Using anonymous function to sort an array
let unsortedNumbers = [5, 2, 9, 1, 5, 6];
unsortedNumbers.sort(function (a: number, b: number): number {
    return a - b;
});
console.log("Sorted Numbers: " + unsortedNumbers); // Output: Sorted Numbers: 1,2,5,5,6,9


// Example of using anonymous function with setTimeout
setTimeout(function (): void {
    console.log("This message is shown after 2 seconds");
}, 2000);