/*
1.Class ist a blueprint for creating objects. It encapsulates data for the object and methods to manipulate that data.
2. Read only properties
3. Optional properties
4. Static variables and methods 
  static properties/methods belong to the class itself rather than to any specific instance of the class. are common/shared across all the objects created from that class.
  static properties/methods can be modified using any objects 
5.constructor
6. method
*/

class Student {
    readonly studentID: number; // Readonly property
    name: string; // regular property
    email?: string; // Optional property
    static schoolName: string = "ABC High School"; //Static variables belong to class not instance, to all objects, shared among all instances/objects

    constructor(studentID: number, name: string, email?: string) {
        this.studentID = studentID;
        this.name = name;
        this.email = email;
        // if (email) {
        //     this.email = email;
        //}
    
    }
    // Method
    displayInfo(): void {
        console.log(`Student ID: ${this.studentID}, Name: ${this.name}, Email: ${this.email ? this.email : 'N/A'}`);
        
    }

    static changeSchoolName(newName: string): void {
        Student.schoolName = newName; // Accessing static variable using class name
    }
    
}   

// usage -> creating objects -> instances of the class -> intializing objects
let student1 = new Student(1, "John Doe")
let student2 = new Student(2, "Jane Smith", "test@gmail.com")
let driss = new Student(1, "Drriss Antra")
let Omar = new Student(2, "Omar Chater", "omar@gmail.com")
//Displaying information
student1.displayInfo(); // Student ID: 1, Name: John Doe, Email: N/A
driss.displayInfo(); // Student ID: 2, Name: Jane Smith, Email:   
//driss.changeSchoolName("New School"); // Error: changeSchoolName is not a function 


//Accessing static property using class name
console.log(`School Name: ${Student.schoolName}`); // School Name: ABC High School
// changing school name using object
Student.changeSchoolName("XYZ High School");
console.log(`School Name: ${Student.schoolName}`); // School Name: XYZ High School

// Attempting to modify readonly property will result in error
 //driss.studentID = 10; // Error: Cannot assign to 'studentID' because it is a read-only property.

// Modifying static property using object
student2.constructor['schoolName'] = "New School Name";
console.log(`School Name after modification: ${Student.schoolName}`); // School Name after modification: New School Name





