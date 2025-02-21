document.getElementById("print-btn").addEventListener("click", function () {
    // Clone the printable area to avoid modifying the original DOM
    const printableArea = document.getElementById("printable-area").cloneNode(true);

    /**
     * Replace a canvas element with an image in the cloned content.
     * @param {string} canvasId - The ID of the canvas element.
     * @param {HTMLElement} clonedContent - The cloned content containing the canvas.
     * @returns {Promise<void>} - Resolves when the canvas is replaced with an image.
     */
    function replaceCanvasWithImage(canvasId, clonedContent) {
        return new Promise((resolve, reject) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`Canvas with ID "${canvasId}" not found. Skipping replacement.`);
                return resolve();
            }

            // Convert the canvas to an image
            const img = new Image();
            img.src = canvas.toDataURL("image/png");
            img.alt = `Chart: ${canvasId}`; // Add alt text for accessibility
            img.style.width = "100%";
            img.style.maxWidth = "600px";
            img.style.display = "block";
            img.style.margin = "10px auto";

            // Replace the canvas with the image in the cloned content
            const canvasElement = clonedContent.querySelector(`#${canvasId}`);
            if (canvasElement) {
                canvasElement.parentNode.replaceChild(img, canvasElement);
                resolve();
            } else {
                reject(new Error(`Canvas element with ID "${canvasId}" not found in cloned content.`));
            }
        });
    }

    // Replace all canvases with images
    Promise.all([
        replaceCanvasWithImage("attendeesChart", printableArea),
        replaceCanvasWithImage("ratingsChart", printableArea)
    ])
        .then(() => {
            // Open a new window for printing
            const printWindow = window.open("", "_blank");

            // Add CSS styles for the print layout
            printWindow.document.write(`
                <html>
                <head>
                    <title>Print Report</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                            color: #333; 
                        }
                        h2, h3 { 
                            color: #2c3e50; 
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-top: 20px; 
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 8px; 
                            text-align: left; 
                        }
                        th { 
                            background-color: #f2f2f2; 
                            font-weight: bold; 
                        }
                        img { 
                            display: block; 
                            margin: 10px auto; 
                            max-width: 100%; 
                            height: auto; 
                        }
                    </style>
                </head>
                <body>
                    ${printableArea.innerHTML}
                </body>
                </html>
            `);

            printWindow.document.close();
            printWindow.focus();

            // Print the window after a short delay to ensure content is loaded
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        })
        .catch((error) => {
            console.error("Error during print preparation:", error);
            alert("An error occurred while preparing the print report. Please try again.");
        });
});