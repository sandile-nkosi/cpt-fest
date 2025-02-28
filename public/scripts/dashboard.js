document.getElementById('date-range').addEventListener('change', (e) => {
    const days = e.target.value;
    window.location.href = `/admin/dashboard?range=${days}`;
  });


document.addEventListener("DOMContentLoaded", () => {
    // Use <%- %> to prevent EJS from escaping the JSON
    const ageData = JSON.parse('<%- ageDistribution %>');
    const genderData = JSON.parse('<%- genderDistribution %>');
    const provinceData = JSON.parse('<%- eventsByProvince %>');
    const ratingData = parseFloat('<%- averageRatings %>') || 0;

    console.log("Age Data:", ageData);
    console.log("Gender Data:", genderData);
    console.log("Province Data:", provinceData);
    console.log("Average Ratings:", ratingData);

    // Define isEmpty function first
    const isEmpty = (data) => Object.keys(data).length === 0;

    // Update summary values
    document.getElementById('avg-rating').textContent = ratingData.toFixed(1);
    
    // Calculate total RSVPs
    let totalRSVPs = 0;
    if (!isEmpty(provinceData)) {
        Object.keys(provinceData).forEach(province => {
            totalRSVPs += provinceData[province].totalRSVPs;
        });
    }
    document.getElementById('total-rsvps').textContent = totalRSVPs;
    
    // Calculate total users (from age distribution)
    let totalUsers = 0;
    if (!isEmpty(ageData)) {
        Object.values(ageData).forEach(count => {
            totalUsers += count;
        });
    }
    document.getElementById('active-users').textContent = totalUsers;
    
    // Total events (number of provinces with events)
    document.getElementById('total-events').textContent = Object.keys(provinceData).length;

    // Modern color palette
    const colors = [
        '#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6', 
        '#1abc9c', '#34495e', '#d35400', '#16a085', '#8e44ad'
    ];

    // Age Chart
    if (!isEmpty(ageData)) {
        new Chart(document.getElementById('ageChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(ageData),
                datasets: [{
                    label: 'Users by Age Group',
                    data: Object.values(ageData),
                    backgroundColor: colors.slice(0, Object.keys(ageData).length),
                    borderRadius: 6,
                    maxBarThickness: 40
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Gender Chart
    if (!isEmpty(genderData)) {
        new Chart(document.getElementById('genderChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(genderData),
                datasets: [{
                    label: 'Users by Gender',
                    data: Object.values(genderData),
                    backgroundColor: colors.slice(0, Object.keys(genderData).length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            boxWidth: 12
                        }
                    }
                },
                cutout: '40%'
            }
        });
    }

    // Province Chart
    if (!isEmpty(provinceData)) {
        const provinces = Object.keys(provinceData);
        const totalRSVPs = provinces.map(province => provinceData[province].totalRSVPs);
        const totalMaxAttendees = provinces.map(province => provinceData[province].totalMaxAttendees);

        new Chart(document.getElementById('provinceChart'), {
            type: 'bar',
            data: {
                labels: provinces,
                datasets: [
                    {
                        label: 'Total RSVPs',
                        data: totalRSVPs,
                        backgroundColor: '#3498db',
                        borderRadius: 6,
                        maxBarThickness: 40
                    },
                    {
                        label: 'Max Attendees',
                        data: totalMaxAttendees,
                        backgroundColor: '#2ecc71',
                        borderRadius: 6,
                        maxBarThickness: 40
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        title: {
                            display: true,
                            text: 'Count',
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            boxWidth: 12
                        }
                    }
                }
            }
        });
    }

    // Ratings Chart
    new Chart(document.getElementById('ratingChart'), {
        type: 'doughnut',
        data: {
            labels: ['Average Rating'],
            datasets: [{
                data: [ratingData, 5 - ratingData],
                backgroundColor: ['#f1c40f', '#ecf0f1'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            if (context.dataIndex === 0) {
                                return context.raw.toFixed(1) + ' / 5';
                            }
                            return '';
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            cutout: '70%'
        }
    });

    document.getElementById('print-btn').addEventListener('click', () => window.print());
});
