
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

document.getElementById("prepareButton")
    .addEventListener("click", () => {

        const brand = document.getElementById("brand").value.trim();
        const clothingType = document.getElementById("clothingType").value;
        const size = document.getElementById("size").value.trim();
        const condition = document.getElementById("condition").value;

        const message = document.getElementById("resultMessage");

        if (!brand || !clothingType || !size) {
            message.textContent =
                "Please fill in the brand, clothing type and size.";
            return;
        }

        message.textContent =
            "Details saved for this session. Automatic identification and market valuation are coming in the next development phase.";

        console.log("SECOND LOOK item:", {
            brand,
            clothingType,
            size,
            condition
        });
    });
