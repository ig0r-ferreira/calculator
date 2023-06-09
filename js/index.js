const OPERATIONS = ["+", "-", "/", "*"];
const DEFAULT = "0";
const DOT = ".";
const NO_CONTENT = "";
const SPECIAL_VALUES = ["NaN", "Infinity"];
const NEGATIVE_INTEGER = /^-\d$/;
const ENDS_WITH_EXPONENT = /e[+-]\d+$/;
const FORMAT_OPTIONS = {precision: 12, lowerExp: -4, upperExp: 9};


document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", (event) => {
        const calculator = document.querySelector(".calculator");
        let [current, previous] = createDisplayContent(
            event.target,
            calculator
        );

        if (current != null) {
            const mainOutput = calculator.querySelector(".output-main");
            mainOutput.textContent = current;
            mainOutput.scrollTo(mainOutput.scrollWidth, 0);
        }
        if (previous != null) {
            const secondOutput = calculator.querySelector(".output-sec");
            secondOutput.textContent = previous;
            secondOutput.scrollTo(secondOutput.scrollWidth, 0);
        }
        updateButtonStates(calculator);
    });
});

document.addEventListener("keydown", (event) => {
    let key = event.key;

    key = key === "Enter" ? "=" : key;
    key = key === "," ? DOT : key;

    const buttons = Array.from(document.querySelectorAll(".btn"));
    const buttonPressed = buttons.find((button) => button.value === key);

    if (!buttonPressed) {
        return;
    }

    buttonPressed.click();
    buttonPressed.focus();
    buttonPressed.classList.add("is-pressed");

    setTimeout(() => {
        buttonPressed.classList.remove("is-pressed");
    }, 100);
});

function createDisplayContent(button, calculator) {
    const key = button.value;
    const current = calculator.querySelector(".output-main").textContent;
    const previous = calculator.querySelector(".output-sec").textContent;
    const isNumericalButton = button.classList.contains("btn-numerical");
    const isButtonDot = button.classList.contains("btn-dot");
    const isOperationButton = button.classList.contains("btn-operation");
    const isButtonClear = button.classList.contains("btn-clear");
    const isButtonBackspace = button.classList.contains("btn-backspace");
    const isButtonCalculate = button.classList.contains("btn-calculate");

    if (isNumericalButton) {
        if (current === DEFAULT){
            return [key]
        }
        
        let value = ENDS_WITH_EXPONENT.test(current)
            ? formatValue(current, {notation: 'fixed'}) + key 
            : current + key;

        return [/\.0+$/.test(value) ? value : formatValue(value)];
    }
    if (isButtonDot) {
        return [current + key];
    }
    if (isOperationButton) {
        let previousUpdated = null;

        if (!previous) {
            previousUpdated = `${current} ${key}`;
        } else if (current) {
            previousUpdated = `${calculate(previous + current)} ${key}`;
        } else {
            previousUpdated = previous.slice(0, -1) + key;
        }
        return [NO_CONTENT, previousUpdated];
    }
    if (isButtonClear) {
        return [DEFAULT, NO_CONTENT];
    }
    if (isButtonBackspace) {
        let remainingContent = current.slice(0, -1);
        if (/e[+-]$/.test(remainingContent)){
            remainingContent = remainingContent.replace(/e[+-]/, '');
        }

        remainingContent =
            remainingContent === NO_CONTENT || NEGATIVE_INTEGER.test(current)
                ? DEFAULT
                : remainingContent;

        return [remainingContent];
    }
    if (isButtonCalculate && previous && current) {
        return [calculate(previous + current), NO_CONTENT];
    }

    return [null, null];
}

function updateButtonStates(calculator) {
    const current = calculator.querySelector(".output-main").textContent;
    const previous = calculator.querySelector(".output-sec").textContent;
    const displayContent = previous + current;

    if (SPECIAL_VALUES.includes(current)) {
        calculator
            .querySelectorAll(".btn:not(.btn-clear)")
            .forEach((button) => {
                button.setAttribute("disabled", true);
            });
        return;
    }
    if (displayContent === DEFAULT) {
        calculator.querySelectorAll(".btn").forEach((button) => {
            button.removeAttribute("disabled");
        });
    }

    if (current.includes(DOT) || ENDS_WITH_EXPONENT.test(current)) {
        calculator.querySelector("#btn-0").removeAttribute("disabled");
        calculator.querySelector(".btn-dot").setAttribute("disabled", true);
    } else {
        calculator.querySelector(".btn-dot").removeAttribute("disabled");
    }

    const lastKey = displayContent.charAt(displayContent.length - 1);
    const isNumber = !isNaN(parseInt(lastKey));

    if (current !== DEFAULT && isNumber) {
        calculator.querySelectorAll(".btn-operation").forEach((button) => {
            button.removeAttribute("disabled");
        });
    } else if (lastKey === DOT) {
        calculator.querySelectorAll(".btn-operation").forEach((button) => {
            button.setAttribute("disabled", true);
        });
    } else if (OPERATIONS.includes(lastKey)) {
        calculator.querySelector(".btn-dot").setAttribute("disabled", true);
        calculator.querySelector("#btn-0").removeAttribute("disabled");
    }
}

function calculate(expression) {
    return math.format(math.evaluate(expression), FORMAT_OPTIONS);
}

function formatValue(value, options=FORMAT_OPTIONS){
    return math.format(math.bignumber(value), options)
}
