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
    tree.find('li').has("ul").each(function () {
      var branch = $(this); //li with children ul
      branch.prepend("<i class='indicator glyphicon " + closedClass + "'></i>");
      // branch.append('<span class="actions">...</span>');
      branch.addClass('branch');
      branch.on('click', function (e) {
        if (this == e.target) {
          var icon = $(this).children('i:first');
          icon.toggleClass(openedClass + " " + closedClass);
          $(this).children().children().toggle();
        }
      });

      branch.children().children().toggle();
    });
    tree.find('ul').addClass('tree-list');
    tree.find('li').each(function () {
      var li = $(this);
      li.addClass('tree-list-item')
      var dropdown = '<div class="dropdown">' +
        '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
        '...' +
        '</button>' +
        '<ul class="dropdown-menu" aria-labelledby="dropdownMenu1">' +
        '<li><a href="#">Action</a></li>' +
        '<li><a href="#">Another action</a></li>' +
        '<li><a href="#">Something else here</a></li>' +
        '<li role="separator" class="divider"></li>' +
        '<li><a href="#">Separated link</a></li>' +
        '</ul>' +
        '</div>'
      // li.append('<span class="actions">...</span>');
      li.append(dropdown);
      li.find('> span.actions').on('click', function (e) {
        console.log(e);
        var popupActions
        li.append()
      })
      // li.on('mouseenter', function (e) {
      //   $(e.target).addClass('bg-hover');
      //   $(e.target).parent().mouseleave();
      // })
      // li.on('mouseleave', function (e) {
      //   $(e.target).removeClass('bg-hover');
      // })
    })
    //fire event from the dynamically added icon
    tree.find('.branch .indicator').each(function () {
      $(this).on('click', function () {
        $(this).closest('li').click();
      });
    });
    //fire event to open branch if the li contains an anchor instead of text
    tree.find('.branch>a').each(function () {
      $(this).on('click', function (e) {
        $(this).closest('li').click();
        e.preventDefault();
      });
    });
    //fire event to open branch if the li contains a button instead of text
    tree.find('.branch>button').each(function () {
      $(this).on('click', function (e) {
        $(this).closest('li').click();
        e.preventDefault();
      });
    });
  }
});

//Initialization of treeviews

// $('#tree1').treed();

$('#tree2').treed({ openedClass: 'glyphicon-folder-open', closedClass: 'glyphicon-folder-close' });

