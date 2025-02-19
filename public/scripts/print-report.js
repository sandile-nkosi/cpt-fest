document.getElementById("print-btn").addEventListener("click", function () {
    const printableArea = document.getElementById("printable-area").cloneNode(true);

    function replaceCanvasWithImage(canvasId, clonedContent) {
        return new Promise((resolve) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return resolve();

            setTimeout(() => {
                const img = new Image();
                img.src = canvas.toDataURL("image/png");
                img.style.width = "100%";
                img.style.maxWidth = "600px";

                const canvasElement = clonedContent.querySelector(`#${canvasId}`);
                if (canvasElement) {
                    canvasElement.parentNode.replaceChild(img, canvasElement);
                }
                resolve();
            }, 500);
        });
    }

    Promise.all([
        replaceCanvasWithImage("attendeesChart", printableArea),
        replaceCanvasWithImage("ratingsChart", printableArea)
    ]).then(() => {
        const printWindow = window.open("", "_blank");

        // Add CSS styles to maintain table formatting
        printWindow.document.write(`
            <html>
            <head>
                <title>Print Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid black; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    img { display: block; margin: 10px auto; }
                </style>
            </head>
            <body>
                ${printableArea.innerHTML}
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    });
});
