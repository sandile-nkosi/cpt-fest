document.addEventListener('DOMContentLoaded', function () {
    const eventTitles = JSON.parse(document.getElementById('eventTitles').textContent);
    const attendeeCounts = JSON.parse(document.getElementById('attendeeCounts').textContent);
    const maxAttendees = JSON.parse(document.getElementById('maxAttendees').textContent);
    const avgRatings = JSON.parse(document.getElementById('avgRatings').textContent);

    const attendeesCtx = document.getElementById('attendeesChart').getContext('2d');
    const ratingsCtx = document.getElementById('ratingsChart').getContext('2d');

    new Chart(attendeesCtx, {
        type: 'bar',
        data: {
            labels: eventTitles,
            datasets: [{
                label: 'Attendee Count',
                data: attendeeCounts,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Max Attendees',
                data: maxAttendees,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    new Chart(ratingsCtx, {
        type: 'line',
        data: {
            labels: eventTitles,
            datasets: [{
                label: 'Average Rating',
                data: avgRatings,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
});