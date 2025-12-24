// while loop: A while loop repeatedly executes a block of code as long as a specified condition is true.       

let count: number = 0;

while (count < 5) {
    console.log(`Count is: ${count}`);
    count++;
}

// Example of using a while loop to wait for a condition (simulated with a timeout here)
let conditionMet: boolean = false;
let attempts: number = 0;

const checkCondition = () => {
    // Simulate a condition that becomes true after 3 attempts
    return attempts >= 3;
};

while (!conditionMet && attempts < 5) { //conditionMet is false and attempts less than 5
    console.log(`Attempt ${attempts + 1}: Checking condition...`);
    conditionMet = checkCondition();
    if (!conditionMet) {
        console.log('Condition not met, waiting before next attempt...');
        // Simulate waiting (e.g., using setTimeout in a real scenario)
    }
    attempts++;
}

if (conditionMet) {
    console.log('Condition met!');
} else {
    console.log('Max attempts reached, condition not met.');
}

// Example 2: print even numbers from 0 to 10 using a while loop
let number: number = 0;

while (number <= 10) {
    if (number % 2 === 0) {
        console.log(`Even number: ${number}`);
    }
    number++;
}   