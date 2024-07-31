$(document).ready(function() {
    $('#weight-loss-form').on('submit', function(e) {
        e.preventDefault();

        const startDate = $('#start-date').val();
        const endDate = $('#end-date').val();

        $.ajax({
            url: '/users/find-weight-loss',
            type: 'POST',
            data: { startDate, endDate },
            success: function(data) {
                $('#weight-loss-result').html(`Weight loss: ${data.weightLoss} kg`);
            },
            error: function(err) {
                $('#weight-loss-result').html(`Error: ${err.responseJSON.error}`);
            }
        });
    });
});
