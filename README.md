## aframe-alongpath-component
A component for [A-Frame](https://aframe.io) that allows entities to follow predefined paths.

Thanks to https://jsbin.com/dasefeh/edit?html,output for the basic concept.

![](http://lab.immersiveweb.ch/assets/aframe-alongpath-component.gif)

### Properties

| Property | Description                                                                          | Default Value |
| -------- | -----------                                                                          | ------------- |
| path     | One or more point on the path the entity should follow (Format: "x,y,z x,y,z x,y,z") | ''            |
| closed   | Whether or not the path should be closed automatically                               | false         |
| dur      | Duration in milliseconds for the object to follow the entire path                    | 1000          |
| delay    | Number of milliseconds to wait for the animation to begin                            | 2000          |
| loop     | Whether or not the animation should loop                                             | false         |
| inspect  | Whether or not the animation path should be visible and editable in A-Frame Inspector| false         |

### Usage with A-Frame Inspector

You can use the [A-Frame Inspector](https://github.com/aframevr/aframe-inspector) to manually modify the predefined paths. To do so, you can open the Inspector as usual, then set the "inspector" Property to true. This will cause the path to be displayed visually as a line while the predefined path-points (received from the "path"-Property) are showed as a small box. You can now change the path in the inspector by selecting one of the boxes and changing its position using the transformation tools of the editor. The path will change instantly.

![](http://lab.immersiveweb.ch/assets/aframe-alongpath-component-inspector.gif)

### Usage

#### Browser Installation

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.3.0/aframe.min.js"></script>
  <script src="https://rawgit.com/protyze/aframe-alongpath-component/master/dist/aframe-alongpath-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-sphere color="red" radius="0.25" position="0 0 0"
              alongpath="path:2,2,-5 -2,1,-2.5 0,1,-1; closed:false; dur:5000; delay:4000; inspect:false;">
    </a-sphere>
  </a-scene>
</body>
```

#### NPM Installation

Install via NPM:

```bash
npm install aframe-alongpath-component
```

Then register and use.

```js
require('aframe');
require('aframe-alongpath-component');
```