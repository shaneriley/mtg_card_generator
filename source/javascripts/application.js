$(function() {
  var ctx = $("canvas")[0].getContext("2d");
  var frames = {
    types: ["lands", "mask"],
    loaded: false,
    callbacks: [],
    data: {},
    preload: function() {
      var temp_store = {}, loaded = 0;
      $.each(frames.types, function(i, type) {
        var len = 0;
        temp_store[type] = {};
        $.each(frames[type], function(j, path) {
          var img = $("<img />", { src: path.replace(/^\w+\//, "") }).load(function() {
            temp_store[type][path.split("/")[3].replace(/\..+/, "")] = img;
            if (++len === frames[type].length) {
              frames[type] = temp_store[type];
              if (++loaded === frames.types.length) { frames.loaded = true; }
            }
          });
        });
      });
    },
    draw: function(img, opts) {
      img = img.length ? img[0] : img;
      if (!$.isArray(opts.color)) { opts.color = [opts.color]; }
      ctx.drawImage(img, 0, 0);
      $.each(opts.color, function(i, color) {
        ctx.drawImage(frames[opts.type][color + (i ? "_half" : "")][0], 0, 0);
      });
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(frames.mask.corners[0], 0, 0);
      ctx.restore();
      frames.drawTitle();
      frames.drawText();
      frames.drawCastingCost();
      $(ctx.canvas).show();
    },
    drawTitle: function() {
      ctx.save();
      ctx.font = "bold 48px Matrix";
      ctx.textBaseline = "top";
      ctx.fillText(frames.data.name, 75, 80);
      ctx.restore();
    },
    drawText: function() {
      if (!frames.data.text) { return; }
      var lines;

      ctx.save();
      ctx.fillStyle = "#cccccc";
      ctx.globalAlpha = .2;
      ctx.fillRect(73, 706, 651, 290);
      ctx.globalAlpha = 1;
      ctx.font = "bold 38px Matrix";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#000000";
      ctx.fillText(frames.data.type, 78, 713);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(frames.data.type, 80, 710);
      ctx.font = "normal 36px Plantin";
      lines = frames.splitLines(frames.data.text, 640);
      frames.writeLines(lines, 80, 760);
      ctx.restore();
    },
    drawCastingCost: function() {
      if (!frames.data.cost) { return; }
      frames.data.cost = frames.data.cost.toUpperCase();
      var symbols = frames.data.cost.match(/(\d+|[A-Z])/g).reverse(),
          symbol_width = 43,
          colors = {
            B: "#d5cfcf",
            G: "#a6debb",
            R: "#fcb392",
            U: "#a8e0f9",
            W: "#fffdea"
          };
      ctx.save();
      ctx.font = "normal 40px 'Magic Symbols 2008'";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      symbols.forEach(function(symbol, i) {
        ctx.fillStyle = "#000000";
        ctx.fillText("O1", 722 - i * symbol_width, 74);
        ctx.fillStyle = symbol in colors ? colors[symbol] : colors.B;
        ctx.fillText("O1", 724 - i * symbol_width, 72);
        ctx.fillStyle = "#000000";
        ctx.fillText(symbol, 728 - i * symbol_width, 72);
      });
      ctx.restore();
    },
    writeLines: function(lines, x, y) {
      ctx.save();
      var h = +ctx.font.replace(/\D/g, "") + 10;
      lines.forEach(function(line, i) {
        ctx.fillStyle = "#000000";
        ctx.fillText(line, x - 2, y + 3 + h * i);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(line, x, y + h * i);
      });
      ctx.restore();
    },
    splitLines: function(text, width) {
      var words = text.split(" "),
          lines = [""], text_width;
      words.forEach(function(word, i) {
        text_width = ctx.measureText(lines[lines.length - 1] + " " + word).width;
        if (text_width > 640) { lines.push(word + " "); }
        else { lines[lines.length - 1] += word + " "; }
      });
      return lines;
    },
    ready: function(cb) {
      cb && frames.callbacks.push(cb);
      if (frames.loaded) {
        $.each(frames.callbacks, function(i, fn) {
          fn();
        });
        frames.callbacks = [];
      }
      else { setTimeout(frames.ready, 30); }
    }
  };

  $.extend(frames, $(ctx.canvas).data("frames"));

  frames.preload();
  $("img").load(function() {
    frames.ready(function() {
      $("input[type=submit]").val("Create").removeAttr("disabled");
    });
  });

  $("form").submit(function(e) {
    e.preventDefault();
    var $inputs = $(this).find(":input:not(:submit)");
    $inputs.each(function(i) {
      frames.data[$inputs.eq(i).attr("name")] = $inputs.eq(i).val();
    });
    frames.data.color = frames.data.color ? frames.data.color.split(" ") : ["colorless"];
    if (frames.data.color.length > 2) { frames.data.color = "multi"; }
    frames.draw($("img"), { type: "lands", color: frames.data.color });
  });
});
