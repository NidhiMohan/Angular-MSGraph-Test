import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { title } from 'process';
import { jsonModel, shape } from './JsonModel';

declare var mxGraph: any;
declare var mxPoint: any;
declare var mxSwimlaneManager: any;
declare var mxUtils: any;
declare var mxCellState: any;
declare var mxGraphModel: any;
declare var mxStackLayout: any;
declare var mxLayoutManager: any;
declare var mxEllipse: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('graphContainer', { read: '', static: true }) graphContainer: ElementRef;

  ngAfterViewInit() {
    const graph = new mxGraph(this.graphContainer.nativeElement);
    // let parent = graph.getDefaultParent();
    var model = graph.getModel();
    // graph.getModel().beginUpdate();
    graph.border = 80;
    graph.getView().translate = new mxPoint(graph.border / 2, graph.border / 2);
    graph.setResizeContainer(true);
    graph.graphHandler.setRemoveCellsFromParent(false);
    // Allows new connections but no dangling edges
    graph.setConnectable(true);
    graph.setAllowDanglingEdges(false);
    // End-states are no valid sources
    var previousIsValidSource = graph.isValidSource;
    graph.isValidSource = function (cell) {
      if (previousIsValidSource.apply(this, arguments)) {
        var style = this.getModel().getStyle(cell);
        return style == null || !(style == 'end' || style.indexOf('end') == 0);
      }
      return false;
    };
    // Start-states are no valid targets, we do not
    // perform a call to the superclass function because
    // this would call isValidSource
    // Note: All states are start states in
    // the example below, so we use the state
    // style below
    graph.isValidTarget = function (cell) {
      var style = this.getModel().getStyle(cell);
      return !this.getModel().isEdge(cell) && !this.isSwimlane(cell) &&
        (style == null || !(style == 'state' || style.indexOf('state') == 0));
    };
    // Allows dropping cells into new lanes and
    // lanes into new pools, but disallows dropping
    // cells on edges to split edges
    graph.setDropEnabled(true);
    graph.setSplitEnabled(false);
    // Returns true for valid drop operations
    graph.isValidDropTarget = function (target, cells, evt) {
      if (this.isSplitEnabled() && this.isSplitTarget(target, cells, evt)) {
        return true;
      }
      var model = this.getModel();
      var lane = false;
      var pool = false;
      var cell = false;
      // Checks if any lanes or pools are selected
      for (var i = 0; i < cells.length; i++) {
        var tmp = model.getParent(cells[i]);
        lane = lane || this.isPool(tmp);
        pool = pool || this.isPool(cells[i]);

        cell = cell || !(lane || pool);
      }
      return !pool && cell != lane && ((lane && this.isPool(target)) ||
        (cell && this.isPool(model.getParent(target))));
    };
    // Adds new method for identifying a pool
    graph.isPool = function (cell) {
      var model = this.getModel();
      var parent = model.getParent(cell);
      return parent != null && model.getParent(parent) == model.getRoot();
    };
    // Changes the default vertex style in-place
    var style = graph.getStylesheet().getDefaultVertexStyle();
    style["shape"] = "swimlane";
    style["verticalAlign"] = 'middle';
    style["labelBackgroundColor"] = 'white';
    style["fontSize"] = 11;
    style["startSize"] = 28;
    style["horizontal"] = false;
    style["fontColor"] = 'black';
    style["strokeColor"] = 'black';
    delete style["fillColor"];

    style = mxUtils.clone(style);
    style["shape"] = "rectangle";
    style["fontSize"] = 10;
    style["rounded"] = true;
    style["horizontal"] = true;
    style["verticalAlign"] = 'middle';
    delete style["startSize"];
    style["labelBackgroundColor"] = 'none';
    graph.getStylesheet().putCellStyle('process', style);

    style = mxUtils.clone(style);
    style["shape"] = "ellipse";
    style["rectanglePerimeter"] = this.EllipsePerimeter;
    delete style["rounded"];
    graph.getStylesheet().putCellStyle('state', style);

    style = mxUtils.clone(style);
    style["shape"] = "rhombus";
    style["rectanglePerimeter"] = this.EllipsePerimeter;
    style["verticalAlign"] = 'top';
    style["spacingTop"] = 40;
    style["spacingRight"] = 64;
    graph.getStylesheet().putCellStyle('condition', style);

    style = mxUtils.clone(style);
    style["shape"] = "doubleEllipse";
    style["rectanglePerimeter"] = this.EllipsePerimeter;
    style["spacingTop"] = 28;
    style["fontSize"] = 14;
    style["fontStyle"] = 1;
    delete style["spacingRight"];
    graph.getStylesheet().putCellStyle('end', style);

    style = graph.getStylesheet().getDefaultEdgeStyle();
    style["edgeStyle"] = this.ElbowConnector;
    style["endArrow"] = "block";
    style["rounded"] = false;
    style["fontColor"] = 'black';
    style["strokeColor"] = 'black';

    style = mxUtils.clone(style);
    style["dashed"] = true;
    style["endArrow"] = "open";
    style["startArrow"] = "oval";
    graph.getStylesheet().putCellStyle('crossover', style);

    // Installs double click on middle control point and
    // changes style of edges between empty and this value
    graph.alternateEdgeStyle = 'elbow=vertical';

    // Adds automatic layout and various switches if the
    // graph is enabled
    if (graph.isEnabled()) {
      // Allows new connections but no dangling edges
      graph.setConnectable(true);
      graph.setAllowDanglingEdges(false);
      // End-states are no valid sources
      var previousIsValidSource = graph.isValidSource;
      graph.isValidSource = function (cell) {
        if (previousIsValidSource.apply(this, arguments)) {
          var style = this.getModel().getStyle(cell);

          return style == null || !(style == 'end' || style.indexOf('end') == 0);
        }
        return false;
      };
      // Start-states are no valid targets, we do not
      // perform a call to the superclass function because
      // this would call isValidSource
      // Note: All states are start states in
      // the example below, so we use the state
      // style below
      graph.isValidTarget = function (cell) {
        var style = this.getModel().getStyle(cell);
        return !this.getModel().isEdge(cell) && !this.isSwimlane(cell) &&
          (style == null || !(style == 'state' || style.indexOf('state') == 0));
      };
      // Allows dropping cells into new lanes and
      // lanes into new pools, but disallows dropping
      // cells on edges to split edges
      graph.setDropEnabled(true);
      graph.setSplitEnabled(false);
      // Returns true for valid drop operations
      graph.isValidDropTarget = function (target, cells, evt) {
        if (this.isSplitEnabled() && this.isSplitTarget(target, cells, evt)) {
          return true;
        }
        var model = this.getModel();
        var lane = false;
        var pool = false;
        var cell = false;
        // Checks if any lanes or pools are selected
        for (var i = 0; i < cells.length; i++) {
          var tmp = model.getParent(cells[i]);
          lane = lane || this.isPool(tmp);
          pool = pool || this.isPool(cells[i]);

          cell = cell || !(lane || pool);
        }
        return !pool && cell != lane && ((lane && this.isPool(target)) ||
          (cell && this.isPool(model.getParent(target))));
      };
      // Adds new method for identifying a pool
      graph.isPool = function (cell) {
        var model = this.getModel();
        var parent = model.getParent(cell);
        return parent != null && model.getParent(parent) == model.getRoot();
      };
      // Changes swimlane orientation while collapsed
      graph.model.getStyle = function (cell) {
        var style = mxGraphModel.prototype.getStyle.apply(this, arguments);
        if (graph.isCellCollapsed(cell)) {
          if (style != null) {
            style += ';';
          }
          else {
            style = '';
          }
          style += 'horizontal=1;align=left;spacingLeft=14;';
        }
        return style;
      };
      // Keeps widths on collapse/expand					
      var foldingHandler = function (sender, evt) {
        var cells = evt.getProperty('cells');

        for (var i = 0; i < cells.length; i++) {
          var geo = graph.model.getGeometry(cells[i]);

          if (geo.alternateBounds != null) {
            geo.width = geo.alternateBounds.width;
          }
        }
      };
      graph.addListener("foldCells", foldingHandler);
    }
    // Applies size changes to siblings and parents
    new mxSwimlaneManager(graph);
    // Creates a stack depending on the orientation of the swimlane
    var layout = new mxStackLayout(graph, false);
    // Makes sure all children fit into the parent swimlane
    layout.resizeParent = true;
    // Applies the size to children if parent size changes
    layout.fill = true;
    // Only update the size of swimlanes
    layout.isVertexIgnored = function (vertex) {
      return !graph.isSwimlane(vertex);
    }
    // Keeps the lanes and pools stacked
    var layoutMgr = new mxLayoutManager(graph);

    layoutMgr.getLayout = function (cell) {
      if (!model.isEdge(cell) && graph.getModel().getChildCount(cell) > 0 &&
        (model.getParent(cell) == model.getRoot() || graph.isPool(cell))) {
        layout.fill = graph.isPool(cell);

        return layout;
      }
      return null;
    };
    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    parent = graph.getDefaultParent();
    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();

    const json: jsonModel = {
      "DiagramType": "Flowchart",
      "Shapes": [
        {
          "Name": "Do I need more Code?",
          "Type": "process",
          "Step": 1,
          "Edges": [
            {
              "Destination": 2,
              "Text": ""
            },
            {
              "Destination": 7,
              "Text": ""
            },
          ]
        },
        {
          "Name": "Condition",
          "Type": "condition",
          "Step": 2,
          "Edges": [
            {
              "Destination": 3,
              "Text": "Yes"
            },
            {
              "Destination": 4,
              "Text": "No"
            }
          ]
        },
        {
          "Name": "Talk to the developer",
          "Type": "process",
          "Step": 3,
          "Edges": []
        },
        {
          "Name": "Close the project",
          "Type": "process",
          "Step": 4,
          "Edges": [
            {
              "Destination": 5,
              "Text": "Yes"
            },
            {
              "Destination": 6,
              "Text": "No"
            },
            {
              "Destination": 7,
              "Text": "No"
            }
          ]
        },
        {
          "Name": "Close the project",
          "Type": "process",
          "Step": 5,
          "Edges": []
        },
        {
          "Name": "Step 6",
          "Type": "process",
          "Step": 6,
          "Edges": [
            {
              "Destination": 8,
              "Text": "Yes"
            },
          ]
        },
        {
          "Name": "Step 7",
          "Type": "process",
          "Step": 7,
          "Edges": [
            
          ]
        },
        {
          "Name": "Testing",
          "Type": "process",
          "Step": 8,
          "Edges": []
        }
      ]
    };

    try {
      switch (json.DiagramType) {
        case "Flowchart": {
          this.DrawFlowChart(json.Shapes, graph);
          break;
        }
      }
    }
    finally {
      // Updates the display
      model.endUpdate();
    }
  }
  DrawFlowChart = (shapes: shape[], graph: any) => {
    shapes = shapes.sort((a, b) => (a.Step > b.Step) ? 1 : -1);
    const rootX = 100;
    const rootY = 100;

    for (let i = 0; i < shapes.length; i++) {
      let parentX: number, parentY: number = 0;
      if (!shapes[i].x && !shapes[i].y) {
        if (shapes[i].Step == 1) {
          parentX = rootX; parentY = rootY;
          shapes[i].x = rootX;
          shapes[i].y = rootY;
        } else {
          parentX = rootX; parentY = rootY * shapes[i].Step;
          shapes[i].x = rootX;
          shapes[i].y = rootY * shapes[i].Step;
        }
      } else {
        parentX = shapes[i].x;
        parentY = shapes[i].y;
      }
      const noOfEdge = shapes[i].Edges.length
      let extraX = 0;
      if (noOfEdge > 0) {
        for (let j = 0; j < noOfEdge; j++) {
          const childShape = shapes.filter(shape1 => shape1.Step == shapes[i].Edges[j].Destination);
          let indexValue = shapes.indexOf(childShape[0]);
          if (!childShape[0].x && !childShape[0].y) {
            shapes[indexValue].x = parentX + extraX;
            shapes[indexValue].y = parentY + 100;
            extraX = extraX + 240;
          }
        }
      }
    }
    this.DrawShape(shapes, graph);
  }
  DrawShape = (shapes: shape[], graph: any) => {
    shapes.forEach(shape => {
      let title = '';
      shape.Name.split(' ').forEach(element => {
        title = title + element + '\n'
      });
      if (shape.Type == 'process') {
        var process = graph.insertVertex(parent, null, shape.Name, shape.x, shape.y, 120, 60, 'process');
        shape.StepVariable = process;
      } else if (shape.Type == 'condition') {
        var condition = graph.insertVertex(parent, null, 'Contract\nConstraints?', shape.x, shape.y, 50, 50, 'condition');
        shape.StepVariable = condition;
      }
    });
    shapes.forEach(shape => {
      shape.Edges.forEach(edge => {
        var destination: shape[] = shapes.filter(shape1 => shape1.Step == edge.Destination);
        graph.insertEdge(parent, null, edge.Text, shape.StepVariable, destination[0].StepVariable);
      });
    });
  }
  EllipsePerimeter = (bounds, vertex, next, orthogonal) => {
    var x = bounds.x;
    var y = bounds.y;
    var a = bounds.width / 2;
    var b = bounds.height / 2;
    let cx: number = x + a;
    let cy: number = y + b;
    let px: number = next.x;
    let py: number = next.y;

    // Calculates straight line equation through
    // point and ellipse center y = d * x + h
    let dx: number = px - cx;
    let dy: number = py - cy;

    if (dx == 0 && dy != 0) {
      return new mxPoint(cx, cy + b * dy / Math.abs(dy));
    }
    else if (dx == 0 && dy == 0) {
      return new mxPoint(px, py);
    }

    if (orthogonal) {
      if (py >= y && py <= y + bounds.height) {
        var ty = py - cy;
        var tx = Math.sqrt(a * a * (1 - (ty * ty) / (b * b))) || 0;

        if (px <= x) {
          tx = -tx;
        }

        return new mxPoint(cx + tx, py);
      }

      if (px >= x && px <= x + bounds.width) {
        var tx = px - cx;
        var ty = Math.sqrt(b * b * (1 - (tx * tx) / (a * a))) || 0;

        if (py <= y) {
          ty = -ty;
        }

        return new mxPoint(px, cy + ty);
      }
    }

    // Calculates intersection
    var d = dy / dx;
    var h = cy - d * cx;
    var e = a * a * d * d + b * b;
    var f = -2 * cx * e;
    var g = a * a * d * d * cx * cx +
      b * b * cx * cx -
      a * a * b * b;
    var det = Math.sqrt(f * f - 4 * e * g);

    // Two solutions (perimeter points)
    var xout1 = (-f + det) / (2 * e);
    var xout2 = (-f - det) / (2 * e);
    var yout1 = d * xout1 + h;
    var yout2 = d * xout2 + h;
    var dist1 = Math.sqrt(Math.pow((xout1 - px), 2)
      + Math.pow((yout1 - py), 2));
    var dist2 = Math.sqrt(Math.pow((xout2 - px), 2)
      + Math.pow((yout2 - py), 2));

    // Correct solution
    var xout = 0;
    var yout = 0;

    if (dist1 < dist2) {
      xout = xout1;
      yout = yout1;
    }
    else {
      xout = xout2;
      yout = yout2;
    }

    return new mxPoint(xout, yout);
  }
  ElbowConnector = (state, source, target, points, result) => {
    var pt = (points != null && points.length > 0) ? points[0] : null;

    var vertical = false;
    var horizontal = false;

    if (source != null && target != null) {
      if (pt != null) {
        var left = Math.min(source.x, target.x);
        var right = Math.max(source.x + source.width,
          target.x + target.width);

        var top = Math.min(source.y, target.y);
        var bottom = Math.max(source.y + source.height,
          target.y + target.height);

        pt = state.view.transformControlPoint(state, pt);

        vertical = pt.y < top || pt.y > bottom;
        horizontal = pt.x < left || pt.x > right;
      }
      else {
        var left = Math.max(source.x, target.x);
        var right = Math.min(source.x + source.width,
          target.x + target.width);

        vertical = left == right;

        if (!vertical) {
          var top = Math.max(source.y, target.y);
          var bottom = Math.min(source.y + source.height,
            target.y + target.height);

          horizontal = top == bottom;
        }
      }
    }

    if (!horizontal && (vertical ||
      state.style["elbow"] == "vertical")) {
      this.TopToBottom(state, source, target, points, result);
    }
    else {
      this.SideToSide(state, source, target, points, result);
    }
  }
  TopToBottom = (state, source, target, points, result) => {
    var view = state.view;
    var pt = (points != null && points.length > 0) ? points[0] : null;
    var pts = state.absolutePoints;
    var p0 = pts[0];
    var pe = pts[pts.length - 1];

    if (pt != null) {
      pt = view.transformControlPoint(state, pt);
    }

    if (p0 != null) {
      source = new mxCellState();
      source.x = p0.x;
      source.y = p0.y;
    }

    if (pe != null) {
      target = new mxCellState();
      target.x = pe.x;
      target.y = pe.y;
    }

    if (source != null && target != null) {
      var t = Math.max(source.y, target.y);
      var b = Math.min(source.y + source.height,
        target.y + target.height);

      var x = view.getRoutingCenterX(source);

      if (pt != null &&
        pt.x >= source.x &&
        pt.x <= source.x + source.width) {
        x = pt.x;
      }

      var y = (pt != null) ? pt.y : Math.round(b + (t - b) / 2);

      if (!mxUtils.contains(target, x, y) &&
        !mxUtils.contains(source, x, y)) {
        result.push(new mxPoint(x, y));
      }

      if (pt != null &&
        pt.x >= target.x &&
        pt.x <= target.x + target.width) {
        x = pt.x;
      }
      else {
        x = view.getRoutingCenterX(target);
      }

      if (!mxUtils.contains(target, x, y) &&
        !mxUtils.contains(source, x, y)) {
        result.push(new mxPoint(x, y));
      }

      if (result.length == 1) {
        if (pt != null && result.length == 1) {
          if (!mxUtils.contains(target, pt.x, y) &&
            !mxUtils.contains(source, pt.x, y)) {
            result.push(new mxPoint(pt.x, y));
          }
        }
        else {
          var l = Math.max(source.x, target.x);
          var r = Math.min(source.x + source.width,
            target.x + target.width);

          result.push(new mxPoint(l + (r - l) / 2, y));
        }
      }
    }
  }
  SideToSide = (state, source, target, points, result) => {
    var view = state.view;
    var pt = (points != null && points.length > 0) ? points[0] : null;
    var pts = state.absolutePoints;
    var p0 = pts[0];
    var pe = pts[pts.length - 1];

    if (pt != null) {
      pt = view.transformControlPoint(state, pt);
    }

    if (p0 != null) {
      source = new mxCellState();
      source.x = p0.x;
      source.y = p0.y;
    }

    if (pe != null) {
      target = new mxCellState();
      target.x = pe.x;
      target.y = pe.y;
    }

    if (source != null && target != null) {
      var l = Math.max(source.x, target.x);
      var r = Math.min(source.x + source.width,
        target.x + target.width);

      var x = (pt != null) ? pt.x : Math.round(r + (l - r) / 2);

      var y1 = view.getRoutingCenterY(source);
      var y2 = view.getRoutingCenterY(target);

      if (pt != null) {
        if (pt.y >= source.y && pt.y <= source.y + source.height) {
          y1 = pt.y;
        }

        if (pt.y >= target.y && pt.y <= target.y + target.height) {
          y2 = pt.y;
        }
      }

      if (!mxUtils.contains(target, x, y1) &&
        !mxUtils.contains(source, x, y1)) {
        result.push(new mxPoint(x, y1));
      }

      if (!mxUtils.contains(target, x, y2) &&
        !mxUtils.contains(source, x, y2)) {
        result.push(new mxPoint(x, y2));
      }

      if (result.length == 1) {
        if (pt != null) {
          if (!mxUtils.contains(target, x, pt.y) &&
            !mxUtils.contains(source, x, pt.y)) {
            result.push(new mxPoint(x, pt.y));
          }
        }
        else {
          var t = Math.max(source.y, target.y);
          var b = Math.min(source.y + source.height,
            target.y + target.height);

          result.push(new mxPoint(x, t + (b - t) / 2));
        }
      }
    }
  }
}

