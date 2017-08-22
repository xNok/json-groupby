'use strict';

function groupBy(items, properties, collect) {
  if (arguments.length < 2) return arr;

  //groupBy recursive funtion
  var group = {};

  if (typeof properties[0] === 'string') {
    //groupBy category
    group = _groupBy(result, function(item) {
       return valueAt(items, properties[0]);
    });
  } else {
    //groupBy range
    group = groupByRange(items, properties[0]);
  }

  // Nested array
  properties = properties.slice(1);

  if (properties.length > 0) {
    for (var key in group) {
      group[key] = _groupBy(group[key], properties);
    }
  }

  // collect other properties values in array
  if (collect && collect.length > 0)
    group = collectProperties(group, collect);

  return group;
}

/*
* items (Array): The collection to iterate over.
* iteratee (Function): The iteratee to find tags.
*
* Inspired from _.groupBy
*/
function _groupBy(items, iteratee) {
  // Grouping by is equivalent to redicing an array
  // and accumulating them by category
  return items.reduce(function(group, item){
    // We provided a function that tels us in wich category
    // a given item is
    var tags = iteratee(item)

    if (Array.isArray(tags)) {
      // tag is string/integer
      add2tag(group,tags,item)
    }else{
      // tag is an 1d-array
      tags.forEach(function(tag) {
        add2tag(group,tag,item)
      })
    }

    return group
  },{})
}

function add2tag(group,tag,item){
  group[tag] = group[tag] || [];
  group[tag].push(item);
}

function groupByCategory(arr, prop) {
  var isPropertyArray = Array.isArray(valueAt(arr[0], prop));
  if (isPropertyArray) {
    return arr.reduce(function(group, f) {
      var tags = valueAt(f, prop);
      tags.forEach(function(tag) {
        group[tag] = group[tag] || [];
        group[tag].push(f);
      });
      return group;
    },{});
  } else {
    return arr.reduce(function(group, f) {
      var tag = valueAt(f, prop);
      group[tag] = group[tag] || [];
      group[tag].push(f);
      return group;
    },{});
  }
}

function groupByRange(arr, lookup) {
  return arr.reduce(function(group, f) {
    var val, ind, tag;
    val = valueAt(f, lookup.property);
    ind = locationOf(val, lookup.intervals);
    if (ind === lookup.intervals.length -1) ind--;
    tag = lookup.labels ? lookup.labels[ind] : ind;

    group[tag] = group[tag] || [];
    group[tag].push(f);

    return group;
  },{});
}

// collect the properties in an array
function collectProperties(groups, properties) {
  var collection = {};
  for (var key in groups) {
    if (Array.isArray(groups[key])) {
      collection[key] = groups[key].reduce(function(coll, item) {
        properties.forEach(function(prop) {
          if (!coll[prop]) coll[prop] = [];
          coll[prop].push(valueAt(item,prop));
        })
        return coll;
      }, {})
    } else {
      collection[key] = collectProperties(groups[key], properties);
    }
  }
  return collection;
}

function valueAt(obj,path) {
  //taken from http://stackoverflow.com/a/6394168/713573
  function index(prev,cur, i, arr) {
    if (prev.hasOwnProperty(cur)) {
      return prev[cur];
    } else {
      throw new Error(arr.slice(0,i+1).join('.') + ' is not a valid property path');
    }
  }
  return path.split('.').reduce(index, obj);
}

// similar to Array.findIndex but more efficient
// http://stackoverflow.com/q/1344500/713573
function locationOf(element, array, start, end) {
  start = start || 0;
  end = end || array.length;
  var pivot = parseInt(start + (end - start) / 2, 10);
  if (end-start <= 1 || array[pivot] === element) return pivot;
  if (array[pivot] < element) {
    return locationOf(element, array, pivot, end);
  } else {
    return locationOf(element, array, start, pivot);
  }
}
module.exports = groupBy;
