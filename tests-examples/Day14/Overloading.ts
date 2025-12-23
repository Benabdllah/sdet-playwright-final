//Methode Overloading in TypeScript and Constructor Overloading
class Calculator {
    // Method Overloading
    constructor() // default constructor
    constructor(a:number, b:number) // parameterized constructor tahmil za2id


    constructor(a?:number, b?:number) {
        if (a !== undefined && b !== undefined) {
            console.log(`Sum from constructor: ${a + b}`);
        } else {
            console.log('Default Constructor Called');
        }
    }


    add(x: number, y: number): number; // method signature 1
    add(x: number, y: number,o:number): number; // method signature 2

    add(x: number, y: number,o?:number): number{ // method implementation
        if(o !== undefined){
            return x + y + o;
        }
        return x + y;
    }   
}
// usage

const calc1 = new Calculator(); // Calls default constructor
const calc2 = new Calculator(5, 10); // Calls parameterized constructor and outputs: Sum from constructor: 15

console.log(`Addition of 2 numbers: ${calc1.add(3, 4)}`); // Outputs: Addition of 2 numbers: 7
console.log(`Addition of 3 numbers: ${calc2.add(3, 4, 5)}`); // Outputs: Addition of 3 numbers: 12

// method overloading with different types Å