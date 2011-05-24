/*============================================================================
  CREDIT: https://github.com/shimondoodkin/nodejs-clone-extend.git
============================================================================*/

function replace(a, b) {
    if (!b) {
        return a;
    }
    var key;
    for (key in b) {
        if (b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }

    return a;
}
this.replace = replace;

function add(a, b) {
    if (!b) {
        return a;
    }
    var key;
    for (key in b) {
        if (b.hasOwnProperty(key)) {
            if (typeof a[key] === 'undefined' || a[key] === null) {
                a[key] = b[key];
            }
        }
    }
    return a;
}
this.add = add;


function extend(a, b, context, newobjs, aparent, aname, haveaparent) // context is anti circular references mechanism
{
    if (a == b) {
        return a;
    }
    if (!b) {
        return a;
    }

    var key, clean_context = false,
        return_sublevel = false,
        b_pos;
    if (!haveaparent) {
        aparent = {
            'a': a
        };
        aname = 'a';
    }
    if (!context) {
        clean_context = true;
        context = [];
        newobjs = [];
    }
    b_pos = context.indexOf(b);
    if (b_pos == -1) {
        context.push(b);
        newobjs.push([aparent, aname]);
    } else {
        return newobjs[b_pos][0][newobjs[b_pos][1]];
    }

    for (key in b) {
        if (b.hasOwnProperty(key)) {
            if (typeof a[key] === 'undefined') {
                if (typeof b[key] === 'object') {
                    if (b[key] instanceof Array) // http://javascript.crockford.com/remedial.html
                    {
                        a[key] = extend([], b[key], context, newobjs, a, key, true);
                    } else if (b[key] === null) {
                        a[key] = null;
                    } else {
                        a[key] = extend({}, b[key], context, newobjs, a, key, true); /*a[key].constructor = b[key].constructor;  a[key].prototype = b[key].prototype;*/
                    }
                } else {
                    a[key] = b[key];
                }
            } else if (typeof a[key] === 'object' && a[key] !== null) {
                a[key] = extend(a[key], b[key], context, newobjs, a, key, true); /*a[key].constructor = b[key].constructor;  a[key].prototype = b[key].prototype;*/
            } else {
                a[key] = b[key];
            }
        }
    }
    if (clean_context) {
        context = null;
        newobjs = null;
    }
    if (!haveaparent) {
        aparent = null;
        return a;
    }
    if (typeof a === 'object' && !(a instanceof Array)) {
/*a.constructor = b.constructor;
  a.prototype   = b.prototype*/
        ;
    }
    return a;
}
this.extend = extend;

function extenduptolevel(a, b, levels, context, newobjs, aparent, aname, haveaparent) {
    if (a == b) {
        return a;
    }
    if (!b) {
        return a;
    }

    var key, clean_context = false,
        return_sublevel = false;
    if (!haveaparent) {
        aparent = {
            'a': a
        };
        aname = 'a';
    }
    if (!context) {
        clean_context = true;
        context = [];
        newobjs = [];
    }
    b_pos = context.indexOf(b);
    if (b_pos == -1) {
        context.push(b);
        newobjs.push([aparent, aname]);
    } else {
        return newobjs[b_pos][0][newobjs[b_pos][1]];
    }

    for (key in b) {
        if (b.hasOwnProperty(key)) {
            if (typeof a[key] === 'undefined') {
                if (typeof b[key] === 'object' && levels > 0) {
                    if (b[key] instanceof Array) // http://javascript.crockford.com/remedial.html
                    {
                        a[key] = extenduptolevel([], b[key], levels - 1, context, newobjs, a, key, true);
                    } else if (b[key] === null) {
                        a[key] = null;
                    } else {
                        a[key] = extenduptolevel({}, b[key], levels - 1, context, newobjs, a, key, true);
                    }
                } else {
                    a[key] = b[key];
                }
            } else if (typeof a[key] === 'object' && a[key] !== null && levels > 0) {
                a[key] = extenduptolevel(a[key], b[key], levels - 1, context, newobjs, a, key, true);
            } else {
                a[key] = b[key];
            }
        }
    }
    if (clean_context) {
        context = null;
        newobjs = null;
    }

    if (!haveaparent) {
        aparent = null;
        return a;
    }
    if (typeof a === 'object' && !(a instanceof Array)) {
/*a.constructor = b.constructor;
  a.prototype   = b.prototype;*/
    }
    return a;
}
this.extenduptolevel = extenduptolevel;

function clone(obj) {
    if (typeof obj === 'object') {
        if (obj === null) {
            return null;
        }
        if (obj instanceof Array) {
            return extend([], obj);
        } else {
            return extend({}, obj);
        }
    }
    return obj;
}
this.clone = clone;

function cloneextend(obj, exteddata) {
    if (typeof obj === 'object') {
        if (obj === null) {
            return null;
        }
        return extend(clone(obj), exteddata);
    }
    return obj;
}
this.cloneextend = cloneextend;


function cloneuptolevel(obj, level) // clone only numlevels levels other levels leave references
{
    if (typeof obj === 'object') {
        if (obj === null) {
            return null;
        }
        if (obj instanceof Array) {
            return extenduptolevel([], obj, level);
        }
        return extenduptolevel({}, obj, level);
    }
    return obj;
}
this.cloneuptolevel = cloneuptolevel;


function ObjforEach(object, block, context) {
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            block.call(context, object[key], key, object);
        }
    }
}

function foreach(object, block, context) {
    if (object) {
        if (typeof object === "object" && object instanceof Array) return object.forEach(object, block, context)
        else //if (typeof object === "object") // or (object instanceof Function)...
        {
            if (object) for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    block.call(context, object[key], key, object);
                }
            }
        }
    }
}
this.foreach = foreach;

/*
 hasbugs and useless yet interesting maybe developed layer for dot pathed object transformation:
 
 {
  'foo.bar':'bluebar',
  'foo.color':'blue'
 }
 
 transforemed to
 
 {
  foo:
  {
   bar:'bluebar',
   color:'blue'
  }
 }
 //
 function dotpath(data,dotkeys,create)
 {
      if(!create){var create=false;}
      if(create) if(!data) data={};
      var keys= dotkeys.split("."),value=data;
      for (var i=0;i<keys.length;i++)
      {
          if(!value[keys[i]]) //should you create one?
          {
              if(create)
                  value[keys[i]]={};
              else
                  return undefined;
          }
          value = value[keys[i]];
      }
      return value;
 }
 */

