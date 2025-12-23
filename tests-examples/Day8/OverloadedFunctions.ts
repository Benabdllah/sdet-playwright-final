// step 1: write a signature of the function
// step 2: implement the function
// step 3: call the function

// Example 1: Different parameter types
function combine(a: number, b: number): string;
function combine(a: string, b: string): string;
function combine(a: number, b: number): number;

function combine(a: any, b: any): any {
    if (typeof a === "number" && typeof b === "number") {
        return a + b; // returns number
    } else if (typeof a === "string" && typeof b === "string") {
        return a + b; // returns string
    }
}

console.log(combine(5, 10)); // Output: 15
console.log(combine("Hello, ", "World!")); // Output: Hello, World!

// Example 2: Different number of parameters
function displayInfo(name: string): string;
function displayInfo(name: string, age: number): string;

function displayInfo(name: string, age?: number): string {
    if (age !== undefined) {
        return `Name: ${name}, Age: ${age}`;
    } else {
        return `Name: ${name}`;
    }
}
console.log(displayInfo("Alice")); // Output: Name: Alice
console.log(displayInfo("Bob", 30)); // Output: Name: Bob, Age: 30

// Example 3: Different parameter order
function formatData(id: number, data: string): string;
function formatData(data: string, id: number): string;

function formatData(param1: any, param2: any): string {
    if (typeof param1 === "number" && typeof param2 === "string") {
        return `ID: ${param1}, Data: ${param2}`;
    } else if (typeof param1 === "string" && typeof param2 === "number") {
        return `Data: ${param1}, ID: ${param2}`;
    }
}

console.log(formatData(101, "Sample Data")); // Output: ID: 101, Data: Sample Data
console.log(formatData("Sample Data", 101)); // Output: Data: Sample Data, ID: 101

// Example 4: Using function overloading with different return types
function calculateArea(radius: number): number;
function calculateArea(length: number, width: number): number;

function calculateArea(param1: number, param2?: number): number {
    if (param2 === undefined) {
        return Math.PI * param1 * param1; // Area of circle         
    } else {
        return param1 * param2; // Area of rectangle
    }
}

console.log(calculateArea(5)); // Output: 78.53981633974483 (Area of circle)
console.log(calculateArea(4, 6)); // Output: 24 (Area of rectangle)

// Example 5: Overloaded function with different parameter types and counts
function concatenate(a: string, b: string): string;
function concatenate(a: string, b: string, c: string): string;

function concatenate(...args: string[]): string {
    return args.join(" ");
}

console.log(concatenate("Hello", "World")); // Output: Hello World
console.log(concatenate("TypeScript", "is", "awesome")); // Output: TypeScript is awesome

// Example 6: Overloaded function with union types
function processInput(input: number): number;
function processInput(input: string): string;

function processInput(input: number | string): number | string {
    if (typeof input === "number") {
        return input * input; // returns square of the number
    } else {
        return input.toUpperCase(); // returns uppercase string
    }
}

console.log(processInput(7)); // Output: 49
console.log(processInput("hello")); // Output: HELLO

// Example 7: Using Overloaded Function with callbacks
function fetchData(url: string, callback: (data: string) => void): void;
function fetchData(url: string, timeout: number, callback: (data: string) => void): void;

function fetchData(url: string, param2: any, param3?: any): void {
    let callback: (data: string) => void;
    let timeout: number | undefined;

    if (typeof param2 === "function") {
        callback = param2;
    } else {
        timeout = param2;
        callback = param3;
    }

    setTimeout(() => {
        const data = `Data from ${url}`;
        callback(data);
    }, timeout || 1000);
}

fetchData("https://api.example.com/data", (data) => {
    console.log(data); // Output after 1 second: Data from https://api.example.com/data
});

fetchData("https://api.example.com/data", 2000, (data) => {
    console.log(data); // Output after 2 seconds: Data from https://api.example.com/data
}); 
// Example 8: Overloaded function with different parameter combinations
function logMessage(message: string): void;
function logMessage(message: string, level: "info" | "warn" | "error"): void;

function logMessage(message: string, level?: "info" | "warn" | "error"): void {
    const logLevel = level || "info";
    console.log(`[${logLevel.toUpperCase()}]: ${message}`);
}

logMessage("This is an informational message."); // Output: [INFO]: This is an informational message.
logMessage("This is a warning message.", "warn"); // Output: [WARN]: This is a warning message.
logMessage("This is an error message.", "error"); // Output: [ERROR]: This is an error message.     
// Example 9: Overloaded function with different object types
interface User {
    name: string;
    age: number;
}

interface Admin {
    name: string;
    role: string;
}

function getUserInfo(user: User): string;
function getUserInfo(admin: Admin): string;

function getUserInfo(person: User | Admin): string {
    if ("age" in person) {
        return `User Name: ${person.name}, Age: ${person.age}`;
    } else {
        return `Admin Name: ${person.name}, Role: ${person.role}`;
    }
}

const user: User = { name: "Alice", age: 25 };
const admin: Admin = { name: "Bob", role: "SuperAdmin" };

console.log(getUserInfo(user)); // Output: User Name: Alice, Age: 25
console.log(getUserInfo(admin)); // Output: Admin Name: Bob, Role: SuperAdmin   
// Example 10: Overloaded function with different array types
function processArray(arr: number[]): number;
function processArray(arr: string[]): string;

function processArray(arr: number[] | string[]): number | string {
    if (typeof arr[0] === "number") {
        return (arr as number[]).reduce((sum, val) => sum + val, 0); // sum of numbers
    } else {
        return (arr as string[]).join(", "); // concatenated string
    }
}

console.log(processArray([1, 2, 3, 4, 5])); // Output: 15
console.log(processArray(["apple", "banana", "cherry"])); // Output: apple, banana, cherry  


// Example of arrow function returning an object
let createPerson = (name: string, age: number): { name: string; age: number } => ({
    name,
    age,
});
let person = createPerson("Charlie", 28);
console.log(person); // Output: { name: 'Charlie', age: 28 }        
console.log("Total Elements: " + totalElements); // Output: Total Elements: 5   





// Example 7: Using promise Function without callbacks

function fetchDataAsync(url: string, timeout = 1000): Promise<string> {
  return new Promise((resolve,reject) => {
    if (!url.startsWith("https")) {
      reject("Ungültige URL!");
      return;
    }
    setTimeout(() => {
      resolve(`Data from ${url}`);// Beendet das Promise erfolgreich und liefert value zurück
    }, timeout);
  });
}

// استخدام مع async/await
(async () => {
  const data = await fetchDataAsync("https://api.example.com/data", 1500);
  console.log(data);
})();

// أو استخدام then()
fetchDataAsync("https://api.example.com/data").then(console.log).catch(console.error)  
fetchDataAsync("https://api.example.com/data",1500).then(console.log).catch(console.error) ;

/*
Hier wird ein neues Promise-Objekt erstellt.
Das Promise bekommt als Argument eine Funktion, die ihrerseits das Argument resolve erhält.

resolve ist eine Funktion, mit der man dem Promise sagt:
👉 „Ich bin fertig! Hier ist mein Ergebnis.“

Wenn du resolve(...) aufrufst, wird das Promise als erfolgreich abgeschlossen (fulfilled) markiert.
*/