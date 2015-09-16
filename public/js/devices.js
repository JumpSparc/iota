$(document).ready(function() {
  $('.colorpicker').colorselector();
  selectColorUpdate();

  // hide child devices by default
  $('#child-devices').hide(); 

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


  // DATA / Variable
  // Format: [{name:<value>, color: <value>}]

  $('#add-data-btn').click(function() {
    console.log('add device variable');
    var order = $('#device-data').children('tr').length + 1;
    var colorpicker = $('<select class="variable-input colorpicker" data-type="color">' + 
        '<option value="#CD5C5C" data-color="#CD5C5C" selected="selected">indianred</option>' +
        '<option value="#FF4500" data-color="#FF4500">orangered</option>' +
        '<option value="#008B8B" data-color="#008B8B">darkcyan</option>' +
        '<option value="#B8860B" data-color="#B8860B">darkgoldenrod</option>' +
        '<option value="#32CD32" data-color="#32CD32">limegreen</option>' +
        '<option value="#FFD700" data-color="#FFD700">gold</option>' +
        '<option value="#48D1CC" data-color="#48D1CC">mediumturquoise</option>' +
        '<option value="#87CEEB" data-color="#87CEEB">skyblue</option>' +
        '<option value="#FF69B4" data-color="#FF69B4">hotpink</option>' +
        '<option value="#87CEFA" data-color="#87CEFA">lightskyblue</option>' +
        '<option value="#6495ED" data-color="#6495ED">cornflowerblue</option>' +
        '<option value="#DC143C" data-color="#DC143C">crimson</option>' +
        '<option value="#FF8C00" data-color="#FF8C00">darkorange</option>' +
        '<option value="#C71585" data-color="#C71585">mediumvioletred</option>' +
        '<option value="#000000" data-color="#000000">black</option>' +
        '</select>');
    var row         = $('<tr data-order="'+ order +'"></tr>');
    var table       = $('#device-data');
    row.append('<td><input type="text" class="form-control variable-input" data-type="variable_name"></td>')
      .append($('<td></td>').append(colorpicker))
      .append('<td><a href="#" class="device-data-remove"> Delete </a></td>');
    table.append(row);

    $('.colorpicker').colorselector();
  });
  
  // update variable value
  $('#device-data').on('change keydown', '.variable-input', function() {
    updateVariableValue();
  });

  function updateVariableValue() {
    var output = [];
    var val    = [];
    var ctr    = 0;
    var tmp    = {};
    $('.variable-input').each(function(i) { 
      if (ctr == 2) {
        output.push(tmp);
        ctr = 0;
        tmp = {};
      }
      if ($(this).val().match(/#/) === null) {
        tmp.name = $(this).val();
      }
      else {
        tmp.color = $(this).val();
      }
      val.push($(this).val());
      ctr++;
    }); 
    // push the last element
    output.push(tmp);

    $('#variable').val(JSON.stringify(output));
  }

  // delete device data / variable
  $('#device-data').on('click', '.device-data-remove', function() {
    $(this).parent().parent().remove(); 
    updateVariableValue();
  });

  function selectColorUpdate(){
    var variable = $('#variable').val();
    var variableData = [];
    if (variable !== undefined && variable !== 'undefined') {
      variableData = JSON.parse(variable);
    }
    
    $.each(variableData, function(index, data) {
      console.log(data.color)
      $($('select.variable-input')[index]).colorselector('setColor', data.color); 
    });
  }

});
