
let students = JSON.parse(localStorage.getItem("students")) || [];
let editIndex = -1;

// Add or update a student
function addStudent() {
    let name = document.getElementById("name").value.trim();
    let roll = document.getElementById("roll").value.trim();

    let mark1 = document.getElementById("mark1").value;
    let mark2 = document.getElementById("mark2").value;
    let mark3 = document.getElementById("mark3").value;

    if (name === "" || roll === "" || mark1 === "" || mark2 === "" || mark3 === "") {
        alert("Please fill all fields!");
        return;
    }

    let m1 = Number(mark1);
    let m2 = Number(mark2);
    let m3 = Number(mark3);

    if ([m1, m2, m3].some(m => !Number.isFinite(m) || m < 0 || m > 100)) {
        alert("Marks must be between 0 and 100!");
        return;
    }

    let duplicate = students.some((student, index) =>
        student.roll.toLowerCase() === roll.toLowerCase() && index !== editIndex
    );

    if (duplicate) {
        alert("A student with this roll number already exists!");
        return;
    }

    let total = m1 + m2 + m3;
    let average = total / 3;

    let student = {
        name,
        roll,
        mark1: m1,
        mark2: m2,
        mark3: m3,
        total,
        average: Number(average.toFixed(2))
    };

    if (editIndex === -1) {
        students.push(student);
    } else {
        students[editIndex] = student;
        editIndex = -1;
        document.getElementById("submitBtn").innerHTML = 'Add student <span>＋</span>';
    }

    saveStudents();
    displayStudents();
    updateStats();
    clearForm();
}

// Display student records
function displayStudents(list = students) {
    let table = document.getElementById("studentList");
    let emptyMessage = document.getElementById("emptyMessage");

    table.innerHTML = "";

    if (list.length === 0) {
        emptyMessage.style.display = "block";
        emptyMessage.textContent = students.length === 0
            ? "No student records yet. Add your first student above."
            : "No matching students found.";
        return;
    }

    emptyMessage.style.display = "none";

    list.forEach(student => {
        let index = students.indexOf(student);

        let row = `
            <tr>
                <td><strong>${escapeHTML(student.name)}</strong></td>
                <td>${escapeHTML(student.roll)}</td>
                <td>${student.total}</td>
                <td>${Number(student.average).toFixed(2)}</td>
                <td>
                    <button class="edit-btn" onclick="editStudent(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteStudent(${index})">Delete</button>
                </td>
            </tr>
        `;

        table.innerHTML += row;
    });
}

// Search students
function searchStudents() {
    let query = document.getElementById("search").value.toLowerCase().trim();

    let filtered = students.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.roll.toLowerCase().includes(query)
    );

    displayStudents(filtered);
}

// Edit student
function editStudent(index) {
    let student = students[index];

    document.getElementById("name").value = student.name;
    document.getElementById("roll").value = student.roll;
    document.getElementById("mark1").value = student.mark1 ?? "";
    document.getElementById("mark2").value = student.mark2 ?? "";
    document.getElementById("mark3").value = student.mark3 ?? "";

    editIndex = index;

    document.getElementById("submitBtn").innerHTML = "Update student";
    document.querySelector(".form-container").scrollIntoView({ behavior: "smooth" });
}

// Delete student
function deleteStudent(index) {
    if (confirm("Are you sure you want to delete this student?")) {
        students.splice(index, 1);

        if (editIndex === index) {
            editIndex = -1;
            clearForm();
            document.getElementById("submitBtn").innerHTML = 'Add student <span>＋</span>';
        } else if (editIndex > index) {
            editIndex--;
        }

        saveStudents();
        displayStudents();
        updateStats();
    }
}

// Update dashboard statistics
function updateStats() {
    document.getElementById("totalStudents").textContent = students.length;

    if (students.length === 0) {
        document.getElementById("classAverage").textContent = "0.00";
        document.getElementById("highestAverage").textContent = "0.00";
        return;
    }

    let sum = students.reduce((total, student) => total + Number(student.average), 0);
    let classAverage = sum / students.length;
    let highest = Math.max(...students.map(student => Number(student.average)));

    document.getElementById("classAverage").textContent = classAverage.toFixed(2);
    document.getElementById("highestAverage").textContent = highest.toFixed(2);
}

// Save records in browser storage
function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

// Clear form
function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("roll").value = "";
    document.getElementById("mark1").value = "";
    document.getElementById("mark2").value = "";
    document.getElementById("mark3").value = "";
}

// Prevent HTML entered as a name from being interpreted as markup
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Load saved records when the page opens
displayStudents();
updateStats();
