var UrlUtils = {
  getParameterByName: function (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
}

var TreeUtils = {
  convertListToTree: function (list) {
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
}