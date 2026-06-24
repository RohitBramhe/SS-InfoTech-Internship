const screen = document.getElementById("screen");
const buttons = document.querySelectorAll("button");

let firstNumber = "";
let secondNumber = "";
let currentOperator = "";
let isTypingSecondNumber = false;

function updateScreen(value) {
    screen.value = value;
}

function renderExpression() {
    if (!currentOperator) {
        return firstNumber || "0";
    }

    if (!isTypingSecondNumber) {
        return `${firstNumber}${currentOperator}`;
    }

    return `${firstNumber}${currentOperator}${secondNumber}`;
}

function clearCalculator() {
    firstNumber = "";
    secondNumber = "";
    currentOperator = "";
    isTypingSecondNumber = false;
    updateScreen("0");
    console.log("Calculator cleared");
}

function handleDelete() {
    if (isTypingSecondNumber && secondNumber) {
        secondNumber = secondNumber.slice(0, -1);
        updateScreen(renderExpression());
        return;
    }

    if (isTypingSecondNumber && currentOperator) {
        currentOperator = "";
        isTypingSecondNumber = false;
        updateScreen(renderExpression());
        return;
    }

    if (!isTypingSecondNumber && firstNumber) {
        firstNumber = firstNumber.slice(0, -1);
        updateScreen(firstNumber || "0");
        return;
    }

    updateScreen("0");
}

function handleNumber(value) {
    if (!isTypingSecondNumber) {
        firstNumber += value;
        updateScreen(firstNumber);
        console.log("First number:", firstNumber);
        return;
    }

    secondNumber += value;
    updateScreen(renderExpression());
    console.log("Second number:", secondNumber);
}

function handleOperator(value) {
    if (!firstNumber) {
        return;
    }

    if (firstNumber && secondNumber) {
        calculateResult();
    }

    currentOperator = value;
    isTypingSecondNumber = true;
    updateScreen(renderExpression());
    console.log("Operator:", currentOperator);
}

function calculateResult() {
    if (!firstNumber || !secondNumber || !currentOperator) {
        return;
    }

    const a = parseFloat(firstNumber);
    const b = parseFloat(secondNumber);
    let result;

    if (currentOperator === "+") {
        result = a + b;
    } else if (currentOperator === "-") {
        result = a - b;
    } else if (currentOperator === "*") {
        result = a * b;
    } else if (currentOperator === "/") {
        if (b === 0) {
            updateScreen("Error");
            console.log("Cannot divide by zero");
            firstNumber = "";
            secondNumber = "";
            currentOperator = "";
            isTypingSecondNumber = false;
            return;
        }
        result = a / b;
    }

    firstNumber = String(result);
    secondNumber = "";
    currentOperator = "";
    isTypingSecondNumber = false;

    updateScreen(firstNumber);
    console.log("Result:", result);
}

function handleDot() {
    if (!isTypingSecondNumber) {
        if (firstNumber.includes(".")) {
            return;
        }

        firstNumber = firstNumber ? firstNumber + "." : "0.";
        updateScreen(firstNumber);
        return;
    }

    if (secondNumber.includes(".")) {
        return;
    }

    secondNumber = secondNumber ? secondNumber + "." : "0.";
    updateScreen(renderExpression());
}

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        const value = button.getAttribute("addvalue");

        if (value === "C") {
            clearCalculator();
            return;
        }

        if (value === "DEL") {
            handleDelete();
            return;
        }

        if (value === "=") {
            calculateResult();
            return;
        }

        if (value === ".") {
            handleDot();
            return;
        }

        if (value === "+" || value === "-" || value === "*" || value === "/") {
            handleOperator(value);
            return;
        }

        handleNumber(value);
    });
});
