/**
 * project - filepath
 * 同步task机的ip地址到每个超链接上
 *
 * Copyright(c) Alibaba Group Holding Limited.
 *
 * Authors:
 *   谋士 <qingliang.hql@alibaba-inc.com>
 */
'use strict';

var win = window;
var doc = document;
// 当前浏览器是否为 IE（是否支持 document.attachEvent）
var atta = !!doc.attachEvent;
var s_attachEvent = 'attachEvent';
var s_addEventListener = 'addEventListener';
var onevent = atta ? s_attachEvent : s_addEventListener;

function datacenter(spm_ab) {
  var spm = spm_ab || goldlog.spm_ab.join('.');
  window.open('http://aplus.alibaba-inc.com/aplus/page.htm?pageId=170&id=' + spm);
};

/**
 * tap methods
 * thx to @灵玉
 */
function tapEventBind(obj, fn) {
  var isTouch = "ontouchend" in document.createElement("div");
  var event_type = isTouch ? "touchstart" : "mousedown";
  on(obj, event_type, fn);
};

/**
 * 绑定事件
 * @param obj {Window|Element} DOM 元素
 * @param event_type
 * @param f
 */
function on(obj, event_type, f) {
  if (event_type === 'tap') {
    tapEventBind(obj, f);
    return;
  }
  obj[onevent](
    (atta ? 'on' : '') + event_type,
    function (e) {
      e = e || win.event;
      var el = e.target || e.srcElement;
      if (typeof f === 'function') {
        f(e, el);
      }
    },
    false
  );
};

function tryToGetAttribute(element, attr_name) {
  return element && element.getAttribute ? (element.getAttribute(attr_name) || '') : '';
};

function tryToSetAttribute(element, attr_name, value) {
  if (element && element.setAttribute) {
    element.setAttribute(attr_name, value);
  }
};

var getItem = function (key) {
  var value = '';
  try {
    value = localStorage.getItem(key);
  } catch (e) {}
  return value;
};
var setItem = function (key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
};

var IP;
var initIP = function () {
  var ipaddress = '';
  try {
    var taskIp = location.search.match(/taskIp=(\d+\.){3}\d+/);
    if (taskIp && taskIp.length > 0) {
      ipaddress = taskIp[0].replace('taskIp=', '');
      if (ipaddress) {
        setItem('aplus_task_ip', ipaddress);
      } else {
        ipaddress = getItem('aplus_task_ip');
      }
    } else {
      ipaddress = getItem('aplus_task_ip');
    }
  } catch (e) {}
  return ipaddress;
};

var trace = function (e, el) {
  var tag_name;
  while (el && (tag_name = el.tagName)) {
    if (tag_name === 'A' || tag_name === 'AREA') {
      // 点到了链接上
      var href = tryToGetAttribute(el, 'href');
      if (href && !/taskIp=(\d+\.){3}\d+/.test(href)) {
        var _char = href.indexOf('?') > -1 ? '&' : '?';
        href += _char + 'taskIp=' + IP;
        tryToSetAttribute(el, 'href', href);
      }
    } else if (tag_name === 'BODY' || tag_name === 'HTML') {
      break;
    }
    el = el.parentNode;
  }
};

var run = function () {
  IP = initIP();
  if (IP) {
    var q = (window.goldlog_queue || (window.goldlog_queue = []));
    q.push({
      action: 'goldlog.setMetaInfo',
      arguments: ['aplus-exinfo', 'taskIp=' + IP]
    });
    q.push({
      action: 'goldlog.setMetaInfo',
      arguments: ['aplus-cpvdata', {
        taskIp: IP
      }]
    });
    if ('ontouchend' in document.createElement('div')) {
      on(doc, 'tap', trace);
    } else {
      on(doc, 'mousedown', trace);
    }
  }
};
run();
