$(document).ready(function() {
  $('.delete-device').click(function() {
    var deviceId    = $(this).data('id');
    var parentElem  = $(this).parent();

    $.ajax({
      url: '/device/destroy' + deviceId,
      type: 'DELETE',
      success: function(data) {
        console.log('device deleted!');
        parentElem.remove(); 
      }
    });
  });
});
