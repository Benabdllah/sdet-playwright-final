import { tr } from "@faker-js/faker/.";

// Named Function: A function that has a name and can be called by that name.
function greety(name: string): string{
    return `Hello, ${name}!`;
}

// Example usage:
let message=greety("Driss"," Mohamed");
console.log(message); // Output: [1, "Hello, Mohamed! "]

// Example 1: Named Function Expression with no parameters and no return value
function logHello(): void {
    
    console.log("Hello, World!");
};
logHello(); // Output: Hello, World!

// Example 2: Named Function Expression with parameters and a return value
function add(a: number, b: number): number {
    return a + b;
};
const sum = add(5, 3);
console.log(sum); // Output: 8

// Example 2.1: rest parameters
function multiply(...nums: number[]): number {
    return nums.reduce((acc, val) => acc * val); 
};/* 🔹 وظيفة reduce:

هي دالة مدمجة في المصفوفات تقوم بتجميع القيم بناءً على عملية معينة.

في حالتنا هنا، العملية هي الضرب (*).
وهي تبدأ بالقيمة 1 (لأن 1 هو العنصر المحايد في عملية الضرب).
*/
const product = multiply(2, 3, 4);
console.log(product); // Output: 24

// Example 2.2: rest parameters with loop
 
function addWithLoop(...nums: number[]): number {
    
    let result = 0;
    for (let i = 0; i < nums.length; i++) {. // index, vorbedingung, zähler
        result =+nums[i]; //result =result +nums[i];
        console.log(result);    
    }
    return result;  
}

// Example 3: Recursive Named Function Expression         n *n-1 
function factorial( n: number): number {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
};
const fact = factorial(5);
console.log(fact); // Output: 120    

// Example 4: Named Function Expression used as a callback
const numbers = [1, 2, 3, 4, 5];
const squaredNumbers = numbers.map(function square(num: number): number {
    return num * num;
});
console.log(squaredNumbers); // Output: [1, 4, 9, 16, 25]


function processArray(arr: number[], callback: (num: number) => number): number[] {
    const result: number[] = [];
    for (let i = 0; i < arr.length; i++) {
        result.push(callback(arr[i]));
    }
    return result;
}

function square(num: number): number {
    return num * num;
}

const numbers = [1, 2, 3, 4, 5];
const squaredNumbers = processArray(numbers, square);
console.log(squaredNumbers); // Output: [1, 4, 9, 16, 25] 

// Example 5: Using Named Function with rest parameters multiple types
function findExtremes(...values: (number | string)[]): { min: number; max: number }{
    const nums = values.filter(v => typeof v === 'number') as number[];
    return {
        min: Math.min(...nums),
        max: Math.max(...nums)
    };
}
const extremes = findExtremes(10, "hello", 5, 20, "world", 15);
console.log(extremes); // Output: { min: 5, max: 20 }


// Example 6: Using Named Function with rest parameters multiple types
function findElements(...elements: (string | number)[]): number{
    return elements.length;
}
const totalElements = findElements(1, "apple", 2, "banana", 3);
console.log(totalElements); // Output: 5


// Example 7: Using Named Function with optional parameters
function buildName(firstName: string, lastName?: string): string {
    if (lastName){ {
        return `${firstName} ${lastName}`;
    } 
    else {
        return firstName;
            }
}
const fullName1 = buildName("John", "Doe");
const fullName2 = buildName("Jane");
console.log(fullName1); // Output: John Doe
console.log(fullName2); // Output: Jane


// Example 7: Using Named Function with default parameters
function greetWithDefault(name: string = "Guest"): string {
    return `Hello, ${name}!`;
}
const greet1 = greetWithDefault("Alice");
const greet2 = greetWithDefault();
console.log(greet1); // Output: Hello, Alice!
console.log(greet2); // Output: Hello, Guest!


// Example 8: Using Named Function with union types
function formatValue(value: string | number): string {
    if (typeof value === 'number') {
        return value.toFixed(2);
    } else {
        return value.toUpperCase();
    }
}
const formatted1 = formatValue(123.456);
const formatted2 = formatValue("hello");
console.log(formatted1); // Output: 123.46
console.log(formatted2); // Output: HELLO


// Example 9: Using Named Function with generic types
function identity<T>(arg: T): T {
    return arg;
}
const numIdentity = identity<number>(42);
const strIdentity = identity<string>("TypeScript");
console.log(numIdentity); // Output: 42
console.log(strIdentity); // Output: TypeScript


// Example 10: Using Named Function with intersection types
interface Person {
    name: string;
    
}

interface Employee {
    employeeId: number;
}

function getEmployeeInfo(emp: Person & Employee): string {
    return `Name: ${emp.name}, ID: ${emp.employeeId}`;
}

const employeeInfo = getEmployeeInfo({ name: "Alice", employeeId: 12345 });
console.log(employeeInfo); // Output: Name: Alice, ID: 12345

