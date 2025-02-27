// Converts ISO date to "time ago" format
function timeAgo(dateString) {
const date = new Date(dateString);
const now = new Date();
const seconds = Math.floor((now - date) / 1000);

const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
};

for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) {
    return `${count} ${unit}${count !== 1 ? "s" : ""} ago`;
    }
}

return "just now";
}

// Updates all elements with class 'time-ago'
function updateTimeAgo() {
document.querySelectorAll(".time-ago").forEach((element) => {
    const timestamp = element.getAttribute("data-time");
    element.textContent = timeAgo(timestamp);
});
}

// Update time every minute
setInterval(updateTimeAgo, 60000);
window.addEventListener("DOMContentLoaded", updateTimeAgo);

$(document).ready(function() {
    $(".btn").on("click", function() {
        const button = $(this);
        const eventId = button.data("event-id");
        const isRSVPed = button.data("rsvped"); // Boolean status

        $.ajax({
            url: `/user/events/${eventId}/rsvp`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ action: isRSVPed ? "cancel" : "rsvp" }), // Send correct action
            success: function(response) {
                if (response.isRSVPed) {
                    button.text("Cancel RSVP").data("rsvped", true);
                    alert("You have successfully RSVP'd to the event!");
                } else {
                    button.text("Click to RSVP").data("rsvped", false);
                    alert("You have successfully canceled your RSVP.");
                }
            },
            error: function(xhr) {
                alert("Error: " + xhr.responseText);
            }
        });
    });
});


