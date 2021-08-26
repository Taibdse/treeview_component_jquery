var TREEVIEW_ACTION_TYPES = {
  EDIT_HYPER_LINK: 'EDIT_HYPER_LINK',
  EDIT_FOLDER: 'EDIT_FOLDER',
  ADD_SUB_FOLDER: 'ADD_SUB_FOLDER',
  ADD_HYPER_LINK: 'ADD_HYPER_LINK'
}

function convertListToTree(list) {
  var map = {}, roots = [], i;

  for (i = 0; i < list.length; i += 1) {
    map[list[i].ID] = i; // initialize the map
    list[i].children = []; // initialize the children
  }
  for (i = 0; i < list.length; i += 1) {
    let node = list[i];
    if (node.ParentID && list[map[node.ParentID]]) {
      list[map[node.ParentID]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}


$.fn.extend({
  treed: function (treeOptions) {

    var openedClass = 'glyphicon-minus-sign';
    var closedClass = 'glyphicon-plus-sign';
    var treeData = [];
    var currentSubmisionData = {};
    var modal = $('#treeviewModal');
    var txtFolderName = modal.find('#txtFolderName');
    var txtLinkTitle = modal.find('#txtLinkTitle');
    var txtHyperLink = modal.find('#txtHyperLink');

    if (!treeOptions) treeOptions = {};

    if (treeOptions.openedClass) {
      openedClass = treeOptions.openedClass;
    }
    if (treeOptions.closedClass) {
      closedClass = treeOptions.closedClass;
    }

    if (treeOptions.data) treeData = convertListToTree(treeOptions.data);

    //initialize each of the top levels
    var tree = $(this);
    tree.addClass("tree");

    var MODEL = {
      treeData: treeData,
      addFolderNode: function (parentNodeData, folderName) {
        var newNodeData = {
          ID: Math.random(),
          Title: folderName,
          IsFolder: true,
          ParentID: parentNodeData.ID,
          HyperLink: null,
          Parent: {
            ID: parentNodeData.ID,
            Title: parentNodeData.Title
          },
          children: []
        };
        parentNodeData.children.push(newNodeData);
        return newNodeData;
      },
      addHyperLinkNode: function (parentNodeData, hyperLink, linkTitle) {
        var newNodeData = {
          ID: Math.random(),
          Title: linkTitle,
          IsFolder: false,
          ParentID: parentNodeData.ID,
          HyperLink: hyperLink,
          Parent: {
            ID: parentNodeData.ID,
            Title: parentNodeData.Title
          },
          children: []
        };
        parentNodeData.children.push(newNodeData);
        return newNodeData;
      },
      updateFolderNode: function (nodeData, folderName) {
        nodeData.Title = folderName;
      },
      updateHyperLinkNode: function (nodeData, hyperLink, linkTitle) {
        nodeData.HyperLink = hyperLink;
        nodeData.Title = linkTitle;
      },
      deleteNode: function (nodeListData, nodeData) {
        var idx = nodeListData.findIndex(function (it) {
          return it.ID === nodeData.ID;
        });
        nodeListData.splice(idx, 1);
      }
    }

    function showModal(nodeData, actionType) {
      //set modal title
      var modalTitle = [TREEVIEW_ACTION_TYPES.ADD_HYPER_LINK, TREEVIEW_ACTION_TYPES.ADD_SUB_FOLDER].includes(actionType) ? 'New' : 'Edit ' + nodeData.Title;
      var focusElement;
      modal.find('.modal-title').text(modalTitle);

      //set input value, show/hide
      if ([TREEVIEW_ACTION_TYPES.EDIT_FOLDER, TREEVIEW_ACTION_TYPES.ADD_SUB_FOLDER].includes(actionType)) {
        txtFolderName.closest('.form-group').show();
        txtLinkTitle.closest('.form-group').hide();
        txtHyperLink.closest('.form-group').hide();

        var folderName = actionType === TREEVIEW_ACTION_TYPES.EDIT_FOLDER ? nodeData.Title : '';
        txtFolderName.val(folderName).focus();
        focusElement = txtFolderName;
      } else {
        txtFolderName.closest('.form-group').hide();
        txtLinkTitle.focus().closest('.form-group').show();
        txtHyperLink.closest('.form-group').show();

        var linkTitle = actionType === TREEVIEW_ACTION_TYPES.EDIT_HYPER_LINK ? nodeData.Title : '';
        var hyperLink = actionType === TREEVIEW_ACTION_TYPES.EDIT_HYPER_LINK ? nodeData.HyperLink : '';
        txtLinkTitle.val(linkTitle);
        txtHyperLink.val(hyperLink);
        focusElement = txtLinkTitle;
      }

      // save form data
      currentSubmisionData.actionType = actionType;
      currentSubmisionData.nodeData = nodeData;

      // focus input when open modal
      modal.on('shown.bs.modal', function () {
        focusElement.focus();
      });

      //show modal
      modal.modal('show');

    }

    function hideModal() {
      modal.modal('hide');
    }

    function toggleIcon(icon, open) {
      if (open) icon.removeClass(closedClass).addClass(openedClass);
      else icon.removeClass(openedClass).addClass(closedClass)
    }

    function renderTreeBranch(nodeData, nodeListElement, nodeListData) {

      var li = $('<li class="tree-list-item" data-node-id="' + nodeData.ID + '"><div class="wrapper"></div></li>');
      nodeListElement.append(li);

      var wrapper = li.find('> div.wrapper');

      if (nodeData.IsFolder) {
        wrapper.append('<span class="node-title">' + nodeData.Title + '</span>');
      } else {
        wrapper.append('<a href="' + nodeData.HyperLink + '" class="node-title">' + nodeData.Title + '</a>');
      }

      var dropdown = '<div class="dropdown dropdown-actions">' +
        '<span class="actions" data-toggle="dropdown">' +
        '<i class="fa fa-ellipsis-v"></i>' +
        '</span>' +
        '<ul class="dropdown-menu" id="dropdown">' +
        '<li class="edit-item"><i class="fa fa-edit"></i> Edit</li>' +
        '<li class="delete-item"><i class="fa fa-trash"></i> Delete</li>' +
        '</ul>' +
        '</div>';

      wrapper.prepend(dropdown);

      wrapper.on('mouseleave', function (e) {
        wrapper.find('.dropdown').removeClass('open');
      });

      wrapper.find('.dropdown-menu .edit-item').on('click', function (e) {
        showModal(nodeData, nodeData.IsFolder ? TREEVIEW_ACTION_TYPES.EDIT_FOLDER : TREEVIEW_ACTION_TYPES.EDIT_HYPER_LINK);
      });

      wrapper.find('.dropdown-menu .delete-item').on('click', function (e) {
        var sure = confirm('Are you sure?');
        if (sure) {
          MODEL.deleteNode(nodeListData, nodeData);
          li.remove();
        }
      });

      if (nodeData.IsFolder) {
        var additionDropdownitems = '<li role="separator" class="divider"></li>' +
          '<li class="add-sub-folder"><i class="fa fa-folder"></i> Add Sub-Folder</li>' +
          '<li class="add-hyperlink-item"><i class="fa fa-link"></i> Add HyperLink Item</li>';

        wrapper
          .prepend("<i class='indicator glyphicon " + closedClass + "'></i>")
          .find('ul.dropdown-menu').append(additionDropdownitems);

        wrapper.on('click', function (e) {
          if ($(e.target).closest('.dropdown').length === 0) { // except actions dropdown click 
            var icon = wrapper.children('i.indicator');
            icon.toggleClass(openedClass + " " + closedClass);
            li.children('ul.tree-list').toggle();
          }
        });

        wrapper.find('.dropdown-menu .add-sub-folder').on('click', function (e) {
          showModal(nodeData, TREEVIEW_ACTION_TYPES.ADD_SUB_FOLDER);
        });
        wrapper.find('.dropdown-menu .add-hyperlink-item').on('click', function (e) {
          showModal(nodeData, TREEVIEW_ACTION_TYPES.ADD_HYPER_LINK);
        });

        var childrenNodeList = $('<ul class="tree-list"></ul>');
        li.append(childrenNodeList);
        li.children('ul.tree-list').toggle();
        for (var i = 0; i < nodeData.children.length; i++) {
          renderTreeBranch(nodeData.children[i], childrenNodeList, nodeData.children);
        }
      }
    }

    function showSuccessMsg(options) {
      alert(options.title);
    }

    // submit form on tree view modal
    function handleSubmitTreeModalForm(e) {
      e.preventDefault();
      var folderName = txtFolderName.val();
      var hyperLink = txtHyperLink.val();
      var linkTitle = txtLinkTitle.val();
      var nodeElement = tree.find("li.tree-list-item[data-node-id='" + currentSubmisionData.nodeData.ID + "']");

      switch (currentSubmisionData.actionType) {
        case TREEVIEW_ACTION_TYPES.EDIT_FOLDER:
          if (!folderName) return;

          MODEL.updateFolderNode(currentSubmisionData.nodeData, folderName);

          nodeElement.find('> div.wrapper span.node-title').text(folderName);
          showSuccessMsg({ title: 'Updated folder successfully!' });
          hideModal();
          break;
        case TREEVIEW_ACTION_TYPES.ADD_SUB_FOLDER:
          if (!folderName) return;

          var childrenList = nodeElement.find('> ul.tree-list');
          if (childrenList.length === 0) { // folder empty
            childrenList = $('<ul class="tree-list"></ul>');
          }

          // update local data
          var newNodeData = MODEL.addFolderNode(currentSubmisionData.nodeData, folderName);

          //update node dom
          renderTreeBranch(newNodeData, childrenList, nodeData.children);
          childrenList.show();
          toggleIcon(nodeElement.find('> div.wrapper i.indicator'), true);
          showSuccessMsg({ title: 'Added sub-folder successfully!' });
          hideModal();
          break;
        case TREEVIEW_ACTION_TYPES.EDIT_HYPER_LINK:
          if (!hyperLink || !linkTitle) return;

          MODEL.updateHyperLinkNode(currentSubmisionData.nodeData, hyperLink, linkTitle);

          nodeElement.find('> div.wrapper a.node-title').text(linkTitle).attr({ href: hyperLink });
          showSuccessMsg({ title: 'Updated hyperlink successfully!' });
          hideModal();
          break;
        case TREEVIEW_ACTION_TYPES.ADD_HYPER_LINK:
          if (!txtLinkTitle || !txtHyperLink) return;

          var childrenList = nodeElement.find('> ul.tree-list');
          if (childrenList.length === 0) { // folder empty
            childrenList = $('<ul class="tree-list"></ul>');
          }

          // update local data
          var newNodeData = MODEL.addHyperLinkNode(currentSubmisionData.nodeData, hyperLink, linkTitle);

          //update node dom
          renderTreeBranch(newNodeData, childrenList, nodeData.children);
          childrenList.show();
          toggleIcon(nodeElement.find('i.indicator'), true);
          showSuccessMsg({ title: 'Added hyperlink successfully!' });
          hideModal();
          break;
      }
    }

    // render tree list
    for (var i = 0; i < treeData.length; i++) {
      var nodeData = treeData[i];
      renderTreeBranch(nodeData, tree, treeData);
    }

    $('#treeviewModalForm').on('submit', handleSubmitTreeModalForm);
  }
});

var data = [
  {
    ID: 1,
    Title: 'Folder 1',
    IsFolder: true,
    ParentID: null,
    HyperLink: null,
    Parent: {},
  },
  {
    ID: 2,
    Title: 'Folder 2',
    IsFolder: true,
    ParentID: null,
    HyperLink: null,
    Parent: {},
  },
  {
    ID: 3,
    Title: 'Folder 3',
    IsFolder: true,
    ParentID: null,
    HyperLink: null,
    Parent: {},
  },
  {
    ID: 4,
    Title: 'Folder 4',
    IsFolder: true,
    ParentID: 2,
    HyperLink: null,
    Parent: {
      ID: 2,
      Title: 'Folder 2'
    },
  },
  {
    ID: 5,
    Title: 'Guide to connect via OpenVPN',
    IsFolder: false,
    ParentID: 2,
    HyperLink: 'https://google.com',
    Parent: {
      ID: 2,
      Title: 'Folder 2'
    },
  },
  {
    ID: 6,
    Title: 'Access System via web',
    IsFolder: false,
    ParentID: 4,
    HyperLink: 'https://google.com',
    Parent: {
      ID: 4,
      Title: 'Folder 4'
    },
  },
  {
    ID: 7,
    Title: 'Access System via desktop app',
    IsFolder: false,
    ParentID: 3,
    HyperLink: 'https://google.com',
    Parent: {
      ID: 3,
      Title: 'Folder 3'
    },
  },
];

//Initialization of treeviews
$('#treeview').treed({
  openedClass: 'glyphicon-folder-open',
  closedClass: 'glyphicon-folder-close',
  data: data
});

