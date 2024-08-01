// document.addEventListener('DOMContentLoaded', function() {
//     const weightLossForm = document.getElementById('weight-loss-form');
//     weightLossForm.addEventListener('submit', function(event) {
//         event.preventDefault();
//         const formData = new FormData(weightLossForm);
//         const startDate = formData.get('startDate');
//         const endDate = formData.get('endDate');
//         console.log(startDate,endDate)

//         fetch('/users/find-weight-loss', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ startDate, endDate })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.error) {
//                 document.getElementById('weight-loss-result').innerHTML = `Error: ${data.error}`;
//             } else {
//                 document.getElementById('weight-loss-result').innerHTML = `Weight Loss: ${data.weightLoss} kg`;
//             }
//         })
//         .catch(error => {
//             document.getElementById('weight-loss-result').innerHTML = `Error: ${error}`;
//         });
//     });
// });

// $(document).ready(function() {
//     $('#weight-loss-form').on('submit', function(e) {
//         e.preventDefault();

//         $.ajax({
//             type: 'POST',
//             url: '/users/weight-loss',
//             data: {
//                 startDate: $('#startDate').val(),
//                 endDate: $('#endDate').val()
//             },
//             success: function(response) {
//                 $('#result').text(`Weight loss: ${response.weightLoss} kg`);
//             },
//             error: function(err) {
//                 $('#result').text(`Error: ${err.responseJSON.error}`);
//             }
//         });
//     });
// });

$(document).ready(function() {
    $('#weight-loss-form').on('submit', function(e) {
        e.preventDefault();

        const startDate = $('#startDate').val();
        const endDate = $('#endDate').val();

        $.ajax({
            type: 'POST',
            url: '/users/weight-loss',
            data: {
                startDate: startDate,
                endDate: endDate
            },
            success: function(response) {
                $('#weight-loss-result').text(`Weight loss: ${response.weightLoss} kg`);
            },
            error: function(err) {
                $('#weight-loss-result').text(`Error: ${err.responseJSON.error}`);
            }
        });
    });
});

// document.addEventListener('DOMContentLoaded', function() {
//     const weightLossForm = document.getElementById('weight-loss-form');
//     const weightLossResult = document.getElementById('weight-loss-result');

//     weightLossForm.addEventListener('submit', function(e) {
//         e.preventDefault();

//         const startDate = document.getElementById('startDate').value;
//         const endDate = document.getElementById('endDate').value;

//         axios.post('/users/weight-loss', {
//             startDate: startDate,
//             endDate: endDate
//         })
//         .then(response => {
//             weightLossResult.textContent = `Weight loss: ${response.data.weightLoss} kg`;
//         })
//         .catch(error => {
//             weightLossResult.textContent = `Error: ${error.response.data.error}`;
//         });
//     });
// });

// document.addEventListener('DOMContentLoaded', function() {
//     const weightLossForm = document.getElementById('weight-loss-form');
//     const weightLossResult = document.getElementById('weight-loss-result');

//     weightLossForm.addEventListener('submit', function(e) {
//         e.preventDefault();

//         const startDate = document.getElementById('startDate').value;
//         const endDate = document.getElementById('endDate').value;

//         fetch('/users/weight-loss', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ startDate, endDate })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.weightLoss !== undefined) {
//                 weightLossResult.textContent = `Weight loss: ${data.weightLoss} kg`;
//             } else {
//                 weightLossResult.textContent = `Error: ${data.error}`;
//             }
//         })
//         .catch(error => {
//             weightLossResult.textContent = `Error: ${error.message}`;
//         });
//     });
// });
