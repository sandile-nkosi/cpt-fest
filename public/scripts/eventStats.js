document.addEventListener("DOMContentLoaded", function () {
    const eventTitles = JSON.parse(document.getElementById("eventTitles").textContent);
    const attendeeCounts = JSON.parse(document.getElementById("attendeeCounts").textContent);
    const maxAttendees = JSON.parse(document.getElementById("maxAttendees").textContent);
    const avgRatings = JSON.parse(document.getElementById("avgRatings").textContent);

    // Attendee Chart (Bar Chart with Max Attendees)
    new Chart(document.getElementById("attendeesChart"), {
        type: "bar",
        data: {
            labels: eventTitles,
            datasets: [
                {
                    label: "Attendee Count",
                    data: attendeeCounts,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                },
                {
                    label: "Max Attendees",
                    data: maxAttendees,
                    backgroundColor: "rgba(255, 99, 132, 0.6)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Rating Chart (Line Chart)
    new Chart(document.getElementById("ratingsChart"), {
        type: "line",
        data: {
            labels: eventTitles,
            datasets: [{
                label: "Average Rating",
                data: avgRatings,
                backgroundColor: "rgba(255, 99, 132, 0.6)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 5 }
            }
        }
    });
});
