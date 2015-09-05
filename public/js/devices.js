$(document).ready(function() {
  
  // hide child devices by default
  $('#child-devices').hide(); 
  // tagsInput
  tagsInput();

  // iCheck
  $(".icheckbox").iCheck({checkboxClass: 'icheckbox_minimal-grey', checkedClass: 'checked', inheritID: true});
  if($('#iCheck-device-cluster').hasClass('checked')) {
    $('#child-devices').show();
  }

  // show child devices if cluster
  $('#device-cluster').on('ifChecked', function() {
    $('#child-devices').show(); 
  }); 
  
  
  $('#device-cluster').on('ifUnchecked', function() {
    $('#child-devices').hide(); 
  });

  // delete device
  $('.delete-device').click(function() {
    var deviceId    = $(this).data('id');
    var parentElem  = $('.device' + deviceId);

    $.ajax({
      url: '/device/destroy/' + deviceId,
      type: 'DELETE',
      success: function(data) {
        console.log('device deleted!');
        parentElem.remove(); 
      }
    });
  });

  // add child device
  $('#child-device-btn').click(function() {
    var childDevice = $('#child-device-input').val();
    var childElem = '<li><p>' + childDevice + 
    '</p> <input type="hidden" name="child_devices" value="' + childDevice + 
    '" > <a href="#" class="child-device-remove">Delete</a></li>';

    if(childElem.length > 0) {
      $('.devices').append(childElem);
      $('#child-device-input').val('');
    }
  });

  // remove child device
  $('.devices').on('click', '.child-device-remove', function() {
    console.log('delete child');
    $(this).parent().remove();
  });

  function tagsInput(){
    if($(".tagsinput").length > 0){
      $(".tagsinput").each(function(){
        if($(this).data("placeholder") != ''){
          var dt = $(this).data("placeholder");
        }else
          var dt = 'add a tag';
        $(this).tagsInput({width: '100%',height:'auto',defaultText: dt});
      });
    }
  }// END Tagsinput
});
