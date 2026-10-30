
// SECOND LOOK — Main functionality

const itemInput = document.getElementById("itemInput");
const labelInput = document.getElementById("labelInput");

const itemPreview = document.getElementById("itemPreview");
const labelPreview = document.getElementById("labelPreview");

const itemPlaceholder = document.getElementById("itemPlaceholder");
const labelPlaceholder = document.getElementById("labelPlaceholder");

const removeItem = document.getElementById("removeItem");
const removeLabel = document.getElementById("removeLabel");

const scanButton = document.getElementById("scanButton");
const scanMessage = document.getElementById("scanMessage");

const results = document.getElementById("results");

let itemImageURL = null;
let labelImageURL = null;

// Handle image uploads

function uploadImage(input, preview, placeholder, removeButton, type) {
    input.addEventListener("change", () => {
        const file = input.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            input.value = "";
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            alert("Please choose an image smaller than 15 MB.");
            input.value = "";
            return;
        }

        if (type === "item" && itemImageURL) {
            URL.revokeObjectURL(itemImageURL);
        }

        if (type === "label" && labelImageURL) {
            URL.revokeObjectURL(labelImageURL);
        }

        const imageURL = URL.createObjectURL(file);

        if (type === "item") {
            itemImageURL = imageURL;
        } else {
            labelImageURL = imageURL;
        }

        preview.src = imageURL;
        preview.hidden = false;
        placeholder.hidden = true;
        removeButton.hidden = false;

        updateScanButton();
    });
}

// Remove uploaded images

function removeImage(input, preview, placeholder, removeButton, type) {
    removeButton.addEventListener("click", () => {
        if (type === "item" && itemImageURL) {
            URL.revokeObjectURL(itemImageURL);
            itemImageURL = null;
        }

        if (type === "label" && labelImageURL) {
            URL.revokeObjectURL(labelImageURL);
            labelImageURL = null;
        }

        preview.src = "";
        preview.hidden = true;
        placeholder.hidden = false;
        removeButton.hidden = true;

        input.value = "";

        updateScanButton();
    });
}

// Connect upload functions

uploadImage(
    itemInput,
    itemPreview,
    itemPlaceholder,
    removeItem,
    "item"
);

uploadImage(
    labelInput,
    labelPreview,
    labelPlaceholder,
    removeLabel,
    "label"
);

removeImage(
    itemInput,
    itemPreview,
    itemPlaceholder,
    removeItem,
    "item"
);

removeImage(
    labelInput,
    labelPreview,
    labelPlaceholder,
    removeLabel,
    "label"
);

// Open file selection

document.querySelector("#itemArea .upload-button")
    .addEventListener("click", () => itemInput.click());

document.querySelector("#labelArea .upload-button")
    .addEventListener("click", () => labelInput.click());

// Update scan button

function updateScanButton() {
    const hasBothImages = itemImageURL && labelImageURL;

    scanButton.disabled = !hasBothImages;

    if (hasBothImages) {
        scanMessage.textContent = "Both photos uploaded. You're ready!";
    } else if (itemImageURL || labelImageURL) {
        scanMessage.textContent = "One more photo needed.";
    } else {
        scanMessage.textContent = "Upload both photos to continue.";
    }
}

// Continue to identification

scanButton.addEventListener("click", () => {
    if (!itemImageURL || !labelImageURL) return;

    document.getElementById("resultItem").src = itemImageURL;
    document.getElementById("resultLabel").src = labelImageURL;

    results.hidden = false;

    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Prepare valuation


// SECOND LOOK — OCR ENGINE

const prepareButton = document.getElementById("prepareButton");
const resultMessage = document.getElementById("resultMessage");

const brandInput = document.getElementById("brand");
const sizeInput = document.getElementById("size");

prepareButton.addEventListener("click", async () => {
    if (!labelInput.files[0]) {
        resultMessage.textContent = "Please upload a label photo first.";
        return;
    }

    prepareButton.disabled = true;
    prepareButton.textContent = "Reading label...";

    resultMessage.textContent = "Initializing OCR engine...";

    try {
        const worker = await Tesseract.createWorker("eng");

        resultMessage.textContent = "Scanning clothing label...";

        const result = await worker.recognize(labelInput.files[0]);

        const text = result.data.text;

        await worker.terminate();

        console.log("Extracted label text:", text);

        // Extract information
        const lines = text
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

        // Find likely brand
        const brands = [
            "Nike",
            "Adidas",
            "Puma",
            "Reebok",
            "Under Armour",
            "New Balance",
            "H&M",
            "Zara",
            "Uniqlo",
            "Levi's",
            "Carhartt",
            "The North Face",
            "Ralph Lauren",
            "Tommy Hilfiger",
            "Calvin Klein",
            "Lacoste",
            "Champion",
            "GANT",
            "COS",
            "Arket"
        ];

        const normalizedText = text.toLowerCase();

        const detectedBrand = brands.find(brand =>
            normalizedText.includes(brand.toLowerCase())
        );

        // Extract size
        const sizeMatch = text.match(
            /\b(XXS|XS|S|M|L|XL|XXL|XXXL|[0-9]{2,3})\b/i
        );

        // Update form
        if (detectedBrand) {
            brandInput.value = detectedBrand;
        }

        if (sizeMatch) {
            sizeInput.value = sizeMatch[0].toUpperCase();
        }

        // Show extracted text for review
        const oldOutput = document.getElementById("ocrOutput");

        if (oldOutput) oldOutput.remove();

        const output = document.createElement("div");
        output.id = "ocrOutput";
        output.className = "ocr-output";

        const heading = document.createElement("h3");
        heading.textContent = "Label recognition";

        const description = document.createElement("p");
        description.textContent = detectedBrand
            ? `Brand detected: ${detectedBrand}`
            : "Brand not automatically identified. Please enter it manually.";

        const rawText = document.createElement("pre");
        rawText.textContent = text || "No readable text found.";

        output.append(heading, description, rawText);

        document.querySelector(".result-form").appendChild(output);

        resultMessage.textContent =
            "Scan complete! Check the extracted information.";

    } catch (error) {
        console.error("OCR error:", error);

        resultMessage.textContent =
            "Could not read the label. Please try a clearer photo.";

    } finally {
        prepareButton.disabled = false;
        prepareButton.textContent = "Scan label again ↗";
    }
});

