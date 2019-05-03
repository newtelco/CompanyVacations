$('#managerDropdown').dropdown({
    clearable: false,
    fullTextSearch: true,
    allowAdditions: true,
    ignoreDiacritics: true,
    forceSelection: true
  });

$('#fromCalendar').calendar({
    type: 'date'
  });

$('#toCalendar').calendar({
    type: 'date'
  });

  $('#railBtn').on('click', function() {
      $('#confirmModal').modal('show');
  })