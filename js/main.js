$.fn.extend({
  treed: function (treeOptions) {

    var openedClass = 'glyphicon-minus-sign';
    var closedClass = 'glyphicon-plus-sign';
    var treeData = [];
    var currentSubmisionData = {};

    var modal = $('#treeviewModal');

    var itemDetailsForm = modal.find('#itemDetailsForm');
    var txtFolderName = itemDetailsForm.find('#txtFolderName');
    var txtLinkTitle = itemDetailsForm.find('#txtLinkTitle');
    var txtHyperLink = itemDetailsForm.find('#txtHyperLink');

    var shareForm = modal.find('#shareForm');
    var txtShareRecipient = shareForm.find('#txtShareRecipient');
    var txtShareContent = shareForm.find('#txtShareContent');

    if (!treeOptions) treeOptions = {};

    if (treeOptions.openedClass) {
      openedClass = treeOptions.openedClass;
    }
    if (treeOptions.closedClass) {
      closedClass = treeOptions.closedClass;
    }

    if (treeOptions.data) treeData = TreeUtils.convertListToTree(treeOptions.data);

    //initialize each of the top levels
    var tree = $(this);
    tree.addClass("tree");

    function getShareLink(nodeData) {
      if (!nodeData.IsFolder) return nodeData.HyperLink;
      var rootUrl = location.origin + location.pathname;
      if (rootUrl[rootUrl.length - 1] === '/') rootUrl = rootUrl.substring(0, rootUrl.length - 1);
      return rootUrl + '?expand=folder&folderid=' + nodeData.ID;
    }

    // submit form on tree view modal
    function handleSubmitItemDetailsForm(e) {
      e.preventDefault();
      var folderName = txtFolderName.val();
      var hyperLink = txtHyperLink.val();
      var linkTitle = txtLinkTitle.val();
      var nodeData = currentSubmisionData.nodeData;
      var actionType = currentSubmisionData.actionType;
      var nodeElement = tree.find("li.tree-list-item[data-node-id='" + nodeData.ID + "']");

      switch (actionType) {
        case TREEVIEW_ACTION_TYPES.EDIT_FOLDER:
          if (!folderName) return;

          MODEL.updateFolderNode(nodeData.ID, folderName);

          VIEW.setNodeTitle(nodeElement, NODE_TYPES.FOLDER, { folderName: folderName });
          VIEW.showSuccessMsg({ title: 'Updated folder successfully!' });
          VIEW.hideModal();
          break;
        case TREEVIEW_ACTION_TYPES.ADD_SUB_FOLDER:
          if (!folderName) return;

          var childrenList = nodeElement.find('> ul.tree-list');
          if (childrenList.length === 0) { // folder empty
            childrenList = $('<ul class="tree-list"></ul>');
            nodeElement.append(childrenList);
          }

          // update local data
          var newNodeData = MODEL.addFolderNode(nodeData.ID, folderName);

          // update node dom
          VIEW.renderTreeBranch(newNodeData, childrenList);
          VIEW.toggleExpandFolder(nodeElement, true);
          VIEW.showSuccessMsg({ title: 'Added sub-folder successfully!' });
          VIEW.hideModal();
          break;
        case TREEVIEW_ACTION_TYPES.EDIT_HYPER_LINK:
          if (!hyperLink || !linkTitle) return;

          MODEL.updateHyperLinkNode(nodeData.ID, hyperLink, linkTitle);

          VIEW.setNodeTitle(nodeElement, NODE_TYPES.HYPER_LINK, { linkTitle: linkTitle, hyperLink: hyperLink });
          VIEW.showSuccessMsg({ title: 'Updated hyperlink successfully!' });
          VIEW.hideModal();
          break;
        case TREEVIEW_ACTION_TYPES.ADD_HYPER_LINK:
          if (!txtLinkTitle || !txtHyperLink) return;

          var childrenList = nodeElement.find('> ul.tree-list');
          if (childrenList.length === 0) { // folder empty
            childrenList = $('<ul class="tree-list"></ul>');
          }

          // update local data
          var newNodeData = MODEL.addHyperLinkNode(nodeData.ID, hyperLink, linkTitle);

          // update node dom
          VIEW.renderTreeBranch(newNodeData, childrenList);
          VIEW.toggleExpandFolder(nodeElement, true);
          VIEW.showSuccessMsg({ title: 'Added hyperlink successfully!' });
          VIEW.hideModal();
          break;
      }
    }

    function handleSubmitShareForm(e) {
      e.preventDefault();
      var nodeData = currentSubmisionData.nodeData;

      var shareRecipient = txtShareRecipient.val();
      var shareContent = txtShareContent.val();
      var shareLink = getShareLink(nodeData);
      alert('Handle Share');
      VIEW.hideModal();
    }

    var MODEL = {
      treeData: treeData,

      findNodeById: function (treeData, id) {
        var found = null;
        for (var i = 0; found == null && i < treeData.length; i++) {
          var nodeData = treeData[i];
          if (nodeData.ID === id) {
            return nodeData;
          } else if (nodeData.IsFolder) {
            found = this.findNodeById(nodeData.children, id);
          }
        }
        return found;
      },

      addFolderNode: function (parentNodeId, folderName) {
        var parentNodeData = this.findNodeById(this.treeData, parentNodeId);
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

      addChildrenNodeData: function (parentNodeId, childrenNodeData) {
        var parentNodeData = this.findNodeById(this.treeData, parentNodeId);
        childrenNodeData.forEach(function (nodeData) {
          nodeData.children = [];
          parentNodeData.children.push(nodeData);
        })
        return parentNodeData;
      },

      addHyperLinkNode: function (parentNodeId, hyperLink, linkTitle) {
        var parentNodeData = this.findNodeById(this.treeData, parentNodeId);
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

      updateFolderNode: function (nodeId, folderName) {
        var nodeData = this.findNodeById(this.treeData, nodeId);
        nodeData.Title = folderName;
      },

      updateHyperLinkNode: function (nodeId, hyperLink, linkTitle) {
        var nodeData = this.findNodeById(this.treeData, nodeId);
        nodeData.HyperLink = hyperLink;
        nodeData.Title = linkTitle;
      },

      deleteNode: function (nodeData) {
        var parentNodeData = this.findNodeById(this.treeData, nodeData.ParentID);
        var idx = parentNodeData.children.findIndex(function (it) {
          return it.ID === nodeData.ID;
        });
        parentNodeData.children.splice(idx, 1);
      },
    };

    var VIEW = {
      showModal: function (nodeData, actionType) {
        var focusedElement;
        var modalTitle;

        if (actionType === TREEVIEW_ACTION_TYPES.SHARE_ITEM) {
          shareForm.show();
          itemDetailsForm.hide();
          txtShareContent.val('');
          txtShareRecipient.val('');

          modalTitle = 'Share ' + (nodeData.IsFolder ? 'Folder' : 'HyperLink');
          focusedElement = txtShareRecipient;
        } else {
          shareForm.hide();
          itemDetailsForm.show();

          // set modal title
          modalTitle = [TREEVIEW_ACTION_TYPES.ADD_HYPER_LINK, TREEVIEW_ACTION_TYPES.ADD_SUB_FOLDER].includes(actionType) ? 'New' : 'Edit ' + nodeData.Title;

          //set input value, show/hide
          if ([TREEVIEW_ACTION_TYPES.EDIT_FOLDER, TREEVIEW_ACTION_TYPES.ADD_SUB_FOLDER].includes(actionType)) {
            txtFolderName.closest('.form-group').show();
            txtLinkTitle.closest('.form-group').hide();
            txtHyperLink.closest('.form-group').hide();

            var folderName = actionType === TREEVIEW_ACTION_TYPES.EDIT_FOLDER ? nodeData.Title : '';
            txtFolderName.val(folderName).focus();
            focusedElement = txtFolderName;
          } else {
            txtFolderName.closest('.form-group').hide();
            txtLinkTitle.focus().closest('.form-group').show();
            txtHyperLink.closest('.form-group').show();

            var linkTitle = actionType === TREEVIEW_ACTION_TYPES.EDIT_HYPER_LINK ? nodeData.Title : '';
            var hyperLink = actionType === TREEVIEW_ACTION_TYPES.EDIT_HYPER_LINK ? nodeData.HyperLink : '';
            txtLinkTitle.val(linkTitle);
            txtHyperLink.val(hyperLink);
            focusedElement = txtLinkTitle;
          }
        }

        // save form data
        currentSubmisionData.actionType = actionType;
        currentSubmisionData.nodeData = nodeData;

        //render modal title
        modal.find('.modal-title').text(modalTitle);

        // focus input when open modal
        modal.on('shown.bs.modal', function () {
          focusedElement.focus();
        });

        //show modal
        modal.modal('show');
      },

      hideModal: function () {
        modal.modal('hide');
      },

      setNodeTitle: function (nodeElement, nodeType, data) {
        switch (nodeType) {
          case NODE_TYPES.FOLDER:
            nodeElement.find('> div.wrapper span.node-title').text(data.folderName);
            break;
          case NODE_TYPES.HYPER_LINK:
            nodeElement.find('> div.wrapper a.node-title').text(data.linkTitle).attr({ href: data.hyperLink });
            break;
        }
      },

      toggleExpandFolder: function (node, open) {
        var icon = node.find('> .wrapper i.indicator');
        var childrenListNode = node.children('ul.tree-list');

        if (typeof open === 'boolean') {
          if (open) {
            icon.removeClass(closedClass).addClass(openedClass);
            childrenListNode.show();
          } else {
            icon.removeClass(openedClass).addClass(closedClass);
            childrenListNode.hide();
          }
        } else {
          icon.toggleClass(openedClass + " " + closedClass);
          childrenListNode.toggle();
        }
      },

      renderTreeBranch: function (nodeData, nodeListElement, autoExpand) {
        var view = this;
        var isFolder = nodeData.IsFolder ? 1 : 0;
        var li = $('<li class="tree-list-item" data-node-id="' + nodeData.ID + '" data-is-folder="' + isFolder + '"><div class="wrapper"></div></li>');
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
          '<li class="share-item"><i class="fa fa-share"></i> Share</li>' +
          '</ul>' +
          '</div>';

        wrapper.prepend(dropdown);

        wrapper.on('mouseleave', function (e) {
          wrapper.find('.dropdown').removeClass('open');
        });

        wrapper.find('.dropdown-menu .edit-item').on('click', function (e) {
          view.showModal(nodeData, nodeData.IsFolder ? TREEVIEW_ACTION_TYPES.EDIT_FOLDER : TREEVIEW_ACTION_TYPES.EDIT_HYPER_LINK);
        });
        wrapper.find('.dropdown-menu .share-item').on('click', function (e) {
          view.showModal(nodeData, TREEVIEW_ACTION_TYPES.SHARE_ITEM);
        });

        wrapper.find('.dropdown-menu .delete-item').on('click', function (e) {
          var sure = confirm('Are you sure?');
          if (sure) {
            MODEL.deleteNode(nodeData);
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
              if (nodeData.children.length === 0) {
                var childrenNodeData = getChildrenNodeData(nodeData);
                var parentNodeData = MODEL.addChildrenNodeData(nodeData.ID, childrenNodeData);
                view.renderChildrenListToFolderNode(li, parentNodeData.children);
              }
              view.toggleExpandFolder(li);
            }
          });

          wrapper.find('.dropdown-menu .add-sub-folder').on('click', function (e) {
            view.showModal(nodeData, TREEVIEW_ACTION_TYPES.ADD_SUB_FOLDER);
          });
          wrapper.find('.dropdown-menu .add-hyperlink-item').on('click', function (e) {
            view.showModal(nodeData, TREEVIEW_ACTION_TYPES.ADD_HYPER_LINK);
          });

          var childrenNodeList = $('<ul class="tree-list"></ul>');
          li.append(childrenNodeList);
          li.children('ul.tree-list').toggle();
          for (var i = 0; i < nodeData.children.length; i++) {
            view.renderTreeBranch(nodeData.children[i], childrenNodeList, autoExpand);
          }
          if (autoExpand) view.toggleExpandFolder(li, true);
        }
      },

      renderChildrenListToFolderNode: function (nodeFolder, childrenListData) {
        var view = this;
        for (var i = 0; i < childrenListData.length; i++) {
          var childrenNodeList = nodeFolder.find('> ul.tree-list');
          if (childrenNodeList.length === 0) {
            childrenNodeList = $('<ul class="tree-list"></ul>');
            nodeFolder.append(childrenNodeList);
          }
          view.renderTreeBranch(childrenListData[i], childrenNodeList, false);
        }
      },

      showSuccessMsg: function (options) {
        alert(options.title);
      },

      expandShareFolder: function () {
        var self = this;
        var expand = UrlUtils.getParameterByName('expand');
        var folderId = UrlUtils.getParameterByName('folderid');

        if (expand === NODE_TYPES.FOLDER) {
          var folderNode = tree.find("li.tree-list-item[data-node-id='" + folderId + "']");
          folderNode.parents('li.tree-list-item').each(function (idx, ele) {
            self.toggleExpandFolder($(ele), true);
          })
          self.toggleExpandFolder(folderNode, true);
        }
      },

      renderTreeList: function (treeData, autoExpand) {
        var view = this;
        tree.html('');
        for (var i = 0; i < treeData.length; i++) {
          var nodeData = treeData[i];
          view.renderTreeBranch(nodeData, tree, autoExpand);
        }
      },

      bindEvents: function () {
        itemDetailsForm.on('submit', handleSubmitItemDetailsForm);

        shareForm.on('submit', handleSubmitShareForm);
      }
    };

    // init events
    VIEW.bindEvents();

    // render tree list
    VIEW.renderTreeList(MODEL.treeData);

    // expand folder base on url param
    VIEW.expandShareFolder();
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
  // {
  //   ID: 4,
  //   Title: 'Folder 4',
  //   IsFolder: true,
  //   ParentID: 2,
  //   HyperLink: null,
  //   Parent: {
  //     ID: 2,
  //     Title: 'Folder 2'
  //   },
  // },
  // {
  //   ID: 5,
  //   Title: 'Guide to connect via OpenVPN',
  //   IsFolder: false,
  //   ParentID: 2,
  //   HyperLink: 'https://google.com',
  //   Parent: {
  //     ID: 2,
  //     Title: 'Folder 2'
  //   },
  // },
  // {
  //   ID: 6,
  //   Title: 'Access System via web',
  //   IsFolder: false,
  //   ParentID: 4,
  //   HyperLink: 'https://google.com',
  //   Parent: {
  //     ID: 4,
  //     Title: 'Folder 4'
  //   },
  // },
  // {
  //   ID: 7,
  //   Title: 'Access System via desktop app',
  //   IsFolder: false,
  //   ParentID: 3,
  //   HyperLink: 'https://google.com',
  //   Parent: {
  //     ID: 3,
  //     Title: 'Folder 3'
  //   },
  // },
];

function getChildrenNodeData(parentNodeData) {
  var loadedChildrenData = [
    {
      ID: Math.random(),
      Title: Math.random(),
      IsFolder: true,
      ParentID: parentNodeData.ID,
      HyperLink: null,
      Parent: {
        ID: parentNodeData.ID,
        Title: parentNodeData.Title
      },
    },
    {
      ID: Math.random(),
      Title: Math.random(),
      IsFolder: false,
      ParentID: parentNodeData.ID,
      HyperLink: 'https://google.com',
      Parent: {
        ID: parentNodeData.ID,
        Title: parentNodeData.Title
      },
    },
  ];
  return loadedChildrenData;
}


//Initialization of treeviews
$('#treeview').treed({
  openedClass: 'glyphicon-folder-open',
  closedClass: 'glyphicon-folder-close',
  data: data
});

