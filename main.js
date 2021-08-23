$.fn.extend({
  treed: function (o) {

    var openedClass = 'glyphicon-minus-sign';
    var closedClass = 'glyphicon-plus-sign';

    if (typeof o != 'undefined') {
      if (typeof o.openedClass != 'undefined') {
        openedClass = o.openedClass;
      }
      if (typeof o.closedClass != 'undefined') {
        closedClass = o.closedClass;
      }
    };

    //initialize each of the top levels
    var tree = $(this);
    tree.addClass("tree");

    tree.find('ul').addClass('tree-list');

    tree.find('li').each(function () {
      var li = $(this);
      li.addClass('tree-list-item');
      var wrapper = li.find('> div.wrapper');

      var dropdown = '<div class="dropdown dropdown-actions">' +
        '<span class="actions" data-toggle="dropdown">' +
        '<i class="fa fa-ellipsis-v"></i>' +
        '</span>' +
        '<ul class="dropdown-menu" id="dropdown">' +
        '<li>Edit</li>' +
        '<li>Delete</li>' +
        '</ul>' +
        '</div>';

      wrapper.prepend(dropdown);

      wrapper.on('mouseleave', function (e) {
        wrapper.find('.dropdown').removeClass('open');
      });

      if (li.find('> ul').length > 0) { // li has child branch        
        var branch = $(this); //li with children ul

        var additionDropdownitems = '<li role="separator" class="divider"></li>' +
          '<li>Add Sub-Folder</li>' +
          '<li>Add Hyperlink Item</li>';
        wrapper
          .prepend("<i class='indicator glyphicon " + closedClass + "'></i>")
          .find('ul.dropdown-menu').append(additionDropdownitems);

        wrapper.on('click', function (e) {
          if ($(e.target).hasClass('wrapper') || $(e.target).hasClass('indicator')) { // except actions dropdown click 
            var icon = wrapper.children('i.indicator');
            icon.toggleClass(openedClass + " " + closedClass);
            branch.children('ul.tree-list').toggle();
          }
        });

        branch.children('ul.tree-list').toggle();
      }

      wrapper.find('.dropdown-menu li').on('click', function () {
        console.log('show modal')
        $('#myModal').modal('show');
      })
    })
    //fire event from the dynamically added icon
    // tree.find('.branch .indicator').each(function () {
    //   $(this).on('click', function () {
    //     $(this).closest('li').click();
    //   });
    // });
    //fire event to open branch if the li contains an anchor instead of text
    // tree.find('.branch>a').each(function () {
    //   $(this).on('click', function (e) {
    //     $(this).closest('li').click();
    //     e.preventDefault();
    //   });
    // });
    //fire event to open branch if the li contains a button instead of text
    // tree.find('.branch>button').each(function () {
    //   $(this).on('click', function (e) {
    //     $(this).closest('li').click();
    //     e.preventDefault();
    //   });
    // });
  }
});

//Initialization of treeviews

// $('#tree1').treed();

$('#treeview').treed({ openedClass: 'glyphicon-folder-open', closedClass: 'glyphicon-folder-close' });