// for (let i = 0; i < shapes.length; i++) {
    //   if (shapes[i].Step == 1) {
    //     shapes[i].x = x;
    //     shapes[i].y = y;
    //   } else {
    //     if (shapes[i].Type == 'Condition') {
    //       shapes[i].x = x;
    //       shapes[i].y = y * shapes[i].Step;
    //     } else if (shapes[i].Type == 'process') {
    //       var parentShape = shapes.filter(shape2 => shape2.Parent == shapes[i].Parent);
    //       if (parentShape[0].Type == 'process') {
    //         shapes[i].x = x;
    //         shapes[i].y = y * shapes[i].Step;
    //       } else if (parentShape[0].Type == "condition") {

    //       }


    //       // if (shapes[i - 1].Type == 'process') {
    //       //   shapes[i].x = 100 * shapes[i].Step;
    //       //   shapes[i].y = 100 * shapes[i].Step;
    //       // } else if ((shapes[i - 1].Type == 'Condition')) {
    //       //   // if() shapes[i - 1].Edges
    //       // }
    //     }
    //   }
    // }

  // addListener = () => {
  //   var updateListenerList = function (element, eventName, funct) {
  //     if (element.mxListenerList == null) {
  //       element.mxListenerList = [];
  //     }

  //     var entry = { name: eventName, f: funct };
  //     element.mxListenerList.push(entry);
  //   };

  //   if (window.addEventListener) {
  //     // Checks if passive event listeners are supported
  //     // see https://github.com/Modernizr/Modernizr/issues/1894
  //     var supportsPassive = false;

  //     try {
  //       document.addEventListener('test', function () { }, Object.defineProperty &&
  //         Object.defineProperty({}, 'passive', {
  //           get: function () { supportsPassive = true; }
  //         }));
  //     }
  //     catch (e) {
  //       // ignore
  //     }

  //     return function (element, eventName, funct) {
  //       element.addEventListener(eventName, funct,
  //         (supportsPassive) ?
  //           { passive: false } : false);
  //       updateListenerList(element, eventName, funct);
  //     };
  //   }
  //   else {
  //     return function (element, eventName, funct) {
  //       element.attachEvent('on' + eventName, funct);
  //       updateListenerList(element, eventName, funct);
  //     };
  //   }
  // }

 // var pool1 = graph.insertVertex(parent, null, 'Express Reporting', 0, 0, 640, 0);
      // pool1.setConnectable(false);

      // var lane1a = graph.insertVertex(pool1, null, 'Consultant', 0, 0, 640, 150);
      // lane1a.setConnectable(false);

      // var lane1b = graph.insertVertex(pool1, null, 'Manager', 0, 0, 640, 150);
      // lane1b.setConnectable(false);

      // var lane1c = graph.insertVertex(pool1, null, 'Data Entry Clerk', 0, 0, 640, 150);
      // lane1b.setConnectable(false);

      // var pool2 = graph.insertVertex(parent, null, 'Pool 2', 0, 0, 640, 0);
      // pool2.setConnectable(false);

      // var lane2a = graph.insertVertex(pool2, null, 'Lane A', 0, 0, 640, 140);
      // lane2a.setConnectable(false);

      // var lane2b = graph.insertVertex(pool2, null, 'Lane B', 0, 0, 640, 110);
      // lane2b.setConnectable(false);

      // var start1 = graph.insertVertex(lane1a, null, null, 40, 40, 30, 30, 'state');
      // var end1 = graph.insertVertex(lane1a, null, 'A', 560, 40, 30, 30, 'end');

      // var step1 = graph.insertVertex(lane1a, null, 'Submit\nExpense\nReport', 60, 30, 80, 50, 'process');
      // var step2 = graph.insertVertex(lane1b, null, 'Submit\nExpense\nReport', 60, 30, 80, 50, 'process');
      // var step3 = graph.insertVertex(lane1b, null, 'Correct\nReport?', 210, 20, 60, 60, 'condition');
      // var step4 = graph.insertVertex(lane1b, null, 'Forward\nReport', 330, 55, 80, 50, 'process');
      // var step5 = graph.insertVertex(lane1b, null, 'Return\nReport', 450, 5, 80, 50, 'process');


      // var step6 = graph.insertVertex(lane1c, null, 'Enter\nData to\nSystem', 330, 30, 80, 50, 'process');


      // var start2 = graph.insertVertex(lane2b, null, null, 40, 40, 30, 30, 'state');

      // var step2 = graph.insertVertex(lane2b, null, 'Receive\nRequest', 90, 30, 80, 50, 'process');
      // var step22 = graph.insertVertex(lane2b, null, 'Refer to Tap\nSystems\nCoordinator', 190, 30, 80, 50, 'process');

      // var step3 = graph.insertVertex(lane1b, null, 'Request 1st-\nGate\nInformation', 190, 30, 80, 50, 'process');
      // var step33 = graph.insertVertex(lane1b, null, 'Receive 1st-\nGate\nInformation', 290, 30, 80, 50, 'process');

      // var step4 = graph.insertVertex(lane2a, null, 'Receive and\nAcknowledge', 290, 20, 80, 50, 'process');
      // var step44 = graph.insertVertex(lane2a, null, 'Contract\nConstraints?', 400, 20, 50, 50, 'condition');
      // var step444 = graph.insertVertex(lane2a, null, 'Tap for gas\ndelivery?', 480, 20, 50, 50, 'condition');

      // var end2 = graph.insertVertex(lane2a, null, 'B', 560, 30, 30, 30, 'end');
      // var end3 = graph.insertVertex(lane2a, null, 'C', 560, 84, 30, 30, 'end');

      // var e = null;

      // graph.insertEdge(parent, null, null, step1, step2);
      // graph.insertEdge(parent, null, null, step2, step3);
      // graph.insertEdge(parent, null, null, step3, step4);

      // graph.insertEdge(parent, null, null, step3, step5);
      // graph.insertEdge(parent, null, null, step4, step6);
      // graph.insertEdge(parent, null, null, step22, step3);

      // graph.insertEdge(lane1b, null, null, step3, step33);
      // graph.insertEdge(lane2a, null, null, step4, step44);
      // graph.insertEdge(lane2a, null, 'No', step44, step444, 'verticalAlign=bottom');
      // graph.insertEdge(parent, null, 'Yes', step44, step111, 'verticalAlign=bottom;horizontal=0;labelBackgroundColor=white;');

      // graph.insertEdge(lane2a, null, 'Yes', step444, end2, 'verticalAlign=bottom');
      // e = graph.insertEdge(lane2a, null, 'No', step444, end3, 'verticalAlign=top');
      // e.geometry.points = [new mxPoint(step444.geometry.x + step444.geometry.width / 2,
      //   end3.geometry.y + end3.geometry.height / 2)];

      // graph.insertEdge(parent, null, null, step1, step2, 'crossover');
      // graph.insertEdge(parent, null, null, step3, step11, 'crossover');
      // e = graph.insertEdge(lane1a, null, null, step11, step33, 'crossover');
      // e.geometry.points = [new mxPoint(step33.geometry.x + step33.geometry.width / 2 + 20,
      //   step11.geometry.y + step11.geometry.height * 4 / 5)];
      // graph.insertEdge(parent, null, null, step33, step4);
      // graph.insertEdge(lane1a, null, null, step111, end1);