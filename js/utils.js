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

var ValidationUtils = {
  isEmpty: function (val) {
    if (val === null || val === undefined) return true;
    if (typeof val === 'string' && val.trim() === '') return true;
    if (typeof val === 'object' && Object.keys(val).length === 0) return true;
    return false;
  }
}

var StringUtils = {
  include: function (str1, str2) {
    if (ValidationUtils.isEmpty(str1)) return false;
    if (ValidationUtils.isEmpty(str2)) return true;
    str1 = this.removeVnAccents(str1).toLowerCase();
    str2 = this.removeVnAccents(str2).toLowerCase();
    return str1.indexOf(str2) > -1;
  },
  removeVnAccents: function (str) {
    if (ValidationUtils.isEmpty(str)) return '';
    // remove accents
    const from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ";
    const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";

    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(RegExp(from[i], "gi"), to[i]);
    }

    str = str.toLowerCase().trim()
    return str;
  }
}

var ObjectUtils = {
  clone: function (obj) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }
}