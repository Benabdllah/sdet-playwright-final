//do-while loop: A do-while loop executes a block of code once, and then repeatedly executes the block as long as a specified condition is true.    
let count: number = 0;

do {
    console.log(`Count is: ${count}`);
    count++;
} while (count < 5);

// Example of using a do-while loop to wait for a condition (simulated with a timeout here)
let conditionMet: boolean = false;
let attempts: number = 0;

const checkCondition = () => {
    // Simulate a condition that becomes true after 3 attempts
    return attempts >= 3;
};

do {
    console.log(`Attempt ${attempts + 1}: Checking condition...`);
    conditionMet = checkCondition();
    if (!conditionMet) {
        console.log('Condition not met, waiting before next attempt...');
        // Simulate waiting (e.g., using setTimeout in a real scenario)
    }
    attempts++;
} while (!conditionMet && attempts < 5);

if (conditionMet) {
    console.log('Condition met!');
} else {
    console.log('Max attempts reached, condition not met.');
}

// Example 2: print even numbers from 0 to 10 using a do-while loop
let i: number = 0;

do {
    if (i % 2 === 0) {
        console.log(`Even number: ${i}`);
    }
    i++;
}
while (i <= 10);   
