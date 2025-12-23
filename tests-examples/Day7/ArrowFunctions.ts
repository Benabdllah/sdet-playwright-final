// Arrow Functions
let add = (a: number, b: number): number => {
    return a + b;
};

let multiply = (a: number, b: number): number => {
    return a * b;
};

console.log("Addition: " + add(5, 10)); // Output: Addition: 15
console.log("Multiplication: " + multiply(5, 10)); // Output: Multiplication: 50

// Using arrow function as a callback
let numbers = [1, 2, 3, 4, 5];
let squaredNumbers = numbers.map((num: number): number => {
    return num * num;
});
console.log("Squared Numbers: " + squaredNumbers); // Output: Squared Numbers: 1,4,9,16,25

// Using arrow function with implicit return
let subtract = (a: number, b: number): number => a - b;
console.log("Subtraction: " + subtract(10, 5)); // Output: Subtraction: 5


// Using arrow function with optional parameters
let greet = (name: string, greeting?: string): string => {
    return `${greeting ?? "Hello"}, ${name}!`;
};
console.log(greet("Alice")); // Output: Hello, Alice!
console.log(greet("Bob", "Hi")); // Output: Hi, Bob!

// Using arrow function with rest parameters
let sum = (...nums: number[]): number => {
    return nums.reduce((acc, val) => acc + val, 0);
};
console.log("Sum: " + sum(1, 2, 3, 4, 5)); // Output: Sum: 15

// Example of using arrow function with setTimeout
setTimeout((): void => {
    console.log("This message is shown after 2 seconds");
}, 2000);

// Example of using arrow function to sort an array
let unsortedNumbers = [5, 2, 9, 1, 5, 6];
unsortedNumbers.sort((a: number, b: number): number => a - b);
console.log("Sorted Numbers: " + unsortedNumbers); // Output: Sorted Numbers: 1,2,5,5,6,9

// Example of arrow function capturing 'this' context
class Counter {
    count: number = 0;

    increment() {
        setInterval((): void => {
            this.count++;
            console.log(this.count);
        }, 1000);
    }
}

let counter = new Counter();
counter.increment(); // Increments and logs count every second

// Using arrow function with  default parameters
let power = (base: number, exponent: number = 2): number => {
    return Math.pow(base, exponent);
};
console.log("Power: " + power(3)); // Output: Power: 9
console.log("Power: " + power(2, 3)); // Output: Power: 8   
// Example of arrow function returning an object
let createPerson = (name: string, age: number): { name: string; age: number } => ({
    
    name,
    age,
});
let person = createPerson("Charlie", 28);
console.log("Person: " + JSON.stringify(person)); // Output: Person: {"name":"Charlie","age":28}

// Example of arrow function with no parameters
let sayHello = (): void => {
    console.log("Hello, World!");
};
sayHello(); // Output: Hello, World!

// Example of arrow function used as a method in an object
let calculator = {
    add: (a: number, b: number): number => a + b,
    multiply: (a: number, b: number): number => a * b,
};
console.log("Calculator Add: " + calculator.add(4, 5)); // Output: Calculator Add: 9
console.log("Calculator Multiply: " + calculator.multiply(4, 5)); // Output: Calculator Multiply: 20

// Example of arrow function with type inference
let divide = (a: number, b: number) => a / b;
console.log("Division: " + divide(10, 2)); // Output: Division: 5

// Example of arrow function with nested arrow functions
let outerFunction = (x: number) => (y: number) => x + y;
let addFive = outerFunction(5);
console.log("Add Five: " + addFive(10)); // Output: Add Five: 15

// Example of arrow function with conditional (ternary) operator
let isEven = (num: number): string => (num % 2 === 0 ? "Even" : "Odd");
console.log("Is 4 Even or Odd? " + isEven(4)); // Output: Is 4 Even or Odd? Even
console.log("Is 7 Even or Odd? " + isEven(7)); // Output: Is 7 Even or Odd? Odd

// Example of arrow function with array filtering
let filterEvens = (nums: number[]): number[] => nums.filter(num => num % 2 === 0);
console.log("Even Numbers: " + filterEvens([1, 2, 3, 4, 5, 6])); // Output: Even Numbers: 2,4,6

// Example of arrow function with array reduction
let productOfArray = (nums: number[]): number => nums.reduce((acc, val) => acc * val, 1);
console.log("Product of Array: " + productOfArray([1, 2, 3, 4])); // Output: Product of Array: 24

// Example of arrow function with string manipulation
let toUpperCase = (str: string): string => str.toUpperCase();
console.log("Uppercase: " + toUpperCase("hello")); // Output: Uppercase: HELLO

// Example of arrow function with array mapping to objects
let names = ["Alice", "Bob", "Charlie"];
let nameObjects = names.map(name => ({ name }));
console.log("Name Objects: " + JSON.stringify(nameObjects)); // Output: Name Objects: [{"name":"Alice"},{"name":"Bob"},{"name":"Charlie"}]

// Example of arrow function with async/await
let fetchData = async (url: string): Promise<any> => {
    const response = await fetch(url);
    return response.json();
};
// Note: To test fetchData, you would need to run this in an environment that supports fetch, like a browser or Node.js with node-fetch package.
// fetchData('https://api.example.com/data').then(data => console.log(data));