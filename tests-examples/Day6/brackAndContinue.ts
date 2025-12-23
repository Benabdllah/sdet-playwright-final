// break loop when a condition is met
for (let i: number = 0; i < 10; i++) {
    if (i === 5) {
        console.log('Breaking the loop at i = 5');
        break; // Exit the loop when i equals 5
    }
    console.log(`Iteration number: ${i}`);
}

// continue to skip an iteration when a condition is met
for (let j: number = 0; j < 10; j++) {
    if (j % 2 === 0) {
        console.log(`Skipping even number: ${j}`);
        continue; // Skip the rest of the loop for even numbers
    }
    console.log(`Odd number: ${j}`);
}

// Example with while loop using break and continue
let count: number = 0;

while (count < 10) {
    count++;
    if (count === 7) {
        console.log('Breaking the while loop at count = 7');
        break; // Exit the loop when count equals 7
    }
    if (count % 2 === 0) {
        console.log(`Skipping even count: ${count}`);
        continue; // Skip the rest of the loop for even counts
    }
    console.log(`Odd count: ${count}`);
}

// Example with do-while loop using break and continue
let num: number = 0;

do {
    num++;
    if (num === 6) {
        console.log('Breaking the do-while loop at num = 6');
        break; // Exit the loop when num equals 6
    }
    if (num % 2 === 0) {
        console.log(`Skipping even num: ${num}`);
        continue; // Skip the rest of the loop for even nums
    }
    console.log(`Odd num: ${num}`);
} while (num < 10);