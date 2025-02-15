document.getElementById("ratingForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const eventId = "<%= event._id %>"; // Get event ID
    const rating = document.getElementById("rating").value;
    const comment = document.getElementById("comment").value;

    fetch(`/user/events/${eventId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert("Rating submitted!");
            location.reload(); // Refresh page to display new rating
        }
    })
    .catch(error => console.error("Error:", error));
});
