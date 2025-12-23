// A Callback Function is a function that is passed as an argument to another function and is executed after some operation has been completed.

// Example 1: Simple Callback Function that takes callback as an parameter
function greetUser(name: string, callback: (greetingMessage: string) => void): void {
    const message = `Hello, ${name}!`;
    callback(message);
}
function gMessage(message: string): void {
    console.log(message);
}

//Example1.2 
/*callback: (result: number) => void ist keine Ausführung.

Es ist eine Typdefinition:

callback muss eine Funktion sein.

Diese Funktion nimmt einen Parameter result vom Typ number und gibt void zurück.

result hier ist nur ein Platzhaltername für den Typ des Parameters, den die Callback-Funktion erwartet.

Es ist nicht der tatsächliche Wert, den du übergibst.
*/
  function sum(a: number, b: number, callback: (result: number) => void): void {. // اسم بارامتر افتراضي، مستخدم فقط لوصف النوع — ليس قيمة حقيقيةTypdefinition für den Parameter callback (was für eine Funktion übergeben werden kann)
    const result = a + b;
    callback(result);
}
function displayResult(result: number): void {
    console.log("The sum is: " + result); // Output: The sum is: 15
}
// Example usage of sum with a callback function
sum(5, 10, displayResult);             

// Example usage of greetUser with a callback function
greetUser("Alice", gMessage) // Output: Hello, Alice!


// Example 2: Using Callback Function with Array methods
const numbers = [1, 2, 3, 4, 5];

// Using a callback function with map to square each number
const squaredNumbers = numbers.map(function(num: number): number {
    return num * num;
});